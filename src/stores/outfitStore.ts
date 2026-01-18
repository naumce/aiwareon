import { create } from 'zustand';
import {
    getOutfits,
    createOutfit,
    deleteOutfit,
    type Outfit,
    type OutfitOccasion
} from '../services/outfitService';

interface OutfitState {
    outfits: Outfit[];
    isLoading: boolean;
    selectedOccasion: OutfitOccasion | 'all';

    fetchOutfits: (userId: string) => Promise<void>;
    addOutfit: (userId: string, name: string, occasion: OutfitOccasion, itemIds: string[]) => Promise<Outfit | null>;
    removeOutfit: (outfitId: string) => Promise<boolean>;
    setOccasion: (occasion: OutfitOccasion | 'all') => void;

    // Computed
    getFilteredOutfits: () => Outfit[];
}

export const useOutfitStore = create<OutfitState>((set, get) => ({
    outfits: [],
    isLoading: false,
    selectedOccasion: 'all',

    fetchOutfits: async (userId: string) => {
        set({ isLoading: true });
        const outfits = await getOutfits(userId);
        set({ outfits, isLoading: false });
    },

    addOutfit: async (userId: string, name: string, occasion: OutfitOccasion, itemIds: string[]) => {
        const newOutfit = await createOutfit(userId, name, occasion, itemIds);
        if (newOutfit) {
            // Refetch to get the full outfit with items
            await get().fetchOutfits(userId);
        }
        return newOutfit;
    },

    removeOutfit: async (outfitId: string) => {
        const success = await deleteOutfit(outfitId);
        if (success) {
            set(state => ({ outfits: state.outfits.filter(o => o.id !== outfitId) }));
        }
        return success;
    },

    setOccasion: (occasion: OutfitOccasion | 'all') => {
        set({ selectedOccasion: occasion });
    },

    getFilteredOutfits: () => {
        const { outfits, selectedOccasion } = get();
        if (selectedOccasion === 'all') return outfits;
        return outfits.filter(o => o.occasion === selectedOccasion);
    },
}));
