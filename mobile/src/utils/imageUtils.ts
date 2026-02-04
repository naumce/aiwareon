// Using legacy API for compatibility with current SDK
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Ensure URI is local - downloads remote URLs to temp file
 */
export async function ensureLocalUri(uri: string): Promise<string> {
    // If already a local file, return as-is
    if (uri.startsWith('file://') || uri.startsWith('/') || uri.startsWith('data:')) {
        return uri;
    }

    // If it's a remote URL, download to temp
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
        try {
            const filename = `temp_${Date.now()}.jpg`;
            const localUri = FileSystem.cacheDirectory + filename;

            const downloadResult = await FileSystem.downloadAsync(uri, localUri);

            if (downloadResult.status !== 200) {
                throw new Error(`Failed to download image: ${downloadResult.status}`);
            }

            return downloadResult.uri;
        } catch (error) {
            console.error('Error downloading remote image:', error);
            throw error;
        }
    }

    return uri;
}

/**
 * Convert local file URI to base64
 */
export async function uriToBase64(uri: string): Promise<string> {
    try {
        // Ensure we have a local file
        const localUri = await ensureLocalUri(uri);

        const base64 = await FileSystem.readAsStringAsync(localUri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return base64;
    } catch (error) {
        console.error('Error converting URI to base64:', error);
        throw error;
    }
}

/**
 * Resize image to max dimension while maintaining aspect ratio
 */
export async function resizeImage(
    uri: string,
    maxDimension: number = 1024
): Promise<string> {
    try {
        // Ensure we have a local file
        const localUri = await ensureLocalUri(uri);

        const result = await ImageManipulator.manipulateAsync(
            localUri,
            [{ resize: { width: maxDimension } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        return result.uri;
    } catch (error) {
        console.error('Error resizing image:', error);
        throw error;
    }
}

/**
 * Compress image for wardrobe (smaller size)
 */
export async function compressForWardrobe(uri: string): Promise<string> {
    try {
        const localUri = await ensureLocalUri(uri);

        const result = await ImageManipulator.manipulateAsync(
            localUri,
            [{ resize: { width: 512 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        return result.uri;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
    uri: string
): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const Image = require('react-native').Image;
        Image.getSize(
            uri,
            (width: number, height: number) => resolve({ width, height }),
            (error: Error) => reject(error)
        );
    });
}

/**
 * Convert base64 to data URI
 */
export function base64ToDataUri(base64: string, mimeType: string = 'image/jpeg'): string {
    return `data:${mimeType};base64,${base64}`;
}

/**
 * Extract base64 from data URI
 */
export function dataUriToBase64(dataUri: string): string {
    const match = dataUri.match(/^data:.*?;base64,(.*)$/);
    return match ? match[1] : dataUri;
}
