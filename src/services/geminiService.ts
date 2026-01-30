import { GoogleGenAI } from "@google/genai";

// Safe client initialization
const getAiClient = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing. Restart npm run dev.");
    return new GoogleGenAI({ apiKey });
};

async function resizeImage(base64: string, maxDim: number = 640): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            if (width > height) {
                if (width > maxDim) { height *= maxDim / width; width = maxDim; }
            } else {
                if (height > maxDim) { width *= maxDim / height; height = maxDim; }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
            }
            resolve(canvas.toDataURL('image/jpeg', 0.80));
        };
        img.onerror = () => resolve(base64);
        img.src = base64;
    });
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * GEMINI Virtual Try-On
 * - gemini2 → gemini-2.5-flash-image (faster)
 * - geminipro → gemini-3-pro-image-preview (higher quality)
 */
export const virtualTryOn = async (
    referencePhoto: string,
    dressBase64: string,
    modelType: 'gemini2' | 'geminipro' = 'gemini2',
    retries: number = 2,
    userPrompt?: string
): Promise<string> => {
    try {
        console.log('🔍 GEMINI SERVICE - virtualTryOn called');
        console.log('  📸 Person image:', referencePhoto.substring(0, 50) + '...');
        console.log('  👗 Dress image:', dressBase64.substring(0, 50) + '...');
        console.log('  🎯 Model type:', modelType);
        console.log('  💬 User prompt:', userPrompt || '(none)');

        const ai = getAiClient();
        const targetModel = modelType === 'geminipro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
        const maxDim = modelType === 'geminipro' ? 2048 : 1024;

        console.log('  🤖 Target Gemini model:', targetModel);
        console.log('  📐 Max dimension:', maxDim);

        const [resizedRef, resizedDress] = await Promise.all([
            resizeImage(referencePhoto, maxDim),
            resizeImage(dressBase64, maxDim)
        ]);

        const pData = resizedRef.split(',')[1];
        const dData = resizedDress.split(',')[1];

        // Build the prompt with optional user styling notes
        let fullPrompt = `VIRTUAL TRY-ON - EXACT GARMENT REPLACEMENT ONLY

CRITICAL RULES:
- DO NOT add any clothing items not present in Image 2 (the garment)
- DO NOT add coats, jackets, or accessories beyond what's in Image 2
- DO NOT reinterpret or "enhance" the outfit
- This is a SWAP operation, not a styling session

PERSON (Image 1):
Keep 100% identical: face, skin tone, hair, body pose, background, lighting
Preserve visible items: sunglasses, earrings, jewelry, phone in hand

GARMENT (Image 2):
Use ONLY this item. Copy its exact: color, pattern, fabric texture, cut, sleeve length
If it's a dress, output a dress. If it's a top, output a top. Do not add layers.

REPLACEMENT:
1. Remove the existing black outfit from Image 1
2. Place the garment from Image 2 onto the person's body
3. Ensure natural draping that matches their pose
4. Blend skin at neckline/shoulders to match Image 1's skin tone
5. Keep the phone and hand in the foreground, overlapping the new garment

OUTPUT: High-quality editorial photo, studio lighting, photorealistic skin texture.`;

        // Append user styling notes if provided
        if (userPrompt) {
            fullPrompt += `\n\nSTYLING CONTEXT FROM USER: ${userPrompt}`;
        }

        const response = await ai.models.generateContent({
            model: targetModel,
            contents: {
                parts: [
                    { inlineData: { data: pData, mimeType: 'image/jpeg' } },
                    { inlineData: { data: dData, mimeType: 'image/jpeg' } },
                    { text: fullPrompt },

                ],
            },
            config: {
                ...(modelType === 'geminipro' ? {
                    imageConfig: {
                        imageSize: '1K',
                        aspectRatio: '9:16'
                    }
                } : {
                    imageConfig: {
                        aspectRatio: '9:16'
                    }
                })
            }
        });

        let imageBase64 = "";
        let refusalText = "";

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from AI model");
        }

        for (const part of response.candidates[0]?.content?.parts || []) {
            if (part.inlineData) {
                imageBase64 = `data:image/png;base64,${part.inlineData.data}`;
            } else if (part.text) {
                refusalText += part.text;
            }
        }

        if (imageBase64) return imageBase64;

        if (refusalText) {
            throw new Error(`AI Refusal: ${refusalText.slice(0, 100)}...`);
        }

        throw new Error("Neural synthesis failed. No image data returned.");
    } catch (error: any) {
        console.error("Try-On Error Details:", error);
        if (retries > 0 && (error.message?.includes('500') || error.status === 500)) {
            await delay(2000);
            return virtualTryOn(referencePhoto, dressBase64, modelType, retries - 1);
        }
        throw error;
    }
};

/**
 * UPSCALE with Gemini 3 Pro
 * Takes existing result and enhances quality
 */
export const upscaleImage = async (
    resultImageBase64: string,
    retries: number = 2
): Promise<string> => {
    try {
        console.log('🔍 GEMINI UPSCALE - Enhancing with Gemini 3 Pro...');

        const ai = getAiClient();
        const resized = await resizeImage(resultImageBase64, 2048); // Max quality
        const imageData = resized.split(',')[1];

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: imageData, mimeType: 'image/jpeg' } },
                    {
                        text: `TASK: ENHANCE IMAGE QUALITY

Enhance this fashion photo to ultra-high quality:
- Sharpen facial details and skin texture
- Enhance fabric texture and pattern details  
- Improve lighting and color accuracy
- Maintain exact composition and pose
- Output at maximum resolution with photorealistic quality

Do NOT change the person, clothing, or composition. Only enhance quality.`
                    }
                ]
            },
            config: {
                imageConfig: {
                    imageSize: '1K',
                    aspectRatio: '9:16'
                }
            }
        });

        let imageBase64 = "";

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from upscale");
        }

        for (const part of response.candidates[0]?.content?.parts || []) {
            if (part.inlineData) {
                imageBase64 = `data:image/png;base64,${part.inlineData.data}`;
                break;
            }
        }

        if (imageBase64) {
            console.log('✅ Upscale complete!');
            return imageBase64;
        }

        throw new Error("Upscale failed - no image returned");
    } catch (error: any) {
        console.error("Upscale Error:", error);
        if (retries > 0 && (error.message?.includes('500') || error.status === 500)) {
            await delay(2000);
            return upscaleImage(resultImageBase64, retries - 1);
        }
        throw error;
    }
};

/**
 * Garment description for Fal AI (only used when Fal is selected)
 */
export const describeGarment = async (imageBase64: string): Promise<string> => {
    const ai = getAiClient();
    const resized = await resizeImage(imageBase64, 512);
    const imageData = resized.split(',')[1];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: imageData, mimeType: 'image/jpeg' } },
                {
                    text: `Analyze this garment image. Return JSON only:
{
  "category": "upper_body" | "lower_body" | "one-pieces",
  "description": "Clean 5-10 word description of the garment"
}

If NOT a clear garment image, return: {"error": "INVALID_GARMENT"}`
                }
            ]
        }
    });

    console.log('📝 Gemini describeGarment response:', response);

    // Extract text from response structure
    if (!response.candidates || response.candidates.length === 0) {
        console.warn('No candidates in response, using fallback');
        return '{"category": "one-pieces", "description": "clothing item"}';
    }

    const parts = response.candidates[0]?.content?.parts;
    if (!parts || parts.length === 0) {
        console.warn('No parts in response, using fallback');
        return '{"category": "one-pieces", "description": "clothing item"}';
    }

    const textResult = parts[0]?.text || '';
    console.log('📝 Extracted text from parts:', textResult);

    if (!textResult) {
        console.warn('No text from Gemini, using fallback');
        return '{"category": "one-pieces", "description": "clothing item"}';
    }

    return textResult;
};

export const animateTryOn = async (
    compositeBase64: string,
    motionDescription: string,
    onProgress: (msg: string) => void
): Promise<Blob> => {
    try {
        const ai = getAiClient();
        const resizedComp = await resizeImage(compositeBase64, 720);
        const cData = resizedComp.split(',')[1];

        onProgress("Initializing fluid physics...");
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: `Cinematic fashion film. ${motionDescription}. 
      The person stands in the exact same environment.
      IDENTITY LOCK: The face and hair must remain static and consistent. 
      PHYSICS: Only the fabric of the dress should move and react naturally.`,
            image: { imageBytes: cData, mimeType: 'image/jpeg' },
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
        });

        while (!operation.done) {
            onProgress("Rendering neural frames...");
            await new Promise(resolve => setTimeout(resolve, 8000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("Video synthesis failed.");

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const response = await fetch(`${downloadLink}&key=${apiKey}`);

        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

        return await response.blob();
    } catch (error: any) {
        console.error("Video Error:", error);
        throw error;
    }
};
