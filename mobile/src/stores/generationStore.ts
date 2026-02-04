import { create } from 'zustand';
import type { GenerationState, Quality, ModelType, FalCategory, GenerationError } from '../types';
import * as generationService from '../services/generationService';

interface GenerationStoreState {
    // State
    state: GenerationState;
    personImage: string | null;
    dressImage: string | null;
    resultUrl: string | null;
    error: GenerationError | null;
    userPrompt: string;

    // Actions
    setPersonImage: (image: string | null) => void;
    setDressImage: (image: string | null) => void;
    setUserPrompt: (prompt: string) => void;
    generate: (quality: Quality, modelType: ModelType, falCategory?: FalCategory) => Promise<void>;
    reset: () => void;
}

export const useGenerationStore = create<GenerationStoreState>((set, get) => ({
    state: 'idle',
    personImage: null,
    dressImage: null,
    resultUrl: null,
    error: null,
    userPrompt: '',

    setPersonImage: (image) => {
        set({ personImage: image, resultUrl: null, error: null, state: 'idle' });
    },

    setDressImage: (image) => {
        set({ dressImage: image, resultUrl: null, error: null, state: 'idle' });
    },

    setUserPrompt: (prompt) => {
        set({ userPrompt: prompt });
    },

    generate: async (quality, modelType, falCategory) => {
        const { personImage, dressImage, userPrompt } = get();

        if (!personImage || !dressImage) {
            set({
                error: { message: 'Missing images', userMessage: 'Please select both a person and a garment image' },
                state: 'failed',
            });
            return;
        }

        set({ state: 'generating', error: null, resultUrl: null });

        try {
            const result = await generationService.generateTryOn({
                personImage,
                dressImage,
                quality,
                modelType,
                falCategory,
                userPrompt: userPrompt || undefined,
            });

            if (result.error) {
                set({
                    error: result.error,
                    state: 'failed',
                });
                return;
            }

            set({
                resultUrl: result.resultUrl,
                state: 'succeeded',
            });
        } catch (error) {
            console.error('Generation error:', error);
            set({
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    userMessage: 'Something went wrong. Please try again.',
                },
                state: 'failed',
            });
        }
    },

    reset: () => {
        set({
            state: 'idle',
            personImage: null,
            dressImage: null,
            resultUrl: null,
            error: null,
            userPrompt: '',
        });
    },
}));
