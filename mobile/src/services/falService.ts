import { fal } from '@fal-ai/client';
import { config } from '../config';
import { uriToBase64, resizeImage } from '../utils/imageUtils';
import * as geminiService from './geminiService';

// Configure fal client
fal.config({
    credentials: config.fal.apiKey,
});

type FalCategory = 'upper' | 'lower' | 'overall' | 'inner' | 'outer';

/**
 * Upload image to Fal storage
 */
async function uploadImageToFal(imageUri: string): Promise<string> {
    // Resize and convert to base64
    const resized = await resizeImage(imageUri, 1024);
    const base64 = await uriToBase64(resized);

    // Create blob from base64
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

    // Upload to Fal
    const url = await fal.storage.upload(file);
    return url;
}

/**
 * Fal AI Virtual Try-On
 */
export async function virtualTryOn(
    personImageUri: string,
    garmentImageUri: string,
    category: FalCategory = 'upper',
    quality: 'standard' | 'studio' = 'standard'
): Promise<string> {
    // Get garment description from Gemini
    const description = await geminiService.describeGarment(garmentImageUri);

    // Upload images to Fal storage
    const [personUrl, garmentUrl] = await Promise.all([
        uploadImageToFal(personImageUri),
        uploadImageToFal(garmentImageUri),
    ]);

    // Set resolution based on quality
    const numSteps = quality === 'studio' ? 50 : 30;

    const input = {
        human_image_url: personUrl,
        garment_image_url: garmentUrl,
        cloth_type: category,
        num_inference_steps: numSteps,
    };

    const result = await fal.subscribe('fal-ai/cat-vton', {
        input: Object.assign(input, { garment_description: description }),
        logs: true,
    });

    // Extract result URL
    const imageUrl = (result.data as any)?.image?.url;
    if (!imageUrl) {
        throw new Error('No image URL in Fal response');
    }

    return imageUrl;
}

/**
 * Detect clothing category using Fal vision model
 */
export async function detectClothingCategory(
    imageUri: string
): Promise<FalCategory> {
    try {
        // Use Gemini for category detection
        const result = await geminiService.categorizeGarment(imageUri);

        // Map to Fal categories
        const category = result.category;
        if (category === 'dresses') return 'overall';
        if (category === 'bottoms') return 'lower';
        return 'upper';
    } catch {
        return 'upper';
    }
}
