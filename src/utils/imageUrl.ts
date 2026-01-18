/**
 * Supabase Image URL Helpers
 * 
 * Generates URLs with Supabase Image Transformation parameters
 * for on-the-fly resizing and format conversion.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const STORAGE_BUCKET = 'wardrobe';

export interface ImageTransformOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'origin';
    resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Get the base storage URL for a file
 */
export function getStorageUrl(path: string): string {
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

/**
 * Get an optimized image URL with Supabase transforms
 * 
 * @example
 * getOptimizedUrl('user123/item.webp', { width: 200, quality: 80 })
 * // Returns: https://xxx.supabase.co/storage/v1/render/image/public/wardrobe/user123/item.webp?width=200&quality=80
 */
export function getOptimizedUrl(path: string, options: ImageTransformOptions = {}): string {
    const params = new URLSearchParams();

    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.format) params.append('format', options.format);
    if (options.resize) params.append('resize', options.resize);

    const queryString = params.toString();
    const baseUrl = `${SUPABASE_URL}/storage/v1/render/image/public/${STORAGE_BUCKET}/${path}`;

    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Get thumbnail URL (200px, 80% quality)
 */
export function getThumbnailUrl(path: string): string {
    return getOptimizedUrl(path, {
        width: 200,
        quality: 80,
        format: 'webp',
        resize: 'cover'
    });
}

/**
 * Get preview URL (400px, 85% quality)
 */
export function getPreviewUrl(path: string): string {
    return getOptimizedUrl(path, {
        width: 400,
        quality: 85,
        format: 'webp',
        resize: 'cover'
    });
}

/**
 * Get full size URL (800px, 90% quality)
 */
export function getFullUrl(path: string): string {
    return getOptimizedUrl(path, {
        width: 800,
        quality: 90,
        format: 'webp'
    });
}

/**
 * Check if a URL is a storage path (not a full URL or base64)
 */
export function isStoragePath(url: string): boolean {
    return !url.startsWith('http') && !url.startsWith('data:');
}

/**
 * Get the appropriate display URL for an image
 * Handles both old base64/external URLs and new storage paths
 * 
 * NOTE: Using direct URLs since Image Transformations require Supabase Pro.
 * For optimization, images are compressed on upload using imageOptimizer.ts
 */
export function getDisplayUrl(imageUrl: string, _size: 'thumbnail' | 'preview' | 'full' = 'thumbnail'): string {
    // If it's already a full URL (external or data URL), return as-is
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
        return imageUrl;
    }

    // Return direct storage URL (no transformations - free tier)
    return getStorageUrl(imageUrl);
}
