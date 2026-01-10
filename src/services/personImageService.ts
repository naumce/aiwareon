import { supabase } from './supabaseClient';

export type PersonImage = {
    id: string;
    user_id: string;
    storage_path: string;
    created_at: string;
    last_used_at: string;
    url?: string;
};

/**
 * Save a person image for reuse
 */
export async function savePersonImage(userId: string, imageBase64: string): Promise<PersonImage | null> {
    if (!supabase) return null;

    try {
        // Generate unique filename
        const timestamp = Date.now();
        const fileName = `${userId}/person/${timestamp}.jpg`;

        // Convert base64 to blob
        const base64Data = imageBase64.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('media')
            .upload(fileName, blob, {
                contentType: 'image/jpeg',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return null;
        }

        // Save record to database
        const { data, error } = await supabase
            .from('person_images')
            .insert({
                user_id: userId,
                storage_path: fileName
            })
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return null;
        }

        // Clean up old images (keep max 10)
        await cleanupOldImages(userId);

        return data;
    } catch (error) {
        console.error('Save person image error:', error);
        return null;
    }
}

/**
 * Get saved person images for a user
 */
export async function getPersonImages(userId: string, limit: number = 3): Promise<PersonImage[]> {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('person_images')
            .select('*')
            .eq('user_id', userId)
            .order('last_used_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Fetch person images error:', error);
            return [];
        }

        // Get public URLs
        const imagesWithUrls = await Promise.all(
            (data || []).map(async (img) => {
                const { data: urlData } = supabase.storage
                    .from('media')
                    .getPublicUrl(img.storage_path);

                return {
                    ...img,
                    url: urlData.publicUrl
                };
            })
        );

        return imagesWithUrls;
    } catch (error) {
        console.error('Get person images error:', error);
        return [];
    }
}

/**
 * Update last_used_at timestamp
 */
export async function markPersonImageUsed(imageId: string): Promise<void> {
    if (!supabase) return;

    await supabase
        .from('person_images')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', imageId);
}

/**
 * Delete a person image
 */
export async function deletePersonImage(imageId: string, storagePath: string): Promise<boolean> {
    if (!supabase) return false;

    try {
        // Delete from storage
        await supabase.storage.from('media').remove([storagePath]);

        // Delete from database
        const { error } = await supabase
            .from('person_images')
            .delete()
            .eq('id', imageId);

        return !error;
    } catch (error) {
        console.error('Delete person image error:', error);
        return false;
    }
}

/**
 * Keep only the most recent 10 images
 */
async function cleanupOldImages(userId: string): Promise<void> {
    if (!supabase) return;

    try {
        // Get images beyond the 10 most recent
        const { data: oldImages } = await supabase
            .from('person_images')
            .select('id, storage_path')
            .eq('user_id', userId)
            .order('last_used_at', { ascending: false })
            .range(10, 999); // Skip first 10, get rest

        if (oldImages && oldImages.length > 0) {
            // Delete old images
            for (const img of oldImages) {
                await deletePersonImage(img.id, img.storage_path);
            }
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}
