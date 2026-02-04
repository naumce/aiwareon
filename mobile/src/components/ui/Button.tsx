import React, { useCallback } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol, type IconName } from './IconSymbol';
import { useTheme } from '../../theme';
import { spacing, borderRadius, typography } from '../../theme';

/**
 * iOS HIG Button Styles:
 * - filled: Solid background, prominent for primary actions
 * - tinted: Light tint background, colored text
 * - gray: Gray background, neutral
 * - plain: No background, just text/icon
 */
type ButtonStyle = 'filled' | 'tinted' | 'gray' | 'plain';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
    title?: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;

    // iOS HIG style
    buttonStyle?: ButtonStyle;
    size?: ButtonSize;

    // Icon
    icon?: IconName;
    iconPosition?: 'left' | 'right';
    iconOnly?: boolean;

    // Theming
    tintColor?: string;

    // Haptic
    haptic?: boolean;
    hapticType?: 'light' | 'medium' | 'heavy';
}

/**
 * iOS Human Interface Guidelines compliant Button component.
 * Minimum touch target: 44pt (HIG requirement)
 */
export function Button({
    title,
    onPress,
    disabled = false,
    loading = false,
    style,
    textStyle,
    buttonStyle = 'filled',
    size = 'medium',
    icon,
    iconPosition = 'left',
    iconOnly = false,
    tintColor,
    haptic = true,
    hapticType = 'light',
}: ButtonProps) {
    const { colors, isDark } = useTheme();
    const isDisabled = disabled || loading;

    const handlePress = useCallback(() => {
        if (haptic) {
            const feedbackStyle = hapticType === 'heavy'
                ? Haptics.ImpactFeedbackStyle.Heavy
                : hapticType === 'medium'
                    ? Haptics.ImpactFeedbackStyle.Medium
                    : Haptics.ImpactFeedbackStyle.Light;
            Haptics.impactAsync(feedbackStyle);
        }
        onPress();
    }, [haptic, hapticType, onPress]);

    // Size dimensions (HIG: min 44pt touch target)
    const sizeStyles = {
        small: { paddingVertical: 8, paddingHorizontal: 14, minHeight: 32 },
        medium: { paddingVertical: 12, paddingHorizontal: 20, minHeight: 44 },
        large: { paddingVertical: 16, paddingHorizontal: 28, minHeight: 50 },
    };

    const iconSizes = { small: 16, medium: 18, large: 22 };
    const fontSizes = { small: 15, medium: 17, large: 19 };

    // Colors based on button style and theme
    const primaryColor = tintColor || colors.brand.primary;

    const getButtonColors = () => {
        switch (buttonStyle) {
            case 'filled':
                return {
                    background: primaryColor,
                    text: '#FFFFFF',
                    icon: '#FFFFFF',
                };
            case 'tinted':
                return {
                    background: isDark
                        ? `${primaryColor}20`
                        : `${primaryColor}15`,
                    text: primaryColor,
                    icon: primaryColor,
                };
            case 'gray':
                return {
                    background: colors.fill.secondary,
                    text: colors.text.primary,
                    icon: colors.text.secondary,
                };
            case 'plain':
            default:
                return {
                    background: 'transparent',
                    text: primaryColor,
                    icon: primaryColor,
                };
        }
    };

    const buttonColors = getButtonColors();

    const iconElement = icon && (
        <IconSymbol
            name={icon}
            size={iconSizes[size]}
            color={isDisabled ? colors.text.disabled : buttonColors.icon}
            strokeWidth={2}
        />
    );

    const textElement = title && !iconOnly && (
        <Text
            style={[
                styles.text,
                {
                    fontSize: fontSizes[size],
                    color: isDisabled ? colors.text.disabled : buttonColors.text,
                },
                textStyle,
            ]}
        >
            {title}
        </Text>
    );

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={isDisabled}
            activeOpacity={0.7}
            style={[
                styles.button,
                sizeStyles[size],
                { backgroundColor: buttonColors.background },
                buttonStyle === 'filled' && styles.filledShadow,
                isDisabled && styles.disabled,
                iconOnly && styles.iconOnly,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={buttonColors.text}
                    size={size === 'small' ? 'small' : 'small'}
                />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' && iconElement}
                    {textElement}
                    {icon && iconPosition === 'right' && iconElement}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8, // HIG: consistent 8pt gap between icon and text
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
    filledShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    disabled: {
        opacity: 0.4,
    },
    iconOnly: {
        paddingHorizontal: 12,
    },
});
