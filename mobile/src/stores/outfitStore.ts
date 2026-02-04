import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import type { Outfit, OutfitOccasion } from '../types';

interface OutfitState {
    outfits: Outfit[];
    selectedOccasion: OutfitOccasion | 'all';
    isLoading: boolean;

    // Actions
    fetchOutfits: () => Promise<void>;
    addOutfit: (outfit: Omit<Outfit, 'id' | 'created_at'>) => Promise<Outfit | null>;
    removeOutfit: (id: string) => Promise<void>;
    setOccasion: (occasion: OutfitOccasion | 'all') => void;
    getFilteredOutfits: () => Outfit[];
}

export const useOutfitStore = create<OutfitState>((set, get) => ({
    outfits: [],
    selectedOccasion: 'all',
    isLoading: false,

    fetchOutfits: async () => {
        set({ isLoading: true });

        try {
            const { data, error } = await supabase
                .from('outfits')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching outfits:', error);
                set({ outfits: [], isLoading: false });
                return;
            }

            set({ outfits: data || [], isLoading: false });
        } catch (error) {
            console.error('Error fetching outfits:', error);
            set({ isLoading: false });
        }
    },

    addOutfit: async (outfit) => {
        try {
            const { data, error } = await supabase
                .from('outfits')
                .insert(outfit)
                .select()
                .single();

            if (error) {
                console.error('Error adding outfit:', error);
                return null;
            }

            set((state) => ({
                outfits: [data, ...state.outfits],
            }));

            return data;
        } catch (error) {
            console.error('Error adding outfit:', error);
            return null;
        }
    },

    removeOutfit: async (id) => {
        try {
            const { error } = await supabase
                .from('outfits')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error removing outfit:', error);
                return;
            }

            set((state) => ({
                outfits: state.outfits.filter((o) => o.id !== id),
            }));
        } catch (error) {
            console.error('Error removing outfit:', error);
        }
    },

    setOccasion: (occasion) => {
        set({ selectedOccasion: occasion });
    },

    getFilteredOutfits: () => {
        const { outfits, selectedOccasion } = get();

        if (selectedOccasion === 'all') {
            return outfits;
        }

        return outfits.filter((o) => o.occasion === selectedOccasion);
    },
}));
