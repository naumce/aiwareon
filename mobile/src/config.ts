// Environment configuration for Expo
// Expo automatically injects EXPO_PUBLIC_* variables at build time

// Read from environment variables (must be prefixed with EXPO_PUBLIC_)
// In your mobile/.env file, add:
//   EXPO_PUBLIC_GEMINI_API_KEY=your-key-here
//   EXPO_PUBLIC_FAL_API_KEY=your-key-here

// Supabase
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mrjrsrnttvflefvnjyol.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanJzcm50dHZmbGVmdm5qeW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTM5OTQsImV4cCI6MjA4MjA2OTk5NH0.1IIO31JYYoi3MPtSGgnwVBrYcwyq40mgZQEUIWquR_k';

// AI Service API Keys from environment
const FAL_API_KEY = process.env.EXPO_PUBLIC_FAL_API_KEY || '';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export const config = {
    // Supabase
    supabase: {
        url: SUPABASE_URL,
        anonKey: SUPABASE_ANON_KEY,
    },

    // Fal.ai - Virtual try-on service
    fal: {
        apiKey: FAL_API_KEY,
    },

    // Google Gemini - Image generation
    gemini: {
        apiKey: GEMINI_API_KEY,
    },

    // Feature flags (auto-enable when keys are present)
    features: {
        enableFalAI: !!FAL_API_KEY,
        enableGemini: !!GEMINI_API_KEY,
        enableStudioQuality: true,
    },
} as const;

// Validate required environment variables
export function validateConfig(): { isValid: boolean; missing: string[] } {
    const required = [
        { key: 'supabase.url', value: config.supabase.url },
        { key: 'supabase.anonKey', value: config.supabase.anonKey },
    ];

    const missing = required
        .filter(({ value }) => !value)
        .map(({ key }) => key);

    return {
        isValid: missing.length === 0,
        missing,
    };
}

// Check if AI services are configured
export function hasAIServices(): boolean {
    return !!config.fal.apiKey || !!config.gemini.apiKey;
}
