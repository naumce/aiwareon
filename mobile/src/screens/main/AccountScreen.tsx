import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Linking,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useAuthStore, useCreditStore } from '../../stores';
import { useTheme, spacing, borderRadius, typography } from '../../theme';
import { IconSymbol, ScalePressable, Button } from '../../components/ui';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function AccountScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { user, signOut } = useAuthStore();
    const { balance, fetchBalance } = useCreditStore();
    const { colors, isDark, mode, setMode, toggleTheme } = useTheme();

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: signOut },
            ]
        );
    };

    const handleBuyCredits = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('BuyCredits');
    };

    const getInitial = () => {
        return user?.email?.charAt(0).toUpperCase() || '?';
    };

    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <Text style={styles.title}>Account</Text>

                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <LinearGradient
                            colors={['#8E54E9', '#4776E6']}
                            style={styles.avatarGradient}
                        >
                            <View style={[styles.avatar, { backgroundColor: colors.background.primary }]}>
                                <Text style={styles.avatarText}>{getInitial()}</Text>
                            </View>
                        </LinearGradient>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileEmail}>{user?.email || 'Not signed in'}</Text>
                        </View>
                    </View>

                    {/* Credits Card */}
                    <View style={styles.creditsCard}>
                        <View style={styles.creditsHeader}>
                            <Text style={styles.creditsLabel}>Available Credits</Text>
                            <Text style={styles.creditsValue}>{balance}</Text>
                        </View>
                        <View style={styles.creditsCosts}>
                            <Text style={styles.costText}>Standard: 1 credit</Text>
                            <Text style={styles.costDivider}>·</Text>
                            <Text style={styles.costText}>Studio: 2 credits</Text>
                        </View>
                        <Button
                            title="Buy Credits"
                            onPress={handleBuyCredits}
                            buttonStyle="filled"
                            size="medium"
                        />
                    </View>

                    {/* Appearance Section */}
                    <View style={styles.listSection}>
                        <Text style={styles.listHeader}>APPEARANCE</Text>
                        <View style={styles.list}>
                            <View style={styles.listItem}>
                                <View style={styles.listItemLeft}>
                                    <IconSymbol name="Moon" size={20} color={colors.text.secondary} />
                                    <Text style={styles.listItemText}>Dark Mode</Text>
                                </View>
                                <Switch
                                    value={isDark}
                                    onValueChange={() => {
                                        Haptics.selectionAsync();
                                        toggleTheme();
                                    }}
                                    trackColor={{
                                        false: colors.fill.secondary,
                                        true: colors.brand.primary
                                    }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Settings List */}
                    <View style={styles.listSection}>
                        <Text style={styles.listHeader}>SUPPORT</Text>
                        <View style={styles.list}>
                            <ScalePressable
                                style={styles.listItem}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    Linking.openURL('mailto:support@aiwear.app');
                                }}
                            >
                                <Text style={styles.listItemText}>Contact Support</Text>
                                <IconSymbol name="ChevronRight" size={20} color={colors.text.tertiary} strokeWidth={2} />
                            </ScalePressable>
                            <View style={styles.listDivider} />
                            <ScalePressable
                                style={styles.listItem}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    Linking.openURL('https://aiwear.app/privacy');
                                }}
                            >
                                <Text style={styles.listItemText}>Privacy Policy</Text>
                                <IconSymbol name="ChevronRight" size={20} color={colors.text.tertiary} strokeWidth={2} />
                            </ScalePressable>
                            <View style={styles.listDivider} />
                            <ScalePressable
                                style={styles.listItem}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    Linking.openURL('https://aiwear.app/terms');
                                }}
                            >
                                <Text style={styles.listItemText}>Terms of Service</Text>
                                <IconSymbol name="ChevronRight" size={20} color={colors.text.tertiary} strokeWidth={2} />
                            </ScalePressable>
                        </View>
                    </View>

                    {/* Sign Out */}
                    <View style={styles.listSection}>
                        <View style={styles.list}>
                            <ScalePressable
                                style={styles.listItem}
                                onPress={handleSignOut}
                                hapticType="medium"
                            >
                                <View style={styles.listItemLeft}>
                                    <IconSymbol name="LogOut" size={20} color={colors.state.error} />
                                    <Text style={styles.listItemTextDestructive}>Sign Out</Text>
                                </View>
                            </ScalePressable>
                        </View>
                    </View>

                    {/* Version */}
                    <Text style={styles.version}>AIWear 1.0.0</Text>

                    {/* Bottom spacing */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -0.5,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '500',
        color: colors.text.primary,
    },
    profileInfo: {
        flex: 1,
    },
    profileEmail: {
        fontSize: typography.body,
        color: colors.text.primary,
    },
    creditsCard: {
        backgroundColor: colors.background.tertiary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
    },
    creditsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: spacing.sm,
    },
    creditsLabel: {
        fontSize: typography.subhead,
        color: colors.text.secondary,
    },
    creditsValue: {
        fontSize: typography.title1,
        fontWeight: '700',
        color: colors.brand.primary,
    },
    creditsCosts: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    costText: {
        fontSize: typography.footnote,
        color: colors.text.tertiary,
    },
    costDivider: {
        fontSize: typography.footnote,
        color: colors.text.tertiary,
        marginHorizontal: spacing.sm,
    },
    listSection: {
        marginBottom: spacing.lg,
    },
    listHeader: {
        fontSize: typography.footnote,
        fontWeight: '400',
        color: colors.text.secondary,
        marginBottom: spacing.sm,
        marginLeft: spacing.md,
    },
    list: {
        backgroundColor: colors.background.tertiary,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        minHeight: 44, // HIG minimum touch target
    },
    listItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    listItemText: {
        fontSize: typography.body,
        color: colors.text.primary,
    },
    listItemTextDestructive: {
        fontSize: typography.body,
        color: colors.state.error,
    },
    listDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.separator.opaque,
        marginLeft: spacing.md,
    },
    version: {
        fontSize: typography.footnote,
        color: colors.text.tertiary,
        textAlign: 'center',
        marginTop: spacing.md,
    },
});
