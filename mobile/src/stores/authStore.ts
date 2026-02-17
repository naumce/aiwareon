import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { User } from '../types';

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAnonymous: boolean;

    // Actions
    initialize: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
    signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
    signInWithGoogle: () => Promise<{ error?: string }>;
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

    signInWithGoogle: async () => {
        try {
            const redirectUrl = AuthSession.makeRedirectUri();

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account',
                    },
                },
            });

            if (error) throw error;

            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    redirectUrl,
                );

                if (result.type === 'success' && result.url) {
                    // Extract tokens from the redirect URL
                    const url = new URL(result.url);
                    const params = new URLSearchParams(url.hash.substring(1));
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');

                    if (accessToken && refreshToken) {
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });

                        if (sessionError) throw sessionError;
                    }
                }
            }

            return {};
        } catch (error: any) {
            console.error('Google OAuth error:', error);
            return { error: error.message || 'Google sign in failed' };
        }
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
