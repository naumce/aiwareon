import { create } from 'zustand';

export interface SavedModel {
    id: string;
    name: string;
    image: string; // base64
    savedAt: number;
}

interface ModelStore {
    models: SavedModel[];
    loadModels: () => void;
    saveModel: (name: string, image: string) => void;
    deleteModel: (id: string) => void;
    canSaveMore: () => boolean;
}

const MAX_MODELS = 5;
const STORAGE_KEY = 'aiwear_saved_models';

// Helper to compress image
const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Resize to max 800px width while maintaining aspect ratio
            const maxWidth = 800;
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;

            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Compress to JPEG quality 0.7
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = base64;
    });
};

export const useModelStore = create<ModelStore>((set, get) => ({
    models: [],

    loadModels: () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const models = JSON.parse(stored) as SavedModel[];
                set({ models });
            }
        } catch (err) {
            console.error('Failed to load models:', err);
        }
    },

    saveModel: async (name: string, image: string) => {
        const { models } = get();

        if (models.length >= MAX_MODELS) {
            throw new Error(`Maximum ${MAX_MODELS} models allowed`);
        }

        // Compress image before saving
        const compressedImage = await compressImage(image);

        const newModel: SavedModel = {
            id: Date.now().toString(),
            name: name.trim() || 'Unnamed Model',
            image: compressedImage,
            savedAt: Date.now(),
        };

        const updatedModels = [...models, newModel];

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedModels));
            set({ models: updatedModels });
        } catch (err) {
            console.error('Failed to save model:', err);
            throw new Error('Storage full. Delete some models to continue.');
        }
    },

    deleteModel: (id: string) => {
        const { models } = get();
        const updatedModels = models.filter(m => m.id !== id);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedModels));
            set({ models: updatedModels });
        } catch (err) {
            console.error('Failed to delete model:', err);
        }
    },

    canSaveMore: () => {
        return get().models.length < MAX_MODELS;
    },
}));
