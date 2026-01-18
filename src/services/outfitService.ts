import { supabase } from './supabaseClient';
import type { WardrobeItem } from './wardrobeService';

export type OutfitOccasion = 'training' | 'outdoor' | 'night_out' | 'date' | 'casual' | 'work' | 'beach';

export interface Outfit {
    id: string;
    user_id: string;
    name: string;
    occasion: OutfitOccasion;
    created_at: string;
    items?: WardrobeItem[];
}

export const OCCASION_LABELS: Record<OutfitOccasion, { label: string; emoji: string; color: string }> = {
    training: { label: 'Training', emoji: '💪', color: 'bg-orange-500/20 text-orange-300' },
    outdoor: { label: 'Outdoor', emoji: '🌲', color: 'bg-green-500/20 text-green-300' },
    night_out: { label: 'Night Out', emoji: '🌙', color: 'bg-purple-500/20 text-purple-300' },
    date: { label: 'Date', emoji: '❤️', color: 'bg-pink-500/20 text-pink-300' },
    casual: { label: 'Casual', emoji: '😎', color: 'bg-blue-500/20 text-blue-300' },
    work: { label: 'Work', emoji: '💼', color: 'bg-slate-500/20 text-slate-300' },
    beach: { label: 'Beach', emoji: '🏖️', color: 'bg-cyan-500/20 text-cyan-300' },
};

export async function getOutfits(userId: string): Promise<Outfit[]> {
    if (!supabase) return [];
    const db = supabase;

    const { data: outfits, error: outfitsError } = await db
        .from('outfits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (outfitsError) {
        console.error('Error fetching outfits:', outfitsError);
        return [];
    }

    // Fetch items for each outfit
    const outfitsWithItems = await Promise.all(
        (outfits || []).map(async (outfit) => {
            const { data: outfitItems } = await db
                .from('outfit_items')
                .select('wardrobe_item_id')
                .eq('outfit_id', outfit.id);

            if (outfitItems && outfitItems.length > 0) {
                const itemIds = outfitItems.map(oi => oi.wardrobe_item_id);
                const { data: items } = await db
                    .from('wardrobe_items')
                    .select('*')
                    .in('id', itemIds);

                return { ...outfit, items: items || [] };
            }

            return { ...outfit, items: [] };
        })
    );

    return outfitsWithItems;
}

export async function createOutfit(
    userId: string,
    name: string,
    occasion: OutfitOccasion,
    itemIds: string[]
): Promise<Outfit | null> {
    if (!supabase) return null;

    // Create the outfit
    const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .insert({
            user_id: userId,
            name,
            occasion
        })
        .select()
        .single();

    if (outfitError || !outfit) {
        console.error('Error creating outfit:', outfitError);
        return null;
    }

    // Add outfit items
    if (itemIds.length > 0) {
        const outfitItems = itemIds.map(itemId => ({
            outfit_id: outfit.id,
            wardrobe_item_id: itemId
        }));

        const { error: itemsError } = await supabase
            .from('outfit_items')
            .insert(outfitItems);

        if (itemsError) {
            console.error('Error adding outfit items:', itemsError);
        }
    }

    return outfit;
}

export async function deleteOutfit(outfitId: string): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfitId);

    if (error) {
        console.error('Error deleting outfit:', error);
        return false;
    }

    return true;
}
