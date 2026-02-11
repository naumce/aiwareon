import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import type { WardrobeItem, WardrobeCategory } from '../types';

interface WardrobeState {
    items: WardrobeItem[];
    exampleItems: WardrobeItem[];
    selectedCategory: WardrobeCategory | 'all';
    isLoading: boolean;

    // Actions
    fetchItems: () => Promise<void>;
    addItem: (item: Omit<WardrobeItem, 'id' | 'created_at'>) => Promise<WardrobeItem | null>;
    removeItem: (id: string) => Promise<void>;
    setCategory: (category: WardrobeCategory | 'all') => void;
    getFilteredItems: () => WardrobeItem[];
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
    items: [],
    exampleItems: [],
    selectedCategory: 'all',
    isLoading: false,

    fetchItems: async () => {
        set({ isLoading: true });

        try {
            // Fetch user items
            const { data: userItems, error: userError } = await supabase
                .from('wardrobe_items')
                .select('*')
                .eq('is_example', false)
                .order('created_at', { ascending: false });

            if (userError) throw userError;

            // Fetch example items
            const { data: examples, error: exampleError } = await supabase
                .from('wardrobe_items')
                .select('*')
                .eq('is_example', true)
                .order('created_at', { ascending: false });

            if (exampleError) throw exampleError;

            // Helper to get signed URL for storage paths
            const getSignedUrl = async (item: any) => {
                if (!item.image_url) return item;

                // If already a full URL (http/https) or local file, keep as-is
                if (item.image_url.startsWith('http') || item.image_url.startsWith('file:')) {
                    return item;
                }

                // It's a storage path - get signed URL from 'wardrobe' bucket
                try {
                    const { data } = await supabase.storage
                        .from('wardrobe')
                        .createSignedUrl(item.image_url, 3600);

                    return { ...item, image_url: data?.signedUrl || item.image_url };
                } catch {
                    return item;
                }
            };

            // Get signed URLs for all items
            const itemsWithUrls = await Promise.all(
                (userItems || []).map(getSignedUrl)
            );
            const examplesWithUrls = await Promise.all(
                (examples || []).map(getSignedUrl)
            );

            set({
                items: itemsWithUrls,
                exampleItems: examplesWithUrls,
                isLoading: false,
            });
        } catch {
            set({ isLoading: false });
        }
    },

    addItem: async (item) => {
        try {
            const { data, error } = await supabase
                .from('wardrobe_items')
                .insert(item)
                .select()
                .single();

            if (error) return null;

            set((state) => ({
                items: [data, ...state.items],
            }));

            return data;
        } catch {
            return null;
        }
    },

    removeItem: async (id) => {
        try {
            const { error } = await supabase
                .from('wardrobe_items')
                .delete()
                .eq('id', id);

            if (error) return;

            set((state) => ({
                items: state.items.filter((item) => item.id !== id),
            }));
        } catch {
            // Delete failed silently
        }
    },

    setCategory: (category) => {
        set({ selectedCategory: category });
    },

    getFilteredItems: () => {
        const { items, exampleItems, selectedCategory } = get();
        const allItems = [...items, ...exampleItems];

        if (selectedCategory === 'all') {
            return allItems;
        }

        return allItems.filter((item) => item.category === selectedCategory);
    },
}));
