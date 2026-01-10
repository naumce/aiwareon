import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validation helpers
function isValidSupabaseUrl(url: string): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' && parsed.hostname.includes('supabase');
    } catch {
        return false;
    }
}

function looksLikeJwt(key: string): boolean {
    if (!key) return false;
    const parts = key.split('.');
    return parts.length === 3 && parts.every((p) => p.length > 10);
}

// Create Supabase client only if configured
export const supabase: SupabaseClient | null =
    isValidSupabaseUrl(supabaseUrl) && looksLikeJwt(supabaseAnonKey)
        ? createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                flowType: 'pkce',
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
            },
        })
        : null;

export function isSupabaseConfigured(): boolean {
    return supabase !== null;
}

// Profile operations
export async function getProfile(userId: string) {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('credits, full_name')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data;
}
