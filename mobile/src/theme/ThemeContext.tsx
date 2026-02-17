import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// DRAPE Design System - Light Mode
export const lightColors = {
    background: {
        primary: '#F7F5F2',      // Warm white
        secondary: '#FFFFFF',
        tertiary: '#FFFFFF',
        elevated: '#FFFFFF',
        card: 'rgba(255, 255, 255, 0.85)',
    },
    text: {
        primary: '#1A1A2E',
        secondary: 'rgba(26, 26, 46, 0.55)',
        tertiary: 'rgba(26, 26, 46, 0.3)',
        muted: 'rgba(26, 26, 46, 0.4)',
        disabled: 'rgba(26, 26, 46, 0.18)',
    },
    brand: {
        primary: '#C9A0FF',    // Lavender
        secondary: '#FF8FAB',  // Rose
        accent: '#7DD3C0',     // Mint
        tint: 'rgba(201, 160, 255, 0.1)',
    },
    gradient: {
        primary: ['#C9A0FF', '#FF8FAB'] as [string, string],
        accent: ['#FF8FAB', '#FAD390'] as [string, string],
        subtle: ['rgba(201, 160, 255, 0.06)', 'rgba(255, 143, 171, 0.03)'] as [string, string],
    },
    state: {
        success: '#34C759',
        error: '#FF3B30',
        warning: '#FF9500',
        info: '#C9A0FF',
    },
    separator: {
        opaque: 'rgba(0, 0, 0, 0.08)',
        translucent: 'rgba(0, 0, 0, 0.05)',
    },
    fill: {
        primary: 'rgba(0, 0, 0, 0.06)',
        secondary: 'rgba(0, 0, 0, 0.04)',
        tertiary: 'rgba(0, 0, 0, 0.03)',
    },
    border: {
        subtle: 'rgba(0, 0, 0, 0.06)',
        default: 'rgba(0, 0, 0, 0.1)',
        active: 'rgba(201, 160, 255, 0.5)',
    },
} as const;

// DRAPE Design System - Dark Mode
export const darkColors = {
    background: {
        primary: '#1A1A2E',      // Deep navy
        secondary: '#252540',
        tertiary: '#2E2E4A',
        elevated: '#383855',
        card: 'rgba(46, 46, 74, 0.8)',
    },
    text: {
        primary: '#F7F5F2',
        secondary: 'rgba(247, 245, 242, 0.6)',
        tertiary: 'rgba(247, 245, 242, 0.3)',
        muted: 'rgba(247, 245, 242, 0.4)',
        disabled: 'rgba(247, 245, 242, 0.18)',
    },
    brand: {
        primary: '#C9A0FF',    // Lavender
        secondary: '#FF8FAB',  // Rose
        accent: '#7DD3C0',     // Mint
        tint: 'rgba(201, 160, 255, 0.15)',
    },
    gradient: {
        primary: ['#C9A0FF', '#FF8FAB'] as [string, string],
        accent: ['#FF8FAB', '#FAD390'] as [string, string],
        subtle: ['rgba(201, 160, 255, 0.1)', 'rgba(255, 143, 171, 0.05)'] as [string, string],
    },
    state: {
        success: '#30D158',
        error: '#FF453A',
        warning: '#FF9F0A',
        info: '#C9A0FF',
    },
    separator: {
        opaque: 'rgba(255, 255, 255, 0.08)',
        translucent: 'rgba(255, 255, 255, 0.05)',
    },
    fill: {
        primary: 'rgba(255, 255, 255, 0.1)',
        secondary: 'rgba(255, 255, 255, 0.07)',
        tertiary: 'rgba(255, 255, 255, 0.05)',
    },
    border: {
        subtle: 'rgba(255, 255, 255, 0.08)',
        default: 'rgba(255, 255, 255, 0.12)',
        active: 'rgba(201, 160, 255, 0.5)',
    },
} as const;

export type ThemeColors = typeof lightColors | typeof darkColors;
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
    colors: ThemeColors;
    mode: ThemeMode;
    isDark: boolean;
    setMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('system');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved preference
    useEffect(() => {
        AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
            if (saved === 'light' || saved === 'dark' || saved === 'system') {
                setModeState(saved);
            }
            setIsLoaded(true);
        });
    }, []);

    const setMode = useCallback((newMode: ThemeMode) => {
        setModeState(newMode);
        AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    }, []);

    const toggleTheme = useCallback(() => {
        const effectiveIsDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
        setMode(effectiveIsDark ? 'light' : 'dark');
    }, [mode, systemScheme, setMode]);

    const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
    const colors = isDark ? darkColors : lightColors;

    if (!isLoaded) {
        return null; // Or a splash screen
    }

    return (
        <ThemeContext.Provider value={{ colors, mode, isDark, setMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

// For static imports (backward compatibility) - defaults to light (DRAPE)
export { lightColors as colors };
