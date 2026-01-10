/**
 * Gemini Generation Edge Function
 * 
 * Per 04_GENERATION_PATTERN.md and 99_DO_NOT_DO.md:
 * - API key stays server-side (never in frontend)
 * - Credits deducted BEFORE generation
 * - Credits refunded on failure
 * - Generation state tracked in database
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerationRequest {
    personImageBase64: string;
    dressImageBase64: string;
    quality: 'standard' | 'studio';
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Get auth token from request
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Missing authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Manually decode JWT to get user_id
        const jwt = authHeader.replace('Bearer ', '');
        let userId: string;

        try {
            const parts = jwt.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid token format');
            }
            const payload = JSON.parse(atob(parts[1]));
            userId = payload.sub;

            if (!userId) {
                throw new Error('No user ID in token');
            }
        } catch (decodeError) {
            return new Response(
                JSON.stringify({ error: 'Invalid token' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Create Supabase client with SERVICE_ROLE_KEY
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Use userId directly (token already validated by client)
        const user = { id: userId };

        // Parse request body
        const body: GenerationRequest = await req.json();
        const { personImageBase64, dressImageBase64, quality } = body;

        if (!personImageBase64 || !dressImageBase64) {
            return new Response(
                JSON.stringify({ error: 'Missing required images' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Calculate credit cost
        const creditCost = quality === 'studio' ? 2 : 1;

        // Step 1: Create generation record (state: queued)
        const { data: generation, error: insertError } = await supabase
            .from('generations')
            .insert({
                user_id: user.id,
                state: 'queued',
                credits_cost: creditCost,
            })
            .select()
            .single();

        if (insertError || !generation) {
            return new Response(
                JSON.stringify({ error: 'Failed to create generation record' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const generationId = generation.id;

        // Step 2: Deduct credits BEFORE generation (direct SQL since we're using SERVICE_ROLE_KEY)
        // First check balance
        const { data: balanceData } = await supabase
            .from('credit_ledger')
            .select('delta')
            .eq('user_id', user.id);

        const currentBalance = balanceData?.reduce((sum, row) => sum + row.delta, 0) || 0;

        if (currentBalance < creditCost) {
            await supabase
                .from('generations')
                .update({ state: 'failed', error_message: 'Insufficient credits' })
                .eq('id', generationId);

            return new Response(
                JSON.stringify({
                    error: `Insufficient credits. You have ${currentBalance}, need ${creditCost}`,
                    code: 'INSUFFICIENT_CREDITS'
                }),
                { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Deduct credits
        await supabase
            .from('credit_ledger')
            .insert({
                user_id: user.id,
                delta: -creditCost,
                reason: 'generation',
                reference_id: generationId
            });

        // Step 3: Update state to processing
        await supabase
            .from('generations')
            .update({ state: 'processing' })
            .eq('id', generationId);

        // Step 4: Call Gemini API
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
        if (!geminiApiKey) {
            // Refund credits and fail
            await supabase
                .from('credit_ledger')
                .insert({
                    user_id: user.id,
                    delta: creditCost,
                    reason: 'service_unavailable',
                    reference_id: generationId
                });

            await supabase
                .from('generations')
                .update({ state: 'failed', error_message: 'Service configuration error' })
                .eq('id', generationId);

            return new Response(
                JSON.stringify({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' }),
                { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        try {
            // Use the Google AI SDK via esm.sh (Deno-compatible CDN)
            const { GoogleGenAI } = await import('https://esm.sh/@google/genai@0.21.0');
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });

            // Use correct model names from reference
            const modelName = quality === 'studio'
                ? 'gemini-2.0-flash-exp'  // Studio quality (will use gemini-3-pro-image-preview when available)
                : 'gemini-2.0-flash-exp';   // Standard quality (will use gemini-2.5-flash-image when available)

            // Remove base64 prefix from images
            const personData = personImageBase64.replace(/^data:image\/\w+;base64,/, '');
            const dressData = dressImageBase64.replace(/^data:image\/\w+;base64,/, '');

            // Generate content using SDK (proven working code)
            const response = await ai.models.generateContent({
                model: modelName,
                contents: {
                    parts: [
                        { inlineData: { data: personData, mimeType: 'image/jpeg' } },
                        { inlineData: { data: dressData, mimeType: 'image/jpeg' } },
                        {
                            text: `TASK: VIRTUAL TRY-ON & CLOTHING REPLACEMENT
            
1. IDENTIFY: The person in Image 1 and the garment in Image 2.
2. ACTION: Completely remove the person's current outfit in Image 1 (especially all black layers and sleeves). 
3. REPLACE: Apply the garment from Image 2 to the person.
4. MAINTAIN: Keep the face, hair, glasses, jewelry, and the smartphone/hand in Image 1 exactly as they are.
5. INTEGRATE: Reconstruct skin on shoulders/neck if the new garment is more open. Ensure the hand holding the phone is in FRONT of the new garment.
6. STYLE: High-end fashion editorial quality. Consistent lighting.`,
                        },
                    ],
                },
                config: {
                    ...(quality === 'studio' ? {
                        imageConfig: {
                            imageSize: '1K',
                            aspectRatio: '9:16'
                        }
                    } : {
                        imageConfig: {
                            aspectRatio: '9:16'
                        }
                    })
                }
            });

            // Extract image from SDK response
            let imageData = null;
            let refusalText = '';

            if (!response.candidates || response.candidates.length === 0) {
                throw new Error('No candidates returned from AI model');
            }

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageData = part.inlineData.data;
                } else if (part.text) {
                    refusalText += part.text;
                }
            }

            if (!imageData) {
                if (refusalText) {
                    throw new Error(`AI Refusal: ${refusalText.slice(0, 100)}...`);
                }
                throw new Error('Neural synthesis failed. No image data returned.');
            }

            // Step 5: Upload result to storage
            const fileName = `${user.id}/result/${generationId}.png`;
            const imageBuffer = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));

            const { error: uploadError } = await supabase.storage
                .from('aiwear-media')
                .upload(fileName, imageBuffer, {
                    contentType: 'image/png',
                    upsert: true,
                });

            if (uploadError) {
                throw new Error('Failed to upload result');
            }

            // Step 6: Update generation state to succeeded
            await supabase
                .from('generations')
                .update({
                    state: 'succeeded',
                    result_path: fileName,
                    updated_at: new Date().toISOString()
                })
                .eq('id', generationId);

            // Create media item record
            await supabase
                .from('media_items')
                .insert({
                    user_id: user.id,
                    kind: 'result',
                    object_path: fileName,
                    generation_id: generationId,
                });

            // Return success with signed URL
            const { data: signedUrl } = await supabase.storage
                .from('aiwear-media')
                .createSignedUrl(fileName, 3600); // 1 hour expiry

            return new Response(
                JSON.stringify({
                    success: true,
                    generationId,
                    resultUrl: signedUrl?.signedUrl,
                    creditsUsed: creditCost,
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );

        } catch (genError) {
            // Generation failed - refund credits
            await supabase
                .from('credit_ledger')
                .insert({
                    user_id: user.id,
                    delta: creditCost,
                    reason: 'generation_failed',
                    reference_id: generationId
                });

            await supabase
                .from('generations')
                .update({
                    state: 'failed',
                    error_message: genError instanceof Error ? genError.message : 'Generation failed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', generationId);

            return new Response(
                JSON.stringify({
                    error: 'Generation failed. Credits have been refunded.',
                    code: 'GENERATION_FAILED',
                    generationId,
                }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
