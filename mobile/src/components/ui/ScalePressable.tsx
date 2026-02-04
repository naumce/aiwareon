import React, { useCallback, useRef } from 'react';
import { Pressable, Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ScalePressableProps {
    children: React.ReactNode;
    onPress?: () => void;
    onLongPress?: () => void;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    haptic?: boolean;
    hapticType?: 'light' | 'medium' | 'heavy' | 'selection';
    scaleValue?: number;
    activeOpacity?: number;
}

/**
 * An iOS-style pressable with scale animation and haptic feedback.
 * Uses React Native's built-in Animated API (no Reanimated required).
 */
export function ScalePressable({
    children,
    onPress,
    onLongPress,
    style,
    disabled = false,
    haptic = true,
    hapticType = 'light',
    scaleValue = 0.97,
    activeOpacity = 0.9,
}: ScalePressableProps) {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: scaleValue,
                useNativeDriver: true,
                speed: 50,
                bounciness: 2,
            }),
            Animated.timing(opacity, {
                toValue: activeOpacity,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [scale, opacity, scaleValue, activeOpacity]);

    const handlePressOut = useCallback(() => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 50,
                bounciness: 2,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [scale, opacity]);

    const handlePress = useCallback(() => {
        if (haptic) {
            switch (hapticType) {
                case 'selection':
                    Haptics.selectionAsync();
                    break;
                case 'medium':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    break;
                case 'heavy':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    break;
                default:
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        }
        onPress?.();
    }, [haptic, hapticType, onPress]);

    return (
        <Pressable
            onPress={handlePress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
        >
            <Animated.View style={[{ transform: [{ scale }], opacity }, style]}>
                {children}
            </Animated.View>
        </Pressable>
    );
}
