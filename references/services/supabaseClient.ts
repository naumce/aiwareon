import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidSupabaseUrl = (url: unknown): url is string => {
    if (typeof url !== 'string' || url.trim().length === 0) return false;
    try {
        const u = new URL(url);
        return u.protocol === 'https:' && u.hostname.endsWith('.supabase.co');
    } catch {
        return false;
    }
};

const looksLikeJwt = (value: unknown): value is string => {
    if (typeof value !== 'string') return false;
    return value.split('.').length === 3 && value.length > 40;
};

// Only initialize if keys exist
export const supabase = (isValidSupabaseUrl(supabaseUrl) && looksLikeJwt(supabaseAnonKey))
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            flowType: 'pkce',
            detectSessionInUrl: true,
            persistSession: true,
            autoRefreshToken: true,
        },
    })
    : null;

export const isSupabaseConfigured = () => !!supabase;

export const getProfile = async (userId: string) => {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('credits, full_name')
            .eq('id', userId)
            .single();

        if (error) {
            console.warn("Profile fetch error:", error.message);
            return null;
        }
        return data;
    } catch (err) {
        return null;
    }
};

export const deductCredits = async (userId: string, amount: number): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Database connection failed' };

    try {
        const { error } = await supabase.rpc('deduct_credits', {
            amount_to_deduct: amount
        });

        if (error) {
            console.error("Credit deduction failed:", error.message);
            return { error: error.message };
        }

        return { error: null };
    } catch (err: any) {
        return { error: err.message || 'Network error during payment' };
    }
};
