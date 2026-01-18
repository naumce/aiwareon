/**
 * AI Categorization Service
 * Uses Gemini Vision to detect wardrobe item categories
 */

import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export type CategoryGroup = 'clothing' | 'accessories' | 'footwear';

export interface CategoryResult {
    category: string;
    categoryGroup: CategoryGroup;
    confidence: number;
    suggestedName: string;
}

const CATEGORY_PROMPT = `You are a fashion item categorizer. Analyze this image and categorize it.

Return ONLY a JSON object with these exact fields:
{
  "category": "<one of: tops, bottoms, dresses, outerwear, bags, glasses, jewelry, hats, scarves, heels, flats, sneakers, boots>",
  "categoryGroup": "<one of: clothing, accessories, footwear>",
  "confidence": <0.0 to 1.0>,
  "suggestedName": "<short descriptive name like 'Red Silk Dress' or 'Black Leather Bag'>"
}

Category mappings:
- clothing: tops, bottoms, dresses, outerwear
- accessories: bags, glasses, jewelry, hats, scarves  
- footwear: heels, flats, sneakers, boots

If the image is NOT a fashion item (person photo, random object, etc), return:
{
  "category": "unknown",
  "categoryGroup": "clothing",
  "confidence": 0,
  "suggestedName": "Unknown Item"
}

Return ONLY the JSON, no other text.`;

export async function categorizeItem(imageBase64: string): Promise<CategoryResult> {
    if (!API_KEY) {
        console.warn('Gemini API key not configured, using default category');
        return {
            category: 'tops',
            categoryGroup: 'clothing',
            confidence: 0,
            suggestedName: 'New Item'
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        // Clean base64 if needed
        const base64Data = imageBase64.includes(',')
            ? imageBase64.split(',')[1]
            : imageBase64;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{
                role: 'user',
                parts: [
                    { text: CATEGORY_PROMPT },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Data
                        }
                    }
                ]
            }]
        });

        const text = response.text || '';
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
            category: parsed.category || 'tops',
            categoryGroup: parsed.categoryGroup || 'clothing',
            confidence: parsed.confidence || 0.5,
            suggestedName: parsed.suggestedName || 'New Item'
        };
    } catch (error) {
        console.error('AI categorization failed:', error);
        return {
            category: 'tops',
            categoryGroup: 'clothing',
            confidence: 0,
            suggestedName: 'New Item'
        };
    }
}

// Get category group from category
export function getCategoryGroup(category: string): CategoryGroup {
    const clothing = ['tops', 'bottoms', 'dresses', 'outerwear'];
    const accessories = ['bags', 'glasses', 'jewelry', 'hats', 'scarves'];
    const footwear = ['heels', 'flats', 'sneakers', 'boots'];

    if (clothing.includes(category)) return 'clothing';
    if (accessories.includes(category)) return 'accessories';
    if (footwear.includes(category)) return 'footwear';
    return 'clothing';
}

// All available categories for UI
export const CATEGORIES = {
    clothing: [
        { id: 'tops', label: 'Tops', emoji: '👕' },
        { id: 'bottoms', label: 'Bottoms', emoji: '👖' },
        { id: 'dresses', label: 'Dresses', emoji: '👗' },
        { id: 'outerwear', label: 'Outerwear', emoji: '🧥' },
    ],
    accessories: [
        { id: 'bags', label: 'Bags', emoji: '👜' },
        { id: 'glasses', label: 'Glasses', emoji: '👓' },
        { id: 'jewelry', label: 'Jewelry', emoji: '💍' },
        { id: 'hats', label: 'Hats', emoji: '🎩' },
        { id: 'scarves', label: 'Scarves', emoji: '🧣' },
    ],
    footwear: [
        { id: 'heels', label: 'Heels', emoji: '👠' },
        { id: 'flats', label: 'Flats', emoji: '🥿' },
        { id: 'sneakers', label: 'Sneakers', emoji: '👟' },
        { id: 'boots', label: 'Boots', emoji: '👢' },
    ]
};

export const ALL_CATEGORIES = [
    ...CATEGORIES.clothing,
    ...CATEGORIES.accessories,
    ...CATEGORIES.footwear
];
