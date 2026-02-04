import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';

// Auth screens
import { LandingScreen } from '../screens/auth/LandingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

// Main app
import { MainTabs } from './MainTabs';
import { BuyCreditsScreen } from '../screens/main/BuyCreditsScreen';

import type { RootStackParamList } from '../types';
import { useTheme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
    const { user, isLoading } = useAuthStore();
    const { colors, isDark } = useTheme();

    // Custom theme based on current mode
    const theme = {
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            primary: colors.brand.primary,
            background: colors.background.primary,
            card: colors.background.secondary,
            text: colors.text.primary,
            border: colors.border.subtle,
            notification: colors.brand.accent,
        },
    };

    // Show loading screen while initializing auth
    if (isLoading) {
        return null; // Replace with splash screen component
    }

    return (
        <NavigationContainer theme={theme}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background.primary },
                    animation: 'slide_from_right',
                }}
            >
                {user ? (
                    // Authenticated: show main app
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen
                            name="BuyCredits"
                            component={BuyCreditsScreen}
                            options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                            }}
                        />
                    </>
                ) : (
                    // Not authenticated: show auth flow
                    <>
                        <Stack.Screen name="Landing" component={LandingScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

