import { supabase } from './supabaseClient';

export type MediaKind = 'image' | 'video';

export interface MediaItem {
    id: string;
    user_id?: string;
    kind: MediaKind;
    bucket_id: string;
    object_path: string;
    created_at: string;
    signedUrl?: string;
}

const BUCKET = 'aiwear-media';

function dataUrlToBlob(dataUrl: string): Blob {
    const [header, base64] = dataUrl.split(',');
    const mime = header?.match(/data:(.*?);base64/)?.[1] ?? 'application/octet-stream';
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return new Blob([bytes], { type: mime });
}

export async function uploadMedia(params: {
    userId: string;
    kind: MediaKind;
    dataUrl?: string;
    blob?: Blob;
}): Promise<MediaItem> {
    if (!supabase) throw new Error('Supabase not configured');

    const { userId, kind } = params;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');

    const ext = kind === 'image' ? 'png' : 'mp4';
    const contentType = kind === 'image' ? 'image/png' : 'video/mp4';
    const object_path = `${userId}/${kind}/${ts}.${ext}`;

    const body =
        kind === 'image'
            ? dataUrlToBlob(params.dataUrl ?? '')
            : (params.blob ?? null);

    if (!body || (kind === 'image' && !(params.dataUrl ?? '').includes(','))) {
        throw new Error('Missing media payload');
    }

    const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(object_path, body, { contentType, upsert: false });

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
        .from('media_items')
        .insert({
            user_id: userId,
            kind,
            bucket_id: BUCKET,
            object_path,
        })
        .select('id, kind, bucket_id, object_path, created_at')
        .single();

    if (error) throw error;
    return data as MediaItem;
}

export async function listMyMedia(limit: number = 24, offset: number = 0): Promise<MediaItem[]> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('media_items')
        .select('id, kind, bucket_id, object_path, created_at')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data ?? []) as MediaItem[];
}

export async function createSignedMediaUrl(
    item: Pick<MediaItem, 'bucket_id' | 'object_path'>,
    expiresInSec: number = 60 * 60
): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.storage
        .from(item.bucket_id)
        .createSignedUrl(item.object_path, expiresInSec);

    if (error) throw error;
    return data.signedUrl;
}
