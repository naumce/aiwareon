import { supabase, isSupabaseConfigured } from './supabaseClient';
import { createAppError, type AppError } from '../lib/errors';

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
 * Convert any image source (URL, path, or base64) to base64 data URI
 */
async function toBase64(input: string): Promise<string> {
    // Already base64
    if (input.startsWith('data:')) {
        return input;
    }

    // Relative path (e.g., /assets/showcase/3/g3d2.png)
    if (input.startsWith('/')) {
        const url = `${window.location.origin}${input}`;
        return await fetchImageAsBase64(url);
    }

    // Full URL
    if (input.startsWith('http')) {
        return await fetchImageAsBase64(input);
    }

    // Assume it's already base64 without the data URI prefix
    return `data:image/jpeg;base64,${input}`;
}

/**
 * Fetch an image from URL and convert to base64 data URI
 */
async function fetchImageAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Generate a virtual try-on image via Edge Function
 * 
 * SIMPLIFIED: Backend handles everything:
 * - Credit checks & deduction
 * - AI generation (Gemini & Fal)
 * - Image upload
 * - Refunds on failure
 */
export async function generateTryOn(options: GenerationOptions): Promise<GenerationResult> {
    if (!isSupabaseConfigured() || !supabase) {
        return {
            success: false,
            error: createAppError('SERVICE_UNAVAILABLE', 'Supabase not configured'),
        };
    }

    const {
        personImageBase64,
        dressImageBase64,
        quality = 'standard',
        modelType = 'gemini2',
        userPrompt,
        category
    } = options;

    try {
        // Check user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return {
                success: false,
                error: createAppError('AUTH_REQUIRED', 'Please sign in to generate images'),
            };
        }

        // Convert images to base64 if needed
        console.log('� Converting images to base64...');
        const personBase64 = await toBase64(personImageBase64);
        const dressBase64 = await toBase64(dressImageBase64);
        console.log('✅ Images ready');

        // Call the Edge Function - backend handles everything
        console.log('� Calling Edge Function with model:', modelType);

        const { data, error } = await supabase.functions.invoke('generate-image', {
            body: {
                personImageBase64: personBase64,
                dressImageBase64: dressBase64,
                quality,
                modelType,
                userPrompt: userPrompt?.trim() || undefined,
                category
            }
        });

        if (error) {
            console.error('Edge Function error:', error);

            if (error.message?.includes('INSUFFICIENT_CREDITS')) {
                return {
                    success: false,
                    error: createAppError('INSUFFICIENT_CREDITS', error.message),
                };
            }

            return {
                success: false,
                error: createAppError('GENERATION_FAILED', error.message || 'Generation failed'),
            };
        }

        if (!data?.success) {
            // Check for specific error codes returned in JSON body
            if (data?.code === 'INSUFFICIENT_CREDITS') {
                return {
                    success: false,
                    generationId: data?.generationId,
                    error: createAppError('INSUFFICIENT_CREDITS', data?.error),
                };
            }

            return {
                success: false,
                generationId: data?.generationId,
                error: createAppError('GENERATION_FAILED', data?.error || 'Generation failed'),
            };
        }

        console.log('✅ Generation successful!');
        console.log('�️ Result URL:', data.resultUrl?.substring(0, 80) + '...');
        console.log('💳 Credits used:', data.creditsUsed);

        return {
            success: true,
            generationId: data.generationId,
            resultUrl: data.resultUrl,
            creditsUsed: data.creditsUsed,
        };

    } catch (err) {
        console.error('Unexpected error:', err);
        return {
            success: false,
            error: createAppError('GENERATION_FAILED', err instanceof Error ? err.message : 'Unknown error'),
        };
    }
}
