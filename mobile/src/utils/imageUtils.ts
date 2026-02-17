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
        const filename = `temp_${Date.now()}.jpg`;
        const localUri = FileSystem.cacheDirectory + filename;

        const downloadResult = await FileSystem.downloadAsync(uri, localUri);

        if (downloadResult.status !== 200) {
            throw new Error(`Failed to download image: ${downloadResult.status}`);
        }

        return downloadResult.uri;
    }

    return uri;
}

/**
 * Convert local file URI to base64
 */
export async function uriToBase64(uri: string): Promise<string> {
    // Ensure we have a local file
    const localUri = await ensureLocalUri(uri);

    const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
}

/**
 * Resize image to max dimension while maintaining aspect ratio
 */
export async function resizeImage(
    uri: string,
    maxDimension: number = 1024
): Promise<string> {
    // Ensure we have a local file
    const localUri = await ensureLocalUri(uri);

    const result = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: maxDimension } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
}

/**
 * Compress image for wardrobe (smaller size)
 */
export async function compressForWardrobe(uri: string): Promise<string> {
    const localUri = await ensureLocalUri(uri);

    const result = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 512 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
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
