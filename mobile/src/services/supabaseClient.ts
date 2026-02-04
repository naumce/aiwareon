import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Custom storage adapter for Supabase that wraps AsyncStorage
// This fixes the "expected dynamic type 'boolean', but had type 'string'" error
const ExpoSecureStoreAdapter = {
    getItem: async (key: string) => {
        const value = await AsyncStorage.getItem(key);
        return value;
    },
    setItem: async (key: string, value: string) => {
        await AsyncStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
        await AsyncStorage.removeItem(key);
    },
};

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
        auth: {
            storage: ExpoSecureStoreAdapter,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false, // Important for React Native
        },
    }
);

// Helper to get current user
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Helper to get current session
export async function getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}
