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

export const virtualTryOn = async (
    referencePhoto: string,
    dressBase64: string,
    poseDescription: string,
    quality: 'standard' | 'studio' = 'standard',
    retries: number = 2
): Promise<string> => {
    try {
        const ai = getAiClient();
        const targetModel = quality === 'studio' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
        const maxDim = quality === 'studio' ? 2048 : 1024;

        const [resizedRef, resizedDress] = await Promise.all([
            resizeImage(referencePhoto, maxDim),
            resizeImage(dressBase64, maxDim)
        ]);

        const pData = resizedRef.split(',')[1];
        const dData = resizedDress.split(',')[1];

        const response = await ai.models.generateContent({
            model: targetModel,
            contents: {
                parts: [
                    { inlineData: { data: pData, mimeType: 'image/jpeg' } },
                    { inlineData: { data: dData, mimeType: 'image/jpeg' } },
                    {
                        text: `TASK: VIRTUAL TRY-ON & CLOTHING REPLACEMENT
            
1. IDENTIFY: The person in Image 1 and the garment in Image 2.
2. ACTION: Completely remove the person's current outfit in Image 1 (especially all black layers and sleeves). 
3. REPLACE: Apply the garment from Image 2 to the person.
4. MAINTAIN: Keep the face, hair, glasses, jewelry, and the smartphone/hand in Image 1 exactly as they are.
5. INTEGRATE: Reconstruct skin on shoulders/neck if the new garment is more open. Ensure the hand holding the phone is in FRONT of the new garment.
6. STYLE: High-end fashion editorial quality. Consistent lighting.`,
                    },
                ],
            },
            config: {
                ...(quality === 'studio' ? {
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

        for (const part of response.candidates[0].content.parts) {
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
            return virtualTryOn(referencePhoto, dressBase64, poseDescription, quality, retries - 1);
        }
        throw error;
    }
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
