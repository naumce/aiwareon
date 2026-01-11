import { fal } from "@fal-ai/client";

// Configure fal client
fal.config({
    credentials: import.meta.env.VITE_FAL_API_KEY
});

/**
 * SMART ROUTER (Cost: ~$0.0005)
 * Step 1: Is there a person wearing this garment?
 *   - YES → Return 'one-pieces' (safest, prevents glitches)
 *   - NO → Detect actual category (tops/bottoms/one-pieces)
 */
async function detectClothingCategory(garmentUrl: string): Promise<string> {
    try {
        // First: Check if there's a model in the image
        const checkModelResult: any = await fal.run("fal-ai/llava-next", {
            input: {
                image_url: garmentUrl,
                prompt: "Is there a person or model visible in this image? Answer only 'yes' or 'no'."
            }
        });

        const hasModel = checkModelResult.data.output.toLowerCase().includes('yes');

        if (hasModel) {
            // Safe mode: garment on model → always use 'one-pieces'
            console.log('Detected: Garment on model → using one-pieces (safe mode)');
            return 'one-pieces';
        }

        // Second: No model → detect actual garment type
        const categoryResult: any = await fal.run("fal-ai/llava-next", {
            input: {
                image_url: garmentUrl,
                prompt: "Classify this clothing item into exactly one of these categories: 'tops', 'bottoms', or 'one-pieces'. Return only the word."
            }
        });

        const category = categoryResult.data.output.toLowerCase().trim().replace('.', '');
        const validCategories = ['tops', 'bottoms', 'one-pieces'];
        const detected = validCategories.includes(category) ? category : 'tops';

        console.log(`Detected: Clothing only → category: ${detected}`);
        return detected;

    } catch (e) {
        console.warn("Router failed, defaulting to 'one-pieces' (safest)", e);
        return 'one-pieces'; // Safest default
    }
}

/**
 * Helper to upload base64 to Fal storage
 */
async function uploadImageToFal(input: string): Promise<string> {
    try {
        console.log("uploadImageToFal v2 called. Input starts with:", input.substring(0, 30));
        let file: File;

        if (input.startsWith('data:')) {
            // Base64 logic
            const parts = input.split(',');
            if (parts.length < 2) {
                throw new Error('Invalid Base64 string: Missing comma separator');
            }
            const base64Data = parts[1];
            if (!base64Data) {
                throw new Error('Invalid Base64 string: Empty data');
            }

            // Fix for URL-safe base64 and add padding
            let cleanBase64 = base64Data.trim().replace(/-/g, '+').replace(/_/g, '/');
            while (cleanBase64.length % 4) {
                cleanBase64 += '=';
            }

            let byteCharacters;
            try {
                byteCharacters = atob(cleanBase64);
            } catch (atobError) {
                console.error('atob failed. Data snippet:', cleanBase64.substring(0, 50));
                throw new Error(`Failed to decode Base64: ${atobError}`);
            }

            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'image/jpeg' });
            file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        } else {
            // URL logic (Fetch -> Blob)
            const response = await fetch(input);
            const blob = await response.blob();
            file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' });
        }

        return await fal.storage.upload(file);
    } catch (e) {
        console.error('Fal upload helper failed:', e);
        // Fallback: if it's already a public URL, return it
        if (input.startsWith('http')) return input;
        throw e;
    }
}

/**
 * STUDIO ENHANCER (Cost: ~$0.01)
 * High-fidelity 2nd pass that sharpens eyes, skin, and fabric weave.
 * Only called for Studio quality tier.
 */
export const enhanceToStudio = async (imageUrl: string): Promise<string> => {
    try {
        console.log('Studio Pass: Enhancing texture and resolution...');

        const result: any = await fal.subscribe("fal-ai/flux-vision-upscaler", {
            input: {
                image_url: imageUrl,
                upscale_factor: 2,    // 2x magnification for 4K detail
                creativity: 0.1,      // Low = preserve face identity
                guidance: 1.5,        // Strict adherence to source
                steps: 20             // Balanced speed/quality
            },
            logs: true
        });

        if (!result.data?.image?.url) {
            console.warn("Studio enhancement failed, returning original");
            return imageUrl;
        }

        console.log('Studio enhancement complete!');
        return result.data.image.url;

    } catch (e) {
        console.warn("Studio enhancement failed, returning standard result.", e);
        return imageUrl; // Fallback to original
    }
};


/**
 * 2. THE TAILOR (Cost: ~$0.02)
 * The main VTON function with quality-based resolution.
 */
export const virtualTryOn = async (
    personImageBase64: string,
    garmentImageBase64: string,
    description: string,
    geminiCategory: string,
    quality: 'standard' | 'studio' = 'standard' // Quality tier
): Promise<string> => {
    try {
        // Step A: Upload images in parallel
        const [personUrl, garmentUrl] = await Promise.all([
            uploadImageToFal(personImageBase64),
            uploadImageToFal(garmentImageBase64)
        ]);

        // If geminiCategory is one of the valid raw categories (meaning passed manually or detected), use it.
        // If passed manually, we skip the router detection to save time/cost.
        // Step B: Run the "Router" to detect if garment has model
        const validCategories = ['tops', 'bottoms', 'one-pieces'];
        let internalCategory = geminiCategory;

        if (validCategories.includes(geminiCategory)) {
            console.log(`Manual/Pre-set Category used: ${geminiCategory} (Skipping Auto-Detection)`);
            internalCategory = geminiCategory;
        } else {
            const detectedCategory = await detectClothingCategory(garmentUrl);
            console.log(`Auto-detected Category: ${detectedCategory}`);
            internalCategory = detectedCategory === 'one-pieces' ? 'one-pieces' : geminiCategory;
        }

        // MAP TO IDM-VTON API VALUES
        // IDM-VTON expects: 'upper_body', 'lower_body', 'dresses'
        const categoryMapping: Record<string, string> = {
            'tops': 'upper_body',
            'bottoms': 'lower_body',
            'one-pieces': 'dresses'
        };

        const finalCategory = categoryMapping[internalCategory] || 'dresses'; // Default to dresses
        console.log(`Final Category (API): ${finalCategory} (mapped from ${internalCategory})`);

        // Quality-based resolution (EXACT 9:16 aspect ratio for body proportion preservation)
        const width = quality === 'studio' ? 1024 : 768;
        const height = quality === 'studio' ? 1820 : 1365;
        const steps = quality === 'studio' ? 50 : 30;

        console.log(`Using Model: fal-ai/idm-vton | Quality: ${quality} | Resolution: ${width}x${height}`);

        // Step C: Run IDM-VTON (Proven Stable Model)
        const result: any = await fal.subscribe("fal-ai/idm-vton", {
            input: {
                human_image_url: personUrl,
                garment_image_url: garmentUrl,
                description: description,
                category: finalCategory,
                garment_photo_type: "model",

                // Resolution & Quality
                width: width,
                height: height,
                num_inference_steps: steps,
                guidance_scale: 2.0,
                seed: 42,
                output_format: "png"
            },
            logs: true,
            onQueueUpdate: (update: any) => {
                if (update.status === "IN_PROGRESS") {
                    console.log("fal.ai processing:", update.logs);
                }
            },
        });

        if (!result.data || !result.data.image || !result.data.image.url) {
            throw new Error("No image returned from fal.ai");
        }

        // Convert URL to base64 (required by generationService.ts)
        const imageUrl = result.data.image.url;
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

    } catch (error: any) {
        console.error("fal.ai Try-On Error:", error);
        throw new Error(error.message || "Virtual try-on failed");
    }
};