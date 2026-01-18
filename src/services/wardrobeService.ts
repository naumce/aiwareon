import { supabase } from './supabaseClient';

export type WardrobeCategory = 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories';

export interface WardrobeItem {
    id: string;
    user_id: string;
    name: string;
    category: WardrobeCategory;
    image_url: string; // Now stores storage path, not base64!
    is_example: boolean;
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
 * Now accepts a Blob instead of base64 for better performance
 */
export async function addWardrobeItem(
    userId: string,
    name: string,
    category: WardrobeCategory,
    imageBlob: Blob
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
                image_url: filename, // Store path, not full URL!
                is_example: false
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
 * Converts base64 to blob and uploads
 */
export async function addWardrobeItemFromBase64(
    userId: string,
    name: string,
    category: WardrobeCategory,
    base64: string
): Promise<WardrobeItem | null> {
    try {
        // Convert base64 to blob
        const response = await fetch(base64);
        const blob = await response.blob();
        return addWardrobeItem(userId, name, category, blob);
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

// Example items - these use external URLs (no storage needed)
export const EXAMPLE_WARDROBE_ITEMS: Omit<WardrobeItem, 'id' | 'user_id' | 'created_at'>[] = [
    // Tops
    { name: 'Classic White Tee', category: 'tops', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', is_example: true },
    { name: 'Black Hoodie', category: 'tops', image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', is_example: true },
    { name: 'Navy Blazer', category: 'tops', image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', is_example: true },
    // Bottoms
    { name: 'Blue Jeans', category: 'bottoms', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', is_example: true },
    { name: 'Black Joggers', category: 'bottoms', image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400', is_example: true },
    { name: 'Khaki Chinos', category: 'bottoms', image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', is_example: true },
    // Dresses
    { name: 'Little Black Dress', category: 'dresses', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', is_example: true },
    { name: 'Summer Floral', category: 'dresses', image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', is_example: true },
    // Outerwear
    { name: 'Leather Jacket', category: 'outerwear', image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', is_example: true },
    { name: 'Trench Coat', category: 'outerwear', image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400', is_example: true },
    // Shoes
    { name: 'White Sneakers', category: 'shoes', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', is_example: true },
    { name: 'Black Boots', category: 'shoes', image_url: 'https://images.unsplash.com/photo-1542840843-3349799cded6?w=400', is_example: true },
    // Accessories
    { name: 'Designer Tote', category: 'accessories', image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', is_example: true },
    { name: 'Classic Sunglasses', category: 'accessories', image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', is_example: true },
];
