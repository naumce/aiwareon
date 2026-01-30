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
    modelType?: 'gemini2' | 'geminipro' | 'fal';
    userPrompt?: string;
    category?: 'tops' | 'bottoms' | 'one-pieces';
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

        const user = { id: userId };

        // Parse request body
        const body: GenerationRequest = await req.json();
        const {
            personImageBase64,
            dressImageBase64,
            quality = 'standard',
            modelType = 'gemini2',
            userPrompt,
            category
        } = body;

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

        // Step 2: Check balance
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

        // Step 3: Deduct credits
        await supabase
            .from('credit_ledger')
            .insert({
                user_id: user.id,
                delta: -creditCost,
                reason: 'generation',
                reference_id: generationId
            });

        // Update state to processing
        await supabase
            .from('generations')
            .update({ state: 'processing' })
            .eq('id', generationId);

        // Step 4: Generate image
        let imageData: string | null = null;

        try {
            if (modelType === 'fal') {
                // FAL AI GENERATION
                imageData = await generateWithFal(personImageBase64, dressImageBase64, category || 'one-pieces', quality);
            } else {
                // GEMINI GENERATION via REST API (SDK not available in Edge Functions)
                const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
                if (!geminiApiKey) {
                    throw new Error('GEMINI_API_KEY not configured');
                }

                // Use gemini-2.5-flash-image as requested by user (same as frontend)
                const targetModel = 'gemini-2.5-flash-image';

                // Remove base64 prefix
                const personData = personImageBase64.replace(/^data:image\/\w+;base64,/, '');
                const dressData = dressImageBase64.replace(/^data:image\/\w+;base64,/, '');

                const prompt = `VIRTUAL TRY-ON - EXACT GARMENT REPLACEMENT ONLY
            
CRITICAL RULES:
- DO NOT add any clothing items not present in Image 2
- DO NOT reinterpret or "enhance" the outfit
- This is a SWAP operation, not a styling session

PERSON (Image 1):
Keep 100% identical: face, skin tone, hair, body pose, background
Preserve visible items: sunglasses, earrings, jewelry, phone in hand

GARMENT (Image 2):
Use ONLY this item. Copy its exact: color, pattern, fabric texture, cut
If it's a dress, output a dress. If it's a top, output a top.

REPLACEMENT:
1. Remove the existing outfit from Image 1
2. Place the garment from Image 2 onto the person's body
3. Ensure natural draping and fit
4. Blend skin to match Image 1's skin tone
5. Keep the phone/hand in foreground

OUTPUT: High-quality editorial photo, photorealistic.
${userPrompt ? `\nSTYLING CONTEXT: ${userPrompt}` : ''}`;

                // REST API call with responseModalities (THIS IS THE KEY FIX)
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${geminiApiKey}`;

                const requestBody = {
                    contents: [{
                        parts: [
                            { inlineData: { mimeType: 'image/jpeg', data: personData } },
                            { inlineData: { mimeType: 'image/jpeg', data: dressData } },
                            { text: prompt }
                        ]
                    }],
                    generationConfig: {
                        responseModalities: ["image", "text"]
                    }
                };

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
                }

                const result = await response.json();

                // Extract image from response
                let refusalText = '';
                if (result.candidates && result.candidates.length > 0) {
                    for (const part of result.candidates[0].content.parts) {
                        if (part.inlineData?.data) {
                            imageData = part.inlineData.data;
                        } else if (part.text) {
                            refusalText += part.text;
                        }
                    }
                }

                if (!imageData) {
                    if (refusalText) {
                        console.warn('Refusal:', refusalText);
                        throw new Error(`Gemini Refusal: ${refusalText}`);
                    }
                    throw new Error('Gemini synthesis failed - no image data returned.');
                }
            }

            if (!imageData) {
                throw new Error('No image data generated');
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

            // Step 6: Update generation state
            await supabase
                .from('generations')
                .update({
                    state: 'succeeded',
                    result_path: fileName,
                    updated_at: new Date().toISOString()
                })
                .eq('id', generationId);

            // Step 7: Save to media_items
            await supabase
                .from('media_items')
                .insert({
                    user_id: user.id,
                    kind: 'result',
                    object_path: fileName,
                    generation_id: generationId,
                });

            // Get signed URL
            const { data: signedUrl } = await supabase.storage
                .from('aiwear-media')
                .createSignedUrl(fileName, 3600);

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
            // Refund credits on failure
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

            console.error('Generation error:', genError);

            return new Response(
                JSON.stringify({
                    error: genError instanceof Error ? genError.message : 'Generation failed',
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

// ------------------------------------------
// FAL.AI Implementation
// ------------------------------------------
async function generateWithFal(
    personBase64: string,
    dressBase64: string,
    category: string,
    quality: 'standard' | 'studio'
): Promise<string> {
    const falApiKey = Deno.env.get('FAL_API_KEY');
    if (!falApiKey) {
        throw new Error('FAL_API_KEY is not configured');
    }

    // Upload to Fal storage first
    const personUrl = await uploadToFal(personBase64, falApiKey);
    const dressUrl = await uploadToFal(dressBase64, falApiKey);

    // Map category
    const categoryMapping: Record<string, string> = {
        'tops': 'upper_body',
        'bottoms': 'lower_body',
        'one-pieces': 'dresses'
    };
    const falCategory = categoryMapping[category] || 'dresses';

    console.log(`Calling Fal IDM-VTON (${falCategory})...`);

    const response = await fetch('https://queue.fal.run/fal-ai/idm-vton', {
        method: 'POST',
        headers: {
            'Authorization': `Key ${falApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            human_image_url: personUrl,
            garment_image_url: dressUrl,
            description: `A fashionable ${category}`,
            category: falCategory,
            garment_photo_type: "auto",
            num_inference_steps: quality === 'studio' ? 50 : 30,
            guidance_scale: 2.0,
            seed: 42,
            output_format: "png"
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Fal API error: ${errText}`);
    }

    const { request_id } = await response.json();

    // Poll for result
    const maxAttempts = 60;
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, 2000));

        const statusRes = await fetch(`https://queue.fal.run/fal-ai/idm-vton/requests/${request_id}/status`, {
            headers: { 'Authorization': `Key ${falApiKey}` }
        });
        const status = await statusRes.json();

        if (status.status === 'COMPLETED') {
            const resultRes = await fetch(`https://queue.fal.run/fal-ai/idm-vton/requests/${request_id}`, {
                headers: { 'Authorization': `Key ${falApiKey}` }
            });
            const result = await resultRes.json();

            if (!result.image?.url) throw new Error('Fal returned no image URL');

            // Download to base64
            const imgRes = await fetch(result.image.url);
            const imgBlob = await imgRes.arrayBuffer();
            return btoa(String.fromCharCode(...new Uint8Array(imgBlob)));
        }

        if (status.status === 'FAILED') throw new Error('Fal generation failed');
    }
    throw new Error('Fal timeout');
}

async function uploadToFal(base64: string, apiKey: string): Promise<string> {
    if (base64.startsWith('http')) return base64;

    const data = base64.replace(/^data:image\/\w+;base64,/, '');
    const bin = Uint8Array.from(atob(data), c => c.charCodeAt(0));

    const res = await fetch('https://rest.alpha.fal.ai/storage/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/octet-stream'
        },
        body: bin
    });

    if (!res.ok) throw new Error('Fal upload failed');
    return (await res.json()).url;
}
