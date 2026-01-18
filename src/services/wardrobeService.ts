import { supabase } from './supabaseClient';

// Clothing categories
export type ClothingCategory = 'tops' | 'bottoms' | 'dresses' | 'outerwear';
// Accessory categories
export type AccessoryCategory = 'bags' | 'glasses' | 'jewelry' | 'hats' | 'scarves';
// Footwear categories
export type FootwearCategory = 'heels' | 'flats' | 'sneakers' | 'boots';

export type WardrobeCategory = ClothingCategory | AccessoryCategory | FootwearCategory;
export type CategoryGroup = 'clothing' | 'accessories' | 'footwear';

export interface WardrobeItem {
    id: string;
    user_id: string;
    name: string;
    category: WardrobeCategory;
    category_group: CategoryGroup;
    image_url: string; // Storage path
    is_example: boolean;
    ai_suggested: boolean;
    ai_confidence?: number;
    created_at: string;
}

const STORAGE_BUCKET = 'wardrobe';

export async function getWardrobeItems(userId: string): Promise<WardrobeItem[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .or(`user_id.eq.${userId},is_example.eq.true`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching wardrobe items:', error);
        return [];
    }

    return data || [];
}

/**
 * Upload image to Supabase Storage and add wardrobe item
 */
export async function addWardrobeItem(
    userId: string,
    name: string,
    category: WardrobeCategory,
    categoryGroup: CategoryGroup,
    imageBlob: Blob,
    aiSuggested: boolean = false,
    aiConfidence?: number
): Promise<WardrobeItem | null> {
    if (!supabase) return null;

    try {
        // Generate unique filename
        const timestamp = Date.now();
        const extension = imageBlob.type.includes('webp') ? 'webp' : 'jpg';
        const filename = `${userId}/${category}_${timestamp}.${extension}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filename, imageBlob, {
                contentType: imageBlob.type,
                cacheControl: '31536000', // 1 year cache
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            return null;
        }

        // Store the path (not full URL) in database
        const { data, error: insertError } = await supabase
            .from('wardrobe_items')
            .insert({
                user_id: userId,
                name,
                category,
                category_group: categoryGroup,
                image_url: filename, // Store path, not full URL!
                is_example: false,
                ai_suggested: aiSuggested,
                ai_confidence: aiConfidence
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error adding wardrobe item:', insertError);
            // Try to clean up uploaded file
            await supabase.storage.from(STORAGE_BUCKET).remove([filename]);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in addWardrobeItem:', error);
        return null;
    }
}

/**
 * Legacy function for base64 uploads (backwards compatibility)
 * Converts base64 to blob and uploads - defaults to clothing group
 */
export async function addWardrobeItemFromBase64(
    userId: string,
    name: string,
    category: WardrobeCategory,
    base64: string
): Promise<WardrobeItem | null> {
    try {
        // Determine category group from category
        const clothingCats = ['tops', 'bottoms', 'dresses', 'outerwear'];
        const accessoryCats = ['bags', 'glasses', 'jewelry', 'hats', 'scarves'];
        const categoryGroup: CategoryGroup = clothingCats.includes(category)
            ? 'clothing'
            : accessoryCats.includes(category)
                ? 'accessories'
                : 'footwear';

        // Convert base64 to blob
        const response = await fetch(base64);
        const blob = await response.blob();
        return addWardrobeItem(userId, name, category, categoryGroup, blob, false);
    } catch (error) {
        console.error('Error converting base64 to blob:', error);
        return null;
    }
}

export async function deleteWardrobeItem(itemId: string): Promise<boolean> {
    if (!supabase) return false;

    // First get the item to find the storage path
    const { data: item, error: fetchError } = await supabase
        .from('wardrobe_items')
        .select('image_url')
        .eq('id', itemId)
        .single();

    if (fetchError) {
        console.error('Error fetching item for deletion:', fetchError);
        return false;
    }

    // Delete from storage if it's a storage path (not external URL)
    if (item?.image_url && !item.image_url.startsWith('http')) {
        const { error: storageError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([item.image_url]);

        if (storageError) {
            console.error('Error deleting from storage:', storageError);
            // Continue anyway - DB record should still be deleted
        }
    }

    // Delete from database
    const { error } = await supabase
        .from('wardrobe_items')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error('Error deleting wardrobe item:', error);
        return false;
    }

    return true;
}

// Example items - minimal set for demo
export const EXAMPLE_WARDROBE_ITEMS: Omit<WardrobeItem, 'id' | 'user_id' | 'created_at'>[] = [
    // Clothing
    { name: 'Classic White Tee', category: 'tops', category_group: 'clothing', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', is_example: true, ai_suggested: false },
    { name: 'Blue Jeans', category: 'bottoms', category_group: 'clothing', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', is_example: true, ai_suggested: false },
    { name: 'Little Black Dress', category: 'dresses', category_group: 'clothing', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', is_example: true, ai_suggested: false },
    // Footwear
    { name: 'White Sneakers', category: 'sneakers', category_group: 'footwear', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', is_example: true, ai_suggested: false },
    // Accessories
    { name: 'Designer Tote', category: 'bags', category_group: 'accessories', image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', is_example: true, ai_suggested: false },
    { name: 'Classic Sunglasses', category: 'glasses', category_group: 'accessories', image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', is_example: true, ai_suggested: false },
];
