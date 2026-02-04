import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol, type IconName } from './IconSymbol';
import { colors, spacing, typography } from '../../theme';

interface PremiumHeaderProps {
    title: string;
    subtitle?: string;
    rightIcon?: IconName;
    rightLabel?: string;
    onRightPress?: () => void;
    style?: ViewStyle;
    blur?: boolean;
}

/**
 * A premium header component with optional blur background and icon.
 */
export function PremiumHeader({
    title,
    subtitle,
    rightIcon,
    rightLabel,
    onRightPress,
    style,
    blur = false,
}: PremiumHeaderProps) {
    const insets = useSafeAreaInsets();

    const headerContent = (
        <View style={[styles.container, { paddingTop: insets.top + spacing.md }, style]}>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            {(rightIcon || rightLabel) && (
                <View style={styles.rightContainer}>
                    {rightIcon && (
                        <IconSymbol name={rightIcon} size={20} color={colors.brand.primary} />
                    )}
                    {rightLabel && <Text style={styles.rightLabel}>{rightLabel}</Text>}
                </View>
            )}
        </View>
    );

    if (blur) {
        return (
            <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                <View style={styles.blurOverlay} />
                {headerContent}
            </BlurView>
        );
    }

    return headerContent;
}

const styles = StyleSheet.create({
    blurContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    blurOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: typography.largeTitle,
        fontWeight: typography.bold,
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: typography.subhead,
        color: colors.text.secondary,
        marginTop: 2,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.fill.secondary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        gap: 4,
    },
    rightLabel: {
        fontSize: typography.subhead,
        fontWeight: typography.semibold,
        color: colors.brand.primary,
    },
});
