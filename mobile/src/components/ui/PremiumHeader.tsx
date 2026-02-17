import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, Animated, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { IconSymbol, type IconName } from './IconSymbol';
import { useTheme, spacing, typography } from '../../theme';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

interface PremiumHeaderProps {
    title: string;
    /** Optional greeting override (default: time-based) */
    greeting?: string;
    /** Show greeting line above title (default true) */
    showGreeting?: boolean;
    rightIcon?: IconName;
    rightLabel?: string;
    onRightPress?: () => void;
    /** Show avatar initial on the right */
    avatarInitial?: string;
    onAvatarPress?: () => void;
    style?: ViewStyle;
    blur?: boolean;
    animated?: boolean;
}

export function PremiumHeader({
    title,
    greeting,
    showGreeting = true,
    rightIcon,
    rightLabel,
    onRightPress,
    avatarInitial,
    onAvatarPress,
    style,
    blur = false,
    animated = true,
}: PremiumHeaderProps) {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const insets = useSafeAreaInsets();

    const greetingText = useMemo(() => greeting || getGreeting(), [greeting]);

    // Entrance animations
    const greetingOpacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
    const titleOpacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
    const titleSlide = useRef(new Animated.Value(animated ? 16 : 0)).current;
    const rightOpacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
    const rightScale = useRef(new Animated.Value(animated ? 0.85 : 1)).current;

    useEffect(() => {
        if (!animated) return;

        // Staggered entrance
        Animated.stagger(120, [
            // Greeting fades in
            Animated.timing(greetingOpacity, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            }),
            // Title slides up + fades in
            Animated.parallel([
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.spring(titleSlide, {
                    toValue: 0,
                    tension: 100,
                    friction: 14,
                    useNativeDriver: true,
                }),
            ]),
            // Right side scales in
            Animated.parallel([
                Animated.timing(rightOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.spring(rightScale, {
                    toValue: 1,
                    tension: 200,
                    friction: 15,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [animated, greetingOpacity, titleOpacity, titleSlide, rightOpacity, rightScale]);

    const hasRight = rightIcon || rightLabel || avatarInitial;

    const headerContent = (
        <View style={[styles.container, blur && { paddingTop: insets.top + spacing.md }, style]}>
            <View style={styles.textContainer}>
                {showGreeting && (
                    <Animated.Text style={[styles.greeting, { opacity: greetingOpacity }]}>
                        {greetingText}
                    </Animated.Text>
                )}
                <Animated.Text style={[
                    styles.title,
                    {
                        opacity: titleOpacity,
                        transform: [{ translateY: titleSlide }],
                    },
                ]}>
                    {title}
                </Animated.Text>
            </View>
            {hasRight && (
                <Animated.View style={[styles.rightSection, {
                    opacity: rightOpacity,
                    transform: [{ scale: rightScale }],
                }]}>
                    {(rightIcon || rightLabel) && (
                        <TouchableOpacity
                            onPress={() => {
                                if (onRightPress) {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    onRightPress();
                                }
                            }}
                            activeOpacity={onRightPress ? 0.7 : 1}
                            disabled={!onRightPress}
                            style={styles.badge}
                        >
                            {rightIcon && (
                                <IconSymbol name={rightIcon} size={16} color={colors.brand.primary} />
                            )}
                            {rightLabel && <Text style={styles.badgeLabel}>{rightLabel}</Text>}
                        </TouchableOpacity>
                    )}
                    {avatarInitial && (
                        <TouchableOpacity
                            onPress={() => {
                                if (onAvatarPress) {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    onAvatarPress();
                                }
                            }}
                            activeOpacity={0.7}
                            disabled={!onAvatarPress}
                        >
                            <LinearGradient
                                colors={colors.gradient.primary as [string, string]}
                                style={styles.avatarGradient}
                            >
                                <View style={[styles.avatarInner, { backgroundColor: colors.background.primary }]}>
                                    <Text style={styles.avatarText}>{avatarInitial}</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            )}
        </View>
    );

    if (blur) {
        return (
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
                <View style={styles.blurOverlay} />
                {headerContent}
            </BlurView>
        );
    }

    return headerContent;
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) => StyleSheet.create({
    blurContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    blurOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(247, 245, 242, 0.7)',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    textContainer: {
        flex: 1,
    },
    greeting: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text.tertiary,
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.fill.secondary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 4,
    },
    badgeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.brand.primary,
    },
    avatarGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        padding: 2,
    },
    avatarInner: {
        flex: 1,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
    },
});
