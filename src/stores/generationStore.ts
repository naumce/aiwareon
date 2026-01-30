import { create } from 'zustand';
import { generateTryOn } from '../services/generationService';
import { useCreditStore } from './creditStore';
import type { AppError } from '../lib/errors';

type GenerationState = 'idle' | 'uploading' | 'generating' | 'succeeded' | 'failed' | 'upscaling';

interface GenerationStoreState {
    state: GenerationState;
    currentGenerationId: string | null;
    resultUrl: string | null;
    error: AppError | null;

    // Images for current generation
    personImage: string | null;
    dressImage: string | null;
    userPrompt: string;

    // Actions
    setPersonImage: (base64: string) => void;
    setDressImage: (base64: string) => void;
    setUserPrompt: (prompt: string) => void;
    generate: (
        quality?: 'standard' | 'studio',
        modelType?: 'fal' | 'gemini2' | 'geminipro',
        category?: 'tops' | 'bottoms' | 'one-pieces'
    ) => Promise<void>;
    upscale: () => Promise<void>;
    clearResult: () => void;
    reset: () => void;
}

export const useGenerationStore = create<GenerationStoreState>()((set, get) => ({
    state: 'idle',
    currentGenerationId: null,
    resultUrl: null,
    error: null,
    personImage: null,
    dressImage: null,
    userPrompt: '',

    setPersonImage: (base64: string) => {
        set({ personImage: base64, error: null });
    },

    setDressImage: (base64: string) => {
        set({ dressImage: base64, error: null });
    },

    setUserPrompt: (prompt: string) => {
        set({ userPrompt: prompt });
    },

    generate: async (quality = 'standard', modelType = 'fal', category) => {
        const { personImage, dressImage, userPrompt } = get();

        if (!personImage || !dressImage) {
            set({
                state: 'failed',
                error: {
                    code: 'INVALID_IMAGE',
                    message: 'Missing images',
                    userMessage: 'Please upload both a person photo and a clothing item.',
                    recoverable: true,
                }
            });
            return;
        }

        set({ state: 'generating', error: null, resultUrl: null });

        const result = await generateTryOn({
            personImageBase64: personImage,
            dressImageBase64: dressImage,
            quality,
            modelType,
            category,
            userPrompt: userPrompt.trim() || undefined,
        });

        if (result.success) {
            console.log('✅ Generation SUCCESS! resultUrl:', result.resultUrl);
            set({
                state: 'succeeded',
                currentGenerationId: result.generationId || null,
                resultUrl: result.resultUrl || null,
            });

            // Refresh credit balance
            useCreditStore.getState().fetchBalance();
        } else {
            console.error('❌ Generation FAILED:', result.error);
            set({
                state: 'failed',
                currentGenerationId: result.generationId || null,
                error: result.error || null,
            });

            // Refresh balance (might have been refunded)
            useCreditStore.getState().fetchBalance();
        }
    },

    upscale: async () => {
        const { resultUrl } = get();

        if (!resultUrl) {
            console.error('No result to upscale');
            return;
        }

        set({ state: 'upscaling', error: null });

        try {
            // Import upscaleImage dynamically
            const { upscaleImage } = await import('../services/geminiService');

            // Upscale the image
            const upscaledBase64 = await upscaleImage(resultUrl);

            set({
                state: 'succeeded',
                resultUrl: upscaledBase64,
            });

            // Refresh balance
            useCreditStore.getState().fetchBalance();

            console.log('✅ Upscale complete!');
        } catch (error: any) {
            console.error('Upscale failed:', error);
            set({
                state: 'failed',
                error: {
                    code: 'UPSCALE_FAILED',
                    message: error.message || 'Upscale failed',
                    userMessage: 'Failed to enhance image quality. Please try again.',
                    recoverable: true
                }
            });
        }
    },

    clearResult: () => {
        set({
            state: 'idle',
            currentGenerationId: null,
            resultUrl: null,
            error: null,
        });
    },

    reset: () => {
        set({
            state: 'idle',
            currentGenerationId: null,
            resultUrl: null,
            error: null,
            personImage: null,
            dressImage: null,
        });
    },
}));
