import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

// Screens
import { StudioScreen } from '../screens/main/StudioScreen';
import { WardrobeScreen } from '../screens/main/WardrobeScreen';
import { GalleryScreen } from '../screens/main/GalleryScreen';
import { AccountScreen } from '../screens/main/AccountScreen';

import type { MainTabsParamList } from '../types';
import { useTheme } from '../theme';
import { IconSymbol, type IconName } from '../components/ui';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const tabConfig = [
    { key: 'studio', label: 'Studio', icon: 'Sparkles' as IconName, route: 'StudioTab' },
    { key: 'wardrobe', label: 'Wardrobe', icon: 'Shirt' as IconName, route: 'WardrobeTab' },
    { key: 'gallery', label: 'Gallery', icon: 'Images' as IconName, route: 'GalleryTab' },
    { key: 'account', label: 'Account', icon: 'User' as IconName, route: 'AccountTab' },
];

function TabBarButton({
    focused,
    label,
    icon,
    onPress,
    colors,
}: {
    focused: boolean;
    label: string;
    icon: IconName;
    onPress: () => void;
    colors: ReturnType<typeof useTheme>['colors'];
}) {
    const scale = useRef(new Animated.Value(1)).current;
    const liftY = useRef(new Animated.Value(focused ? -4 : 0)).current;
    const labelOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;
    const labelSlide = useRef(new Animated.Value(focused ? 0 : 5)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(liftY, {
                toValue: focused ? -4 : 0,
                tension: 300,
                friction: 20,
                useNativeDriver: true,
            }),
            Animated.timing(labelOpacity, {
                toValue: focused ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(labelSlide, {
                toValue: focused ? 0 : 5,
                tension: 300,
                friction: 20,
                useNativeDriver: true,
            }),
        ]).start();
    }, [focused, liftY, labelOpacity, labelSlide]);

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.85,
            tension: 300,
            friction: 15,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            tension: 200,
            friction: 12,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
            }}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.tabButton}
        >
            <Animated.View style={{
                transform: [{ scale }, { translateY: liftY }],
                alignItems: 'center',
            }}>
                <IconSymbol
                    name={icon}
                    size={22}
                    color={focused ? colors.brand.secondary : colors.text.tertiary}
                    strokeWidth={focused ? 2 : 1.5}
                />
                <Animated.Text style={[
                    styles.tabLabel,
                    {
                        color: focused ? colors.brand.secondary : colors.text.tertiary,
                        opacity: labelOpacity,
                        transform: [{ translateY: labelSlide }],
                    },
                ]}>
                    {label}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
}

export function MainTabs() {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: { display: 'none' },
            }}
            tabBar={({ state, navigation }) => (
                <View style={[
                    styles.floatingBar,
                    {
                        bottom: Math.max(insets.bottom, 16),
                    }
                ]}>
                    <BlurView
                        intensity={isDark ? 50 : 70}
                        tint={isDark ? 'dark' : 'light'}
                        style={[StyleSheet.absoluteFill, styles.blurFill]}
                    />
                    {/* Solid background overlay for consistency */}
                    <View style={[
                        StyleSheet.absoluteFill,
                        styles.blurFill,
                        {
                            backgroundColor: isDark
                                ? 'rgba(26, 26, 46, 0.85)'
                                : 'rgba(255, 255, 255, 0.88)',
                        },
                    ]} />
                    <View style={styles.tabButtonsRow}>
                        {tabConfig.map((tab, index) => (
                            <TabBarButton
                                key={tab.key}
                                label={tab.label}
                                icon={tab.icon}
                                focused={state.index === index}
                                colors={colors}
                                onPress={() => navigation.navigate(tab.route)}
                            />
                        ))}
                    </View>
                </View>
            )}
        >
            <Tab.Screen name="StudioTab" component={StudioScreen} />
            <Tab.Screen name="WardrobeTab" component={WardrobeScreen} />
            <Tab.Screen name="GalleryTab" component={GalleryScreen} />
            <Tab.Screen name="AccountTab" component={AccountScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    floatingBar: {
        position: 'absolute',
        left: 20,
        right: 20,
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 12,
    },
    blurFill: {
        borderRadius: 32,
    },
    tabButtonsRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
});
