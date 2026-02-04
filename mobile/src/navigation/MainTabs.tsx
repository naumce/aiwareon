import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

// Screens
import { StudioScreen } from '../screens/main/StudioScreen';
import { WardrobeScreen } from '../screens/main/WardrobeScreen';
import { GalleryScreen } from '../screens/main/GalleryScreen';
import { AccountScreen } from '../screens/main/AccountScreen';

import type { MainTabsParamList } from '../types';
import { useTheme, spacing } from '../theme';
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
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.tabButton,
                pressed && styles.tabButtonPressed,
            ]}
        >
            <IconSymbol
                name={icon}
                size={24}
                color={focused ? colors.brand.primary : colors.text.tertiary}
                strokeWidth={focused ? 2 : 1.5}
            />
            <Text style={[
                styles.tabLabel,
                { color: focused ? colors.brand.primary : colors.text.tertiary },
                focused && styles.tabLabelActive,
            ]}>
                {label}
            </Text>
        </Pressable>
    );
}

export function MainTabs() {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const bottomPadding = Math.max(insets.bottom, 8);

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: { display: 'none' },
            }}
            tabBar={({ state, navigation }) => (
                <View style={[
                    styles.customTabBar,
                    {
                        paddingBottom: bottomPadding,
                        backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    }
                ]}>
                    <BlurView
                        intensity={isDark ? 60 : 80}
                        tint={isDark ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />
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
    customTabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(128, 128, 128, 0.3)',
    },
    tabButtonsRow: {
        flexDirection: 'row',
        paddingTop: 8,
    },
    tabButton: {
        flex: 1,
        minHeight: 44, // HIG: minimum touch target
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    tabButtonPressed: {
        opacity: 0.7,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 2,
    },
    tabLabelActive: {
        fontWeight: '600',
    },
});
