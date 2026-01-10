import { create } from 'zustand';
import { supabase, isSupabaseConfigured, getProfile } from '../services/supabaseClient';

interface AuthState {
    session: any | null;
    isLoading: boolean;
    isInitialized: boolean;

    // Computed values
    isGuest: boolean;
    userLabel: string;
    userInitial: string;
    userEmail: string | null;
    userId: string | null;

    // Actions
    setSession: (session: any) => void;
    signInWithGoogle: () => Promise<{ error: string | null }>;
    signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
    signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
    signOut: () => Promise<void>;
    initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    isLoading: true,
    isInitialized: false,
    isGuest: true,
    userLabel: 'Guest',
    userInitial: 'G',
    userEmail: null,
    userId: null,

    setSession: (session) => {
        const userLabel = session?.user?.user_metadata?.full_name ||
            session?.user?.email ||
            'User';
        set({
            session,
            isGuest: !session,
            userLabel,
            userInitial: (userLabel.trim()?.[0] || 'U').toUpperCase(),
            userEmail: session?.user?.email || null,
            userId: session?.user?.id || null,
        });
    },

    signInWithGoogle: async () => {
        if (!supabase) {
            return { error: 'Supabase not configured' };
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account'
                    }
                }
            });

            if (error) throw error;
            return { error: null };
        } catch (err: any) {
            console.error("Auth error:", err);
            return {
                error: `Login failed: ${err.message}`
            };
        }
    },

    signInWithEmail: async (email: string, password: string) => {
        if (!supabase) {
            return { error: 'Supabase not configured' };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            get().setSession(data.session);
            return { error: null };
        } catch (err: any) {
            console.error("Email login error:", err);
            return {
                error: err.message || 'Login failed. Please check your credentials.'
            };
        }
    },

    signUpWithEmail: async (email: string, password: string) => {
        if (!supabase) {
            return { error: 'Supabase not configured' };
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin,
                }
            });

            if (error) throw error;

            // Check if email confirmation is required
            if (data.user && !data.session) {
                return { error: null, needsConfirmation: true };
            }

            get().setSession(data.session);
            return { error: null, needsConfirmation: false };
        } catch (err: any) {
            console.error("Email signup error:", err);
            return {
                error: err.message || 'Signup failed. Please try again.'
            };
        }
    },

    signOut: async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        set({
            session: null,
            isGuest: true,
            userLabel: 'Guest',
            userInitial: 'G',
            userEmail: null,
            userId: null,
        });
    },

    initAuth: async () => {
        if (!isSupabaseConfigured()) {
            set({ isLoading: false, isInitialized: true });
            return;
        }

        try {
            const { data: { session } } = await supabase!.auth.getSession();
            get().setSession(session);

            // Listen for auth changes
            supabase!.auth.onAuthStateChange((_event, session) => {
                get().setSession(session);
            });
        } catch (err) {
            console.error('Auth init error:', err);
        } finally {
            set({ isLoading: false, isInitialized: true });
        }
    },
}));

