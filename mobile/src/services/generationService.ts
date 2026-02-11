import { supabase } from './supabaseClient';
import type { Quality, ModelType, FalCategory, GenerationError } from '../types';

interface GenerateParams {
    personImage: string;
    dressImage: string;
    quality: Quality;
    modelType: ModelType;
    falCategory?: FalCategory;
    userPrompt?: string;
}

interface GenerateResult {
    resultUrl?: string;
    error?: GenerationError;
}

/**
 * Convert image URI to base64 data URI
 */
async function toBase64(uri: string): Promise<string> {
    // Already base64
    if (uri.startsWith('data:')) {
        return uri;
    }

    // Remote URL or local file - fetch and convert
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Generate virtual try-on result via Edge Function
 * This uses the same backend as the web app, which:
 * - Has SERVICE_ROLE_KEY (bypasses RLS)
 * - Handles credit deduction/refund
 * - Uploads results to storage
 * - Saves to media_items
 */
export async function generateTryOn(params: GenerateParams): Promise<GenerateResult> {
    const { personImage, dressImage, quality, modelType, falCategory, userPrompt } = params;

    try {
        const personBase64 = await toBase64(personImage);
        const dressBase64 = await toBase64(dressImage);

        // Call the Edge Function - same as web app
        const { data, error } = await supabase.functions.invoke('generate-image', {
            body: {
                personImageBase64: personBase64,
                dressImageBase64: dressBase64,
                quality,
                modelType,
                userPrompt: userPrompt?.trim() || undefined,
                category: falCategory,
            }
        });

        if (error) {
            return {
                error: {
                    message: error.message || 'Generation failed',
                    userMessage: error.message?.includes('INSUFFICIENT_CREDITS')
                        ? 'Not enough credits. Please purchase more.'
                        : 'Failed to generate try-on. Please try again.',
                },
            };
        }

        if (!data?.success) {
            return {
                error: {
                    message: data?.error || 'Generation failed',
                    userMessage: data?.code === 'INSUFFICIENT_CREDITS'
                        ? 'Not enough credits. Please purchase more.'
                        : 'Failed to generate try-on. Please try again.',
                },
            };
        }

        return { resultUrl: data.resultUrl };
    } catch (error) {
        return {
            error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Failed to generate try-on. Please try again.',
            },
        };
    }
}

/**
 * Get credits required for generation
 */
export function getCreditCost(quality: Quality): number {
    return quality === 'studio' ? 2 : 1;
}
