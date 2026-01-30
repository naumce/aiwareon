import { supabase, isSupabaseConfigured } from './supabaseClient';
import { createAppError, type AppError } from '../lib/errors';
import { virtualTryOn as virtualTryOnFal, enhanceToStudio } from './falService';
import { describeGarment, virtualTryOn as virtualTryOnGemini } from './geminiService';

interface GenerationResult {
    success: boolean;
    generationId?: string;
    resultUrl?: string;
    creditsUsed?: number;
    error?: AppError;
}

interface GenerationOptions {
    personImageBase64: string;
    dressImageBase64: string;
    quality?: 'standard' | 'studio';
    modelType?: 'fal' | 'gemini2' | 'geminipro';
    category?: 'tops' | 'bottoms' | 'one-pieces';
    userPrompt?: string;
}

/**
 * Generate a virtual try-on image using frontend AI SDK
 * Credit management still done server-side for security
 */
export async function generateTryOn(options: GenerationOptions): Promise<GenerationResult> {
    if (!isSupabaseConfigured() || !supabase) {
        return {
            success: false,
            error: createAppError('SERVICE_UNAVAILABLE', 'Supabase not configured'),
        };
    }

    const { personImageBase64, dressImageBase64, quality = 'standard' } = options;
    const creditCost = quality === 'studio' ? 2 : 1;
    let generationId: string | undefined;

    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw createAppError('AUTH_REQUIRED', 'Please sign in to generate images');
        }

        // Helper to get credit balance
        const getCreditBalance = async (userId: string): Promise<number> => {
            const { data: ledgerData } = await supabase!
                .from('credit_ledger')
                .select('delta')
                .eq('user_id', userId);
            return ledgerData?.reduce((sum: number, row: any) => sum + row.delta, 0) || 0;
        };

        // Check balance
        const balance = await getCreditBalance(user.id);
        if (balance < creditCost) {
            throw createAppError('INSUFFICIENT_CREDITS', `Need ${creditCost} credits (Balance: ${balance})`);
        }

        // Step 1: Create generation record
        const { data: genData, error: genError } = await supabase
            .from('generations')
            .insert({
                user_id: user.id,
                state: 'processing', // Correct column name is 'state'
                credits_cost: creditCost,
                // provider/quality/prompt columns do not exist in schema
            })
            .select()
            .single();

        if (genError) throw genError;
        generationId = genData.id;

        // Step 2: Deduct credits
        const { error: creditError } = await supabase
            .from('credit_ledger')
            .insert({
                user_id: user.id,
                delta: -creditCost,
                reason: 'generation',
                reference_id: generationId // Correct column name
                // metadata column does not exist
            });

        if (creditError) throw creditError;

        // Step 3: Update local state to processing (notify) - This is now handled by the initial insert setting status to 'processing'
        // await supabase
        //     .from('generations')
        //     .update({ state: 'processing' })
        //     .eq('id', generationId);

        // Step 4-5: Generate based on selected model
        const modelType = options.modelType || 'fal';
        let geminiCategory = options.category || 'one-pieces';
        let description = options.category ? `A fashionable ${options.category}` : '';

        // Only analyze garment with Gemini if using Fal AND no category provided
        if (modelType === 'fal' && !options.category) {
            console.log('🔍 STEP 1: Analyzing garment with Gemini...');
            const rawGeminiResponse = await describeGarment(dressImageBase64);
            console.log('🔍 STEP 2: Raw Gemini response:', rawGeminiResponse);

            try {
                const cleanJson = rawGeminiResponse.replace(/```json|```/g, "").trim();
                console.log('🔍 STEP 3: Cleaned JSON:', cleanJson);

                const parsed = JSON.parse(cleanJson);
                console.log('🔍 STEP 4: Parsed object:', parsed);

                if (parsed.error === "INVALID_GARMENT") {
                    console.log('🔍 STEP 5: Invalid garment detected, refunding');
                    await supabase!.from('credit_ledger').insert({
                        user_id: user.id,
                        delta: creditCost,
                        reason: 'refund_invalid_garment'
                    });
                    await supabase!.from('generations').update({ state: 'failed' }).eq('id', generationId);
                    return {
                        success: false,
                        generationId,
                        error: createAppError('INVALID_INPUT', 'Please upload a clear clothing item.')
                    };
                }
                geminiCategory = parsed.category;
                description = parsed.description;
                console.log('🔍 STEP 6: Successfully extracted:', { category: geminiCategory, description });
            } catch (e) {
                console.error("🔍 STEP 7: JSON parsing failed:", e);
                console.warn("Using raw response as description");
                description = rawGeminiResponse;
            }
        }

        console.log('🔍 STEP 8: About to check modelType. Current value:', modelType);

        // Step 5: Generate based on selected model
        let resultImageUrl: string;

        if (modelType === 'gemini2' || modelType === 'geminipro') {
            // GEMINI PATH: Direct virtualTryOn
            console.log(`🔵 Using ${modelType === 'geminipro' ? 'Gemini 3 Pro' : 'Gemini 2.5 Flash'}...`);
            console.log('📸 Person image length:', personImageBase64.substring(0, 50) + '...');
            console.log('👗 Dress image length:', dressImageBase64.substring(0, 50) + '...');
            console.log('🎯 Model type:', modelType);
            console.log('💬 User prompt:', options.userPrompt || '(none)');
            resultImageUrl = await virtualTryOnGemini(personImageBase64, dressImageBase64, modelType, 2, options.userPrompt);
        } else {
            // FAL PATH: Use analyzed description
            console.log('🟣 Using Fal AI IDM-VTON...');
            console.log('🟣 Calling falService.virtualTryOn with:', {
                personImageLength: personImageBase64.substring(0, 50),
                dressImageLength: dressImageBase64.substring(0, 50),
                description,
                geminiCategory,
                quality
            });

            resultImageUrl = await virtualTryOnFal(personImageBase64, dressImageBase64, description, geminiCategory, quality);
            console.log('🟣 Fal returned URL:', resultImageUrl.substring(0, 100));

            if (quality === 'studio') {
                console.log('🎨 Applying Studio Pass: 2x upscale...');
                resultImageUrl = await enhanceToStudio(resultImageUrl);
            }
        }

        // Step 6: Convert to base64 if needed (Fal returns URL)
        let resultBase64: string;
        if (modelType === 'fal') {
            const response = await fetch(resultImageUrl);
            const blob = await response.blob();
            resultBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } else {
            // Gemini models already return base64
            resultBase64 = resultImageUrl;
        }

        // Step 7: Upload BOTH person photo and result photo (for testing period)
        const personFileName = `${user.id}/person/${generationId}.png`;
        const resultFileName = `${user.id}/result/${generationId}.png`;

        // Convert person image to buffer (handle both Base64 and URL)
        let personBuffer: Uint8Array;
        if (personImageBase64.startsWith('data:')) {
            const personBase64Data = personImageBase64.split(',')[1];
            personBuffer = Uint8Array.from(atob(personBase64Data), c => c.charCodeAt(0));
        } else {
            // Assume URL (Example or Previous Generation)
            const resp = await fetch(personImageBase64);
            const blob = await resp.blob();
            const arrayBuffer = await blob.arrayBuffer();
            personBuffer = new Uint8Array(arrayBuffer);
        }

        // Convert result image to buffer
        const resultBase64Data = resultBase64.split(',')[1];
        const resultBuffer = Uint8Array.from(atob(resultBase64Data), c => c.charCodeAt(0));

        // Upload both images in parallel
        const [personUpload, resultUpload] = await Promise.all([
            supabase!.storage
                .from('aiwear-media')
                .upload(personFileName, personBuffer, {
                    contentType: 'image/png',
                    upsert: true,
                }),
            supabase!.storage
                .from('aiwear-media')
                .upload(resultFileName, resultBuffer, {
                    contentType: 'image/png',
                    upsert: true,
                })
        ]);

        if (personUpload.error || resultUpload.error) {
            throw new Error('Failed to upload images');
        }

        // Get public URLs for both
        const { data: personUrlData } = supabase!.storage
            .from('aiwear-media')
            .getPublicUrl(personFileName);

        const { data: resultUrlData } = supabase!.storage
            .from('aiwear-media')
            .getPublicUrl(resultFileName);

        // Step 8: Update generation to succeeded
        await supabase!
            .from('generations')
            .update({
                state: 'succeeded',
                result_path: resultFileName,
                updated_at: new Date().toISOString()
            })
            .eq('id', generationId);

        // Note: Person URL and other metadata stored in media_items instead

        // Step 9: Save result to media_items for gallery
        await supabase!
            .from('media_items')
            .insert({
                user_id: user.id,
                object_path: resultFileName,  // Correct column name!
                kind: 'result',                // Correct column name!
                generation_id: generationId
            });

        console.log('📊 Testing Data Saved:', {
            person_url: personUrlData.publicUrl,
            result_url: resultUrlData.publicUrl,
            quality: quality,
            description: description,
            category: geminiCategory,
            generation_id: generationId
        });

        // Get signed URL
        const { data: signedUrl } = await supabase!.storage
            .from('aiwear-media')
            .createSignedUrl(resultFileName, 3600);

        return {
            success: true,
            generationId,
            resultUrl: signedUrl?.signedUrl || resultUrlData.publicUrl,
            creditsUsed: creditCost,
        };

    } catch (err) {
        // Refund credits on failure
        if (generationId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('credit_ledger')
                    .insert({
                        user_id: user.id,
                        delta: creditCost,
                        reason: 'generation_failed',
                        reference_id: generationId
                    });
            }

            await supabase
                .from('generations')
                .update({
                    state: 'failed',
                    error_message: err instanceof Error ? err.message : 'Generation failed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', generationId);
        }

        return {
            success: false,
            generationId,
            error: createAppError('GENERATION_FAILED', err instanceof Error ? err.message : 'Unknown error'),
        };
    }
}
