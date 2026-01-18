/**
 * Image Optimizer Utility
 * 
 * Client-side image compression and resizing before upload.
 * Reduces image size by ~90% while maintaining quality.
 */

export interface OptimizedImage {
    blob: Blob;
    dataUrl: string;
    width: number;
    height: number;
    originalSize: number;
    optimizedSize: number;
}

export interface OptimizeOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'webp' | 'jpeg';
}

const DEFAULT_OPTIONS: Required<OptimizeOptions> = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85,
    format: 'webp'
};

/**
 * Optimize an image from a base64 data URL
 * Resizes to fit within max dimensions and compresses
 */
export async function optimizeImage(
    dataUrl: string,
    options: OptimizeOptions = {}
): Promise<OptimizedImage> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            try {
                // Calculate new dimensions maintaining aspect ratio
                let { width, height } = img;
                const originalSize = Math.round((dataUrl.length * 3) / 4); // Approximate base64 to bytes

                if (width > opts.maxWidth || height > opts.maxHeight) {
                    const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                // Enable image smoothing for better quality
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw image
                ctx.drawImage(img, 0, 0, width, height);

                // Get mime type
                const mimeType = opts.format === 'webp' ? 'image/webp' : 'image/jpeg';

                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Could not create blob'));
                            return;
                        }

                        // Also get data URL for preview
                        const optimizedDataUrl = canvas.toDataURL(mimeType, opts.quality);

                        resolve({
                            blob,
                            dataUrl: optimizedDataUrl,
                            width,
                            height,
                            originalSize,
                            optimizedSize: blob.size
                        });
                    },
                    mimeType,
                    opts.quality
                );
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = dataUrl;
    });
}

/**
 * Quick compress for wardrobe items
 * Max 1200px, WebP format, 85% quality
 */
export async function compressForWardrobe(dataUrl: string): Promise<OptimizedImage> {
    return optimizeImage(dataUrl, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        format: 'webp'
    });
}

/**
 * Get file extension from format
 */
export function getExtension(format: 'webp' | 'jpeg'): string {
    return format === 'webp' ? 'webp' : 'jpg';
}
