/**
 * SplashScreen Component - Apple HIG Compliant
 *
 * Design Decisions:
 * - Follows Apple's "Deference" principle: minimal, content-focused
 * - Uses Large Title typography (34px) for app name
 * - Solid background (no gradients or images per HIG guidelines)
 * - Smooth fade animation (300ms, Apple-standard easing)
 * - Automatic light/dark mode support
 * - No loading indicators (per Apple launch screen guidelines)
 * - Nearly identical to first app screen for seamless transition
 * - 8pt grid spacing system
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, useColorScheme } from 'react-native';

interface SplashScreenProps {
    /** Optional callback when animation completes */
    onAnimationComplete?: () => void;
    /** Animation duration in milliseconds (default: 800ms) */
    duration?: number;
}

/**
 * SplashScreen displays the app name with a smooth fade-in animation
 * following Apple's Human Interface Guidelines for launch screens.
 */
export function SplashScreen({ onAnimationComplete, duration = 800 }: SplashScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Apple System Colors (from Figma Design Kit)
    const colors = {
        bgPrimary: isDark ? '#000000' : '#FFFFFF',
        labelPrimary: isDark ? '#FFFFFF' : '#000000',
        labelSecondary: isDark ? 'rgba(235, 235, 245, 0.7)' : 'rgba(60, 60, 67, 0.6)',
        systemBlue: isDark ? '#5CB8FF' : '#0088FF',
    };

    useEffect(() => {
        // Fade in animation with Apple-standard easing
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: duration,
            // Apple's default easing: cubic-bezier(0.25, 0.1, 0.25, 1)
            // React Native doesn't support custom bezier, so use easeInOut (closest match)
            useNativeDriver: true,
        }).start(() => {
            // Call completion callback after animation
            if (onAnimationComplete) {
                onAnimationComplete();
            }
        });
    }, [fadeAnim, duration, onAnimationComplete]);

    return (
        <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            {
                                // Subtle scale animation for depth (HIG "Depth" principle)
                                scale: fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.95, 1],
                                }),
                            },
                        ],
                    },
                ]}
            >
                {/* App Icon Placeholder */}
                <View
                    style={[styles.iconContainer, { backgroundColor: colors.systemBlue }]}
                    accessibilityLabel="AIWear app icon"
                >
                    <Text style={styles.iconText}>✨</Text>
                </View>

                {/* App Name - Large Title (34px, +0.40px letter-spacing) */}
                <Text
                    style={[styles.appName, { color: colors.labelPrimary }]}
                    accessibilityRole="header"
                >
                    AIWear
                </Text>

                {/* Tagline - Subheadline (15px, -0.23px letter-spacing) */}
                <Text
                    style={[styles.tagline, { color: colors.labelSecondary }]}
                    accessibilityRole="text"
                >
                    AI Virtual Try-On
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Container - Full screen, centered content
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Content wrapper - Contains all splash elements
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Icon Container - Rounded square with system blue background
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20, // --radius-xl (20px)
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24, // --space-6 (24px)
        // Subtle shadow for depth (HIG "Depth" principle)
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4, // Android shadow
    },

    iconText: {
        fontSize: 40,
    },

    // App Name - Large Title typography (34px, bold)
    appName: {
        fontFamily: '-apple-system',
        fontSize: 34, // --text-large-title
        lineHeight: 41,
        letterSpacing: 0.4,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8, // --space-2 (8px)
    },

    // Tagline - Subheadline typography (15px)
    tagline: {
        fontFamily: '-apple-system',
        fontSize: 15, // --text-subhead
        lineHeight: 20,
        letterSpacing: -0.23,
        fontWeight: '400',
        textAlign: 'center',
    },
});

export default SplashScreen;
