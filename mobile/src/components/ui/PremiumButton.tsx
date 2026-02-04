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
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { IconSymbol, type IconName } from './IconSymbol';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface PremiumButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'ghost';
    icon?: IconName;
    iconPosition?: 'left' | 'right';
    style?: ViewStyle;
    textStyle?: TextStyle;
    haptic?: boolean;
}

/**
 * A premium button component with gradient, icon, and haptic feedback.
 */
export function PremiumButton({
    title,
    onPress,
    disabled = false,
    loading = false,
    variant = 'primary',
    icon,
    iconPosition = 'left',
    style,
    textStyle,
    haptic = true,
}: PremiumButtonProps) {
    const handlePress = useCallback(() => {
        if (haptic) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onPress();
    }, [haptic, onPress]);

    const isDisabled = disabled || loading;

    const content = (
        <View style={styles.content}>
            {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <IconSymbol
                            name={icon}
                            size={18}
                            color={variant === 'ghost' ? colors.brand.primary : '#FFFFFF'}
                            strokeWidth={2}
                        />
                    )}
                    <Text
                        style={[
                            styles.text,
                            variant === 'secondary' && styles.textSecondary,
                            variant === 'ghost' && styles.textGhost,
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && (
                        <IconSymbol
                            name={icon}
                            size={18}
                            color={variant === 'ghost' ? colors.brand.primary : '#FFFFFF'}
                            strokeWidth={2}
                        />
                    )}
                </>
            )}
        </View>
    );

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={handlePress}
                disabled={isDisabled}
                activeOpacity={0.8}
                style={style}
            >
                <LinearGradient
                    colors={isDisabled ? ['#3A3A3C', '#3A3A3C'] : colors.gradient.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.button, styles.buttonPrimary]}
                >
                    {content}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={isDisabled}
            activeOpacity={0.7}
            style={[
                styles.button,
                variant === 'secondary' && styles.buttonSecondary,
                variant === 'ghost' && styles.buttonGhost,
                isDisabled && styles.buttonDisabled,
                style,
            ]}
        >
            {content}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPrimary: {
        // Gradient handles background
    },
    buttonSecondary: {
        backgroundColor: colors.fill.secondary,
    },
    buttonGhost: {
        backgroundColor: 'transparent',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    text: {
        fontSize: typography.body,
        fontWeight: typography.semibold,
        color: '#FFFFFF',
    },
    textSecondary: {
        color: colors.text.primary,
    },
    textGhost: {
        color: colors.brand.primary,
    },
});
