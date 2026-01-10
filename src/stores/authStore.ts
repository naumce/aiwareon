import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import { useGenerationStore } from './generationStore';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAnonymous: boolean;

    // Actions
    initialize: () => Promise<void>;
    signInAnonymously: () => Promise<{ error: string | null }>;
    signInWithGoogle: () => Promise<{ error: string | null }>;
    signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
    signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    upgradeAnonymousUser: (email: string, password: string) => Promise<{ error: string | null }>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            session: null,
            isLoading: true,
            isAnonymous: false,

            initialize: async () => {
                if (!isSupabaseConfigured() || !supabase) {
                    set({ isLoading: false });
                    return;
                }

                // Get initial session
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    set({
                        user: session.user,
                        session,
                        isAnonymous: session.user.is_anonymous ?? false,
                        isLoading: false
                    });
                } else {
                    set({ isLoading: false });
                }

                // Listen for auth changes
                supabase.auth.onAuthStateChange((_event, session) => {
                    set({
                        user: session?.user ?? null,
                        session,
                        isAnonymous: session?.user?.is_anonymous ?? false,
                    });
                });
            },

            signInAnonymously: async () => {
                if (!supabase) return { error: 'Supabase not configured' };

                const { data, error } = await supabase.auth.signInAnonymously();

                if (error) {
                    console.error('Anonymous sign in error:', error);
                    return { error: error.message };
                }

                set({
                    user: data.user,
                    session: data.session,
                    isAnonymous: true
                });

                return { error: null };
            },

            signInWithGoogle: async () => {
                if (!supabase) return { error: 'Supabase not configured' };

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
                } catch (error: any) {
                    console.error('Google OAuth error:', error);
                    return { error: error.message || 'Google sign in failed' };
                }
            },

            signInWithEmail: async (email: string, password: string) => {
                if (!supabase) return { error: 'Supabase not configured' };

                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    // Check if this is an OAuth-only account
                    if (error.message.includes('Invalid login credentials') ||
                        error.message.includes('Email not confirmed')) {
                        return {
                            error: 'This email is registered with Google sign-in. Please use "Sign in with Google" instead.'
                        };
                    }
                    return { error: error.message };
                }

                set({
                    user: data.user,
                    session: data.session,
                    isAnonymous: false,
                });

                return { error: null };
            },

            signUpWithEmail: async (email: string, password: string) => {
                if (!supabase) return { error: 'Supabase not configured' };

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) {
                    return { error: error.message };
                }

                if (data.user) {
                    set({
                        user: data.user,
                        session: data.session,
                        isAnonymous: false
                    });
                }

                return { error: null };
            },

            signOut: async () => {
                if (!supabase) return;

                // Clear generation store (uploaded images)
                useGenerationStore.getState().reset();

                await supabase.auth.signOut();
                set({
                    user: null,
                    session: null,
                    isAnonymous: false,
                });
            },

            // Per 02_AUTH_PATTERN: user_id must never change during upgrade
            upgradeAnonymousUser: async (email: string, password: string) => {
                if (!supabase) return { error: 'Supabase not configured' };

                const { isAnonymous, user } = get();

                if (!isAnonymous || !user) {
                    return { error: 'Not an anonymous user' };
                }

                // Link email to existing anonymous user
                const { data, error } = await supabase.auth.updateUser({
                    email,
                    password,
                });

                if (error) {
                    return { error: error.message };
                }

                set({
                    user: data.user,
                    isAnonymous: false
                });

                return { error: null };
            },
        }),
        {
            name: 'aiwear-auth',
            partialize: (state) => ({
                // Only persist minimal state
                isAnonymous: state.isAnonymous
            }),
        }
    )
);
