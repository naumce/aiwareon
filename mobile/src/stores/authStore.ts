import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import type { User } from '../types';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAnonymous: boolean;

    // Actions
    initialize: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
    signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
    requestPasswordReset: (email: string) => Promise<{ error?: string }>;
    resetPassword: (password: string) => Promise<{ error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true,
    isAnonymous: false,

    initialize: async () => {
        try {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                set({
                    user: {
                        id: session.user.id,
                        email: session.user.email || '',
                        created_at: session.user.created_at,
                    },
                    isAnonymous: session.user.is_anonymous || false,
                    isLoading: false,
                });
            } else {
                set({ user: null, isLoading: false });
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange((event, session) => {
                if (session?.user) {
                    set({
                        user: {
                            id: session.user.id,
                            email: session.user.email || '',
                            created_at: session.user.created_at,
                        },
                        isAnonymous: session.user.is_anonymous || false,
                    });
                } else {
                    set({ user: null, isAnonymous: false });
                }
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ isLoading: false });
        }
    },

    signInWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { error: error.message };
        }
        return {};
    },

    signUpWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return { error: error.message };
        }
        return {};
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAnonymous: false });
    },

    requestPasswordReset: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'aiwear://reset-password',
        });

        if (error) {
            return { error: error.message };
        }
        return {};
    },

    resetPassword: async (password) => {
        const { error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            return { error: error.message };
        }
        return {};
    },
}));
