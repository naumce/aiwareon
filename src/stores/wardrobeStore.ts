import { create } from 'zustand';
import {
    getWardrobeItems,
    addWardrobeItem,
    deleteWardrobeItem,
    EXAMPLE_WARDROBE_ITEMS,
    type WardrobeItem,
    type WardrobeCategory
} from '../services/wardrobeService';

interface WardrobeState {
    items: WardrobeItem[];
    isLoading: boolean;
    selectedCategory: WardrobeCategory | 'all';

    fetchItems: (userId: string) => Promise<void>;
    addItem: (userId: string, name: string, category: WardrobeCategory, imageBlob: Blob) => Promise<WardrobeItem | null>;
    removeItem: (itemId: string) => Promise<boolean>;
    setCategory: (category: WardrobeCategory | 'all') => void;

    // Computed
    getFilteredItems: () => WardrobeItem[];
    getExampleItems: () => typeof EXAMPLE_WARDROBE_ITEMS;
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
    items: [],
    isLoading: false,
    selectedCategory: 'all',

    fetchItems: async (userId: string) => {
        set({ isLoading: true });
        const items = await getWardrobeItems(userId);
        set({ items, isLoading: false });
    },

    addItem: async (userId: string, name: string, category: WardrobeCategory, imageBlob: Blob) => {
        const newItem = await addWardrobeItem(userId, name, category, imageBlob);
        if (newItem) {
            set(state => ({ items: [newItem, ...state.items] }));
        }
        return newItem;
    },

    removeItem: async (itemId: string) => {
        const success = await deleteWardrobeItem(itemId);
        if (success) {
            set(state => ({ items: state.items.filter(item => item.id !== itemId) }));
        }
        return success;
    },

    setCategory: (category: WardrobeCategory | 'all') => {
        set({ selectedCategory: category });
    },

    getFilteredItems: () => {
        const { items, selectedCategory } = get();
        if (selectedCategory === 'all') return items;
        return items.filter(item => item.category === selectedCategory);
    },

    getExampleItems: () => EXAMPLE_WARDROBE_ITEMS,
}));
