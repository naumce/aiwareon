import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabaseClient';

export interface PersonImage {
    id: string;
    user_id: string;
    storage_path: string;
    created_at: string;
    last_used_at: string;
    url?: string;
}

/**
 * Save a person image to Supabase for reuse.
 * Accepts a local file URI (from image picker or camera).
 */
export async function savePersonImage(userId: string, localUri: string): Promise<PersonImage | null> {
    try {
        const timestamp = Date.now();
        const storagePath = `${userId}/person/${timestamp}.jpg`;

        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(localUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Convert to Uint8Array for Supabase upload
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(storagePath, bytes, {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (uploadError) {
            console.error('[PersonImage] upload error:', uploadError);
            return null;
        }

        // Insert record
        const { data, error } = await supabase
            .from('person_images')
            .insert({ user_id: userId, storage_path: storagePath })
            .select()
            .single();

        if (error) {
            console.error('[PersonImage] insert error:', error);
            return null;
        }

        // Cleanup old images (keep max 10)
        cleanupOldImages(userId);

        return data;
    } catch (err) {
        console.error('[PersonImage] save failed:', err);
        return null;
    }
}

/**
 * Update last_used_at when a saved person image is selected.
 */
export async function markPersonImageUsed(imageId: string): Promise<void> {
    await supabase
        .from('person_images')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', imageId);
}

/**
 * Keep only the 10 most recent person images per user.
 */
async function cleanupOldImages(userId: string): Promise<void> {
    try {
        const { data: oldImages } = await supabase
            .from('person_images')
            .select('id, storage_path')
            .eq('user_id', userId)
            .order('last_used_at', { ascending: false })
            .range(10, 999);

        if (!oldImages || oldImages.length === 0) return;

        for (const img of oldImages) {
            await supabase.storage.from('media').remove([img.storage_path]);
            await supabase.from('person_images').delete().eq('id', img.id);
        }
    } catch (err) {
        console.error('[PersonImage] cleanup error:', err);
    }
}
