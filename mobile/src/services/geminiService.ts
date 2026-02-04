import { GoogleGenAI } from '@google/genai';
import { config } from '../config';
import { uriToBase64, resizeImage } from '../utils/imageUtils';

// Lazy initialization of AI client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
    if (!aiClient) {
        if (!config.gemini.apiKey) {
            throw new Error('Gemini API key not configured');
        }
        aiClient = new GoogleGenAI({ apiKey: config.gemini.apiKey });
    }
    return aiClient;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Gemini Virtual Try-On
 * - gemini2 → gemini-2.5-flash-image (faster)
 * - geminipro → gemini-3-pro-image-preview (higher quality)
 */
export async function virtualTryOn(
    personImageUri: string,
    garmentImageUri: string,
    modelType: 'gemini2' | 'geminipro' = 'gemini2',
    userPrompt?: string,
    retries: number = 2
): Promise<string> {
    const ai = getAiClient();

    // Select model based on type - matching web app exactly
    const targetModel = modelType === 'geminipro'
        ? 'gemini-3-pro-image-preview'
        : 'gemini-2.5-flash-image';
    const maxDim = modelType === 'geminipro' ? 2048 : 1024;

    console.log('🤖 Using Gemini model:', targetModel);

    // Resize images first
    const resizedPerson = await resizeImage(personImageUri, maxDim);
    const resizedGarment = await resizeImage(garmentImageUri, maxDim);

    // Convert to base64
    const personBase64 = await uriToBase64(resizedPerson);
    const garmentBase64 = await uriToBase64(resizedGarment);

    // Build the prompt - matching web app
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
1. Remove the existing outfit from Image 1
2. Place the garment from Image 2 onto the person's body
3. Ensure natural draping that matches their pose
4. Blend skin at neckline/shoulders to match Image 1's skin tone

OUTPUT: High-quality editorial photo, studio lighting, photorealistic skin texture.`;

    // Append user styling notes if provided
    if (userPrompt) {
        fullPrompt += `\n\nSTYLING CONTEXT FROM USER: ${userPrompt}`;
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: targetModel,
                contents: {
                    parts: [
                        { inlineData: { data: personBase64, mimeType: 'image/jpeg' } },
                        { inlineData: { data: garmentBase64, mimeType: 'image/jpeg' } },
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

            // Extract image from response
            if (!response.candidates || response.candidates.length === 0) {
                throw new Error('No candidates returned from AI model');
            }

            let imageBase64 = '';
            let refusalText = '';

            for (const part of response.candidates[0]?.content?.parts || []) {
                if (part.inlineData?.data) {
                    imageBase64 = `data:image/png;base64,${part.inlineData.data}`;
                } else if (part.text) {
                    refusalText += part.text;
                }
            }

            if (imageBase64) return imageBase64;

            if (refusalText) {
                throw new Error(`AI Refusal: ${refusalText.slice(0, 100)}...`);
            }

            throw new Error('No image in response');
        } catch (error: any) {
            console.error(`Gemini attempt ${attempt + 1} failed:`, error);

            if (attempt < retries && (error.message?.includes('500') || error.status === 500)) {
                await delay(2000 * (attempt + 1));
                continue;
            }

            throw error;
        }
    }

    throw new Error('All retry attempts failed');
}

/**
 * Describe garment for Fal AI
 */
export async function describeGarment(imageUri: string): Promise<string> {
    const ai = getAiClient();

    const resizedImage = await resizeImage(imageUri, 512);
    const base64 = await uriToBase64(resizedImage);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: base64, mimeType: 'image/jpeg' } },
                    {
                        text: `Analyze this garment image. Return JSON only:
{
  "category": "upper_body" | "lower_body" | "one-pieces",
  "description": "Clean 5-10 word description of the garment"
}

If NOT a clear garment image, return: {"error": "INVALID_GARMENT"}`,
                    },
                ],
            },
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || '{"category": "one-pieces", "description": "clothing item"}';
    } catch (error) {
        console.error('Error describing garment:', error);
        return '{"category": "one-pieces", "description": "clothing item"}';
    }
}

/**
 * Categorize garment for wardrobe
 */
export async function categorizeGarment(imageUri: string): Promise<{
    name: string;
    category: string;
    confidence: number;
}> {
    const ai = getAiClient();

    const resizedImage = await resizeImage(imageUri, 512);
    const base64 = await uriToBase64(resizedImage);

    const validCategories = [
        'tops', 'bottoms', 'dresses', 'outerwear',
        'bags', 'glasses', 'heels', 'sneakers'
    ];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: base64, mimeType: 'image/jpeg' } },
                    {
                        text: `Analyze this fashion item and respond with ONLY a JSON object:

{
  "name": "Brief descriptive name (e.g., 'Black Leather Jacket')",
  "category": "One of: ${validCategories.join(', ')}",
  "confidence": 0.0 to 1.0
}

No other text, just the JSON.`,
                    },
                ],
            },
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            return {
                name: result.name || 'Fashion Item',
                category: validCategories.includes(result.category) ? result.category : 'tops',
                confidence: result.confidence || 0.5,
            };
        }

        throw new Error('No valid JSON in response');
    } catch (error) {
        console.error('Error categorizing garment:', error);
        return {
            name: 'Fashion Item',
            category: 'tops',
            confidence: 0.3,
        };
    }
}
