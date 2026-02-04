import { fal } from '@fal-ai/client';
import { config } from '../config';
import { uriToBase64, resizeImage } from '../utils/imageUtils';
import * as geminiService from './geminiService';

// Configure fal client
fal.config({
    credentials: config.fal.apiKey,
});

type FalCategory = 'tops' | 'bottoms' | 'one-pieces';

/**
 * Upload image to Fal storage
 */
async function uploadImageToFal(imageUri: string): Promise<string> {
    try {
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
    } catch (error) {
        console.error('Error uploading to Fal:', error);
        throw error;
    }
}

/**
 * Fal AI Virtual Try-On
 */
export async function virtualTryOn(
    personImageUri: string,
    garmentImageUri: string,
    category: FalCategory = 'tops',
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

    try {
        const result = await fal.subscribe('fal-ai/cat-vton', {
            input: {
                human_image_url: personUrl,
                garment_image_url: garmentUrl,
                cloth_type: category,
                // @ts-ignore - fal types may not be up to date
                garment_description: description,
                num_inference_steps: numSteps,
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === 'IN_PROGRESS') {
                    console.log('Fal generation in progress...');
                }
            },
        });

        // Extract result URL
        const imageUrl = (result.data as any)?.image?.url;
        if (!imageUrl) {
            throw new Error('No image URL in Fal response');
        }

        return imageUrl;
    } catch (error) {
        console.error('Fal virtual try-on error:', error);
        throw error;
    }
}

/**
 * Detect clothing category using Fal vision model
 */
export async function detectClothingCategory(
    imageUri: string
): Promise<FalCategory> {
    try {
        const imageUrl = await uploadImageToFal(imageUri);

        // Use a simple heuristic or Gemini for now
        // Fal's category detection would go here
        const result = await geminiService.categorizeGarment(imageUri);

        // Map to Fal categories
        const category = result.category;
        if (category === 'dresses') return 'one-pieces';
        if (category === 'bottoms') return 'bottoms';
        return 'tops';
    } catch (error) {
        console.error('Error detecting category:', error);
        return 'tops';
    }
}
