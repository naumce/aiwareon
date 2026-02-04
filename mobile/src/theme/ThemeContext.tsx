import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// iOS System Colors - Light Mode
export const lightColors = {
    background: {
        primary: '#FFFFFF',
        secondary: '#F2F2F7',    // System Gray 6
        tertiary: '#FFFFFF',
        elevated: '#FFFFFF',
        card: '#FFFFFF',
    },
    text: {
        primary: '#000000',
        secondary: 'rgba(60, 60, 67, 0.6)',
        tertiary: 'rgba(60, 60, 67, 0.3)',
        muted: 'rgba(60, 60, 67, 0.4)',
        disabled: 'rgba(60, 60, 67, 0.18)',
    },
    brand: {
        primary: '#007AFF',    // iOS blue (light mode)
        secondary: '#5856D6',  // iOS indigo
        accent: '#AF52DE',     // iOS purple
        tint: 'rgba(0, 122, 255, 0.1)',
    },
    gradient: {
        primary: ['#5856D6', '#007AFF'] as [string, string],
        accent: ['#AF52DE', '#FF2D55'] as [string, string],
        subtle: ['rgba(0,0,0,0.03)', 'rgba(0,0,0,0.01)'] as [string, string],
    },
    state: {
        success: '#34C759',  // iOS green light
        error: '#FF3B30',    // iOS red light
        warning: '#FF9500',  // iOS orange light
        info: '#007AFF',
    },
    separator: {
        opaque: '#C6C6C8',
        translucent: 'rgba(60, 60, 67, 0.29)',
    },
    fill: {
        primary: 'rgba(120, 120, 128, 0.2)',
        secondary: 'rgba(120, 120, 128, 0.16)',
        tertiary: 'rgba(118, 118, 128, 0.12)',
    },
    border: {
        subtle: 'rgba(60, 60, 67, 0.18)',
        default: 'rgba(60, 60, 67, 0.29)',
        active: 'rgba(0, 122, 255, 0.5)',
    },
} as const;

// iOS System Colors - Dark Mode
export const darkColors = {
    background: {
        primary: '#000000',      // Pure black for OLED
        secondary: '#1C1C1E',    // System gray 6
        tertiary: '#2C2C2E',     // System gray 5
        elevated: '#3A3A3C',     // System gray 4
        card: 'rgba(44, 44, 46, 0.8)',
    },
    text: {
        primary: '#FFFFFF',
        secondary: 'rgba(235, 235, 245, 0.6)',
        tertiary: 'rgba(235, 235, 245, 0.3)',
        muted: 'rgba(235, 235, 245, 0.4)',
        disabled: 'rgba(235, 235, 245, 0.18)',
    },
    brand: {
        primary: '#0A84FF',    // iOS blue dark
        secondary: '#5E5CE6',  // iOS indigo
        accent: '#BF5AF2',     // iOS purple
        tint: 'rgba(10, 132, 255, 0.1)',
    },
    gradient: {
        primary: ['#5E5CE6', '#0A84FF'] as [string, string],
        accent: ['#BF5AF2', '#FF2D55'] as [string, string],
        subtle: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] as [string, string],
    },
    state: {
        success: '#30D158',  // iOS green dark
        error: '#FF453A',    // iOS red dark
        warning: '#FF9F0A',  // iOS orange dark
        info: '#0A84FF',
    },
    separator: {
        opaque: '#38383A',
        translucent: 'rgba(84, 84, 88, 0.65)',
    },
    fill: {
        primary: 'rgba(120, 120, 128, 0.2)',
        secondary: 'rgba(120, 120, 128, 0.16)',
        tertiary: 'rgba(118, 118, 128, 0.12)',
    },
    border: {
        subtle: 'rgba(84, 84, 88, 0.4)',
        default: 'rgba(84, 84, 88, 0.65)',
        active: 'rgba(10, 132, 255, 0.5)',
    },
} as const;

export type ThemeColors = typeof lightColors;
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

// For static imports (backward compatibility) - defaults to dark
export { darkColors as colors };
