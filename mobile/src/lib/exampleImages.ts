// Example/placeholder images for Studio
// Uses reliable placeholder images when user has no saved data

export interface ExampleImage {
    id: string;
    url: string;
    label: string;
    category?: string;
}

// Using picsum.photos for reliable placeholder images
// These show fashion-like images that work even without network setup
// Replace with your Supabase storage URLs once uploaded

// Person examples - portrait style placeholders
export const PERSON_EXAMPLES: ExampleImage[] = [
    {
        id: 'person-1',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
        label: 'Model 1',
    },
    {
        id: 'person-2',
        url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop',
        label: 'Model 2',
    },
    {
        id: 'person-3',
        url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop',
        label: 'Model 3',
    },
];

// Garment examples - fashion/clothing placeholders
export const GARMENT_EXAMPLES: ExampleImage[] = [
    {
        id: 'garment-1',
        url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
        label: 'Summer Dress',
        category: 'one-pieces',
    },
    {
        id: 'garment-2',
        url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop',
        label: 'Casual Top',
        category: 'tops',
    },
    {
        id: 'garment-3',
        url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop',
        label: 'Evening Wear',
        category: 'one-pieces',
    },
    {
        id: 'garment-4',
        url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=500&fit=crop',
        label: 'Blouse',
        category: 'tops',
    },
];

// Showcase result images - try-on result placeholders
export const SHOWCASE_RESULTS: ExampleImage[] = [
    {
        id: 'result-1',
        url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop',
        label: 'Elegant Look'
    },
    {
        id: 'result-2',
        url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop',
        label: 'Summer Style'
    },
    {
        id: 'result-3',
        url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=500&fit=crop',
        label: 'Casual Outfit'
    },
];
