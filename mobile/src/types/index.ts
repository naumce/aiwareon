// Navigation types
export type RootStackParamList = {
    // Auth stack
    Landing: undefined;
    Login: undefined;
    ForgotPassword: undefined;
    ResetPassword: { token?: string };

    // Main app
    MainTabs: undefined;
    BuyCredits: undefined;
};

export type MainTabsParamList = {
    StudioTab: undefined;
    WardrobeTab: undefined;
    GalleryTab: undefined;
    AccountTab: undefined;
};

export type StudioStackParamList = {
    Studio: undefined;
    TonightsLook: undefined;
};

export type WardrobeStackParamList = {
    Wardrobe: undefined;
    Outfits: undefined;
};

// User types
export interface User {
    id: string;
    email: string;
    created_at: string;
}

// Wardrobe types
export type WardrobeCategory =
    | 'tops'
    | 'bottoms'
    | 'dresses'
    | 'outerwear'
    | 'bags'
    | 'glasses'
    | 'heels'
    | 'sneakers';

export type CategoryGroup = 'clothing' | 'accessories';

export interface WardrobeItem {
    id: string;
    user_id: string;
    name: string;
    category: WardrobeCategory;
    category_group: CategoryGroup;
    image_url: string;
    is_example?: boolean;
    ai_suggested?: boolean;
    ai_confidence?: number;
    created_at: string;
}

// Outfit types
export type OutfitOccasion =
    | 'date'
    | 'party'
    | 'training'
    | 'work'
    | 'casual'
    | 'beach'
    | 'night_out';

export interface Outfit {
    id: string;
    user_id: string;
    name: string;
    occasion: OutfitOccasion;
    item_ids: string[];
    items?: WardrobeItem[];
    created_at: string;
}

// Generation types
export type GenerationState = 'idle' | 'generating' | 'succeeded' | 'failed';

export type Quality = 'standard' | 'studio';

export type ModelType = 'fal' | 'gemini2' | 'geminipro';

export type FalCategory = 'upper' | 'lower' | 'overall' | 'inner' | 'outer';

export interface GenerationError {
    message: string;
    userMessage?: string;
    code?: string;
}

export interface MediaItem {
    id: string;
    user_id: string;
    object_path: string;
    kind: 'result' | 'person' | 'garment';
    generation_id?: string;
    created_at: string;
}

// Person image types
export interface PersonImage {
    id: string;
    user_id: string;
    url?: string;
    storage_path: string;
    last_used_at?: string;
    created_at: string;
}
