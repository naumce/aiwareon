// Environment configuration for Expo
// Expo automatically injects EXPO_PUBLIC_* variables at build time

// Read from environment variables (must be prefixed with EXPO_PUBLIC_)
// In your mobile/.env file, add:
//   EXPO_PUBLIC_GEMINI_API_KEY=your-key-here
//   EXPO_PUBLIC_FAL_API_KEY=your-key-here

// Supabase - REQUIRED (no fallbacks for security)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// AI Service API Keys - OPTIONAL
const FAL_API_KEY = process.env.EXPO_PUBLIC_FAL_API_KEY || '';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

// Error Tracking - OPTIONAL
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

// Validate required environment variables at module load
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const missingVars = [];
    if (!SUPABASE_URL) missingVars.push('EXPO_PUBLIC_SUPABASE_URL');
    if (!SUPABASE_ANON_KEY) missingVars.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');

    throw new Error(
        '❌ Missing required environment variables!\n\n' +
        `Missing: ${missingVars.join(', ')}\n\n` +
        'Please ensure your .env file contains all required variables.\n' +
        'See .env.example for reference.'
    );
}

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

    // Sentry - Error tracking
    sentry: {
        dsn: SENTRY_DSN,
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
