import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

// Screens
import { StudioScreen } from '../screens/main/StudioScreen';
import { WardrobeScreen } from '../screens/main/WardrobeScreen';
import { GalleryScreen } from '../screens/main/GalleryScreen';
import { AccountScreen } from '../screens/main/AccountScreen';

import type { MainTabsParamList } from '../types';
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
    activeColor,
    inactiveColor,
}: {
    focused: boolean;
    label: string;
    icon: IconName;
    onPress: () => void;
    activeColor: string;
    inactiveColor: string;
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
                size={26}
                color={focused ? activeColor : inactiveColor}
                strokeWidth={focused ? 2.5 : 1.5}
            />
            <Text style={[
                styles.tabLabel,
                { color: focused ? activeColor : inactiveColor },
                focused && styles.tabLabelActive,
            ]}>
                {label}
            </Text>
        </Pressable>
    );
}

export function MainTabs() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bottomPadding = Math.max(insets.bottom, 8);

    // Apple HIG System Colors
    const systemBlue = isDark ? '#5CB8FF' : '#0088FF';
    const labelSecondary = isDark ? 'rgba(235, 235, 245, 0.7)' : 'rgba(60, 60, 67, 0.6)';
    const separator = isDark ? 'rgba(255, 255, 255, 0.17)' : 'rgba(0, 0, 0, 0.12)';

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
                        backgroundColor: 'transparent',
                        borderTopColor: separator,
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
                                activeColor={systemBlue}
                                inactiveColor={labelSecondary}
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 8,
    },
    tabButtonsRow: {
        flexDirection: 'row',
        paddingTop: 6,
        paddingHorizontal: 4,
    },
    tabButton: {
        flex: 1,
        minHeight: 49, // iOS native tab bar height
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 2,
        paddingHorizontal: 4,
    },
    tabButtonPressed: {
        opacity: 0.6,
        transform: [{ scale: 0.95 }],
    },
    tabLabel: {
        fontFamily: '-apple-system',
        fontSize: 10,
        fontWeight: '500',
        marginTop: 1,
        letterSpacing: 0.01,
    },
    tabLabelActive: {
        fontWeight: '600',
    },
});
