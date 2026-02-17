import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Linking,
    Switch,
    Animated,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useAuthStore, useCreditStore } from '../../stores';
import { useTheme, spacing, borderRadius, typography } from '../../theme';
import { IconSymbol, ScalePressable, PremiumHeader } from '../../components/ui';
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
                    <PremiumHeader
                        title="Settings"
                        showGreeting={false}
                        style={{ paddingBottom: spacing.xl, paddingHorizontal: 0 }}
                    />

                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <LinearGradient
                            colors={colors.gradient.primary}
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
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleBuyCredits}
                        style={{ marginBottom: spacing.xl }}
                    >
                        <View style={{ borderRadius: 20, overflow: 'hidden' }}>
                            <LinearGradient
                                colors={colors.gradient.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    paddingVertical: spacing.lg,
                                    paddingHorizontal: spacing.lg,
                                }}
                            >
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                    <View>
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: '600',
                                            color: 'rgba(255,255,255,0.6)',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.8,
                                        }}>
                                            Credits
                                        </Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                                            <Text style={{
                                                fontSize: 36,
                                                fontWeight: '700',
                                                color: '#FFFFFF',
                                                letterSpacing: -1,
                                            }}>
                                                {balance}
                                            </Text>
                                            <Text style={{
                                                fontSize: 14,
                                                fontWeight: '500',
                                                color: 'rgba(255,255,255,0.6)',
                                            }}>
                                                available
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        paddingVertical: 10,
                                        paddingHorizontal: 18,
                                        borderRadius: 14,
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.3)',
                                    }}>
                                        <Text style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            color: '#FFFFFF',
                                        }}>
                                            Buy More
                                        </Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>
                    </TouchableOpacity>

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
