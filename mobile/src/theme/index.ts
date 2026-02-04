// Apple-inspired design system
// Following iOS Human Interface Guidelines

// Theme context for light/dark mode
export { ThemeProvider, useTheme, lightColors, darkColors } from './ThemeContext';
export type { ThemeMode, ThemeColors } from './ThemeContext';

// For backward compatibility - static dark colors
export { colors } from './ThemeContext';

// iOS-style spacing (4pt grid)
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 44,
} as const;

// iOS corner radii
export const borderRadius = {
    xs: 6,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 9999,
} as const;

// iOS Typography (SF Pro inspired)
export const typography = {
    // iOS text styles sizes
    largeTitle: 34,
    title1: 28,
    title2: 22,
    title3: 20,
    headline: 17,
    body: 17,
    callout: 16,
    subhead: 15,
    footnote: 13,
    caption1: 12,
    caption2: 11,

    // Legacy compatibility
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 22,
    xxl: 28,
    xxxl: 34,

    // Font weights
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,

    // Legacy
    light: '300' as const,
    normal: '400' as const,
} as const;

// iOS shadow styles
export const shadows = {
    none: {},
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 6,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
        elevation: 16,
    },
} as const;

// Animation durations (iOS timing)
export const animation = {
    fast: 200,
    normal: 300,
    slow: 450,
    spring: {
        damping: 15,
        stiffness: 150,
    },
} as const;
