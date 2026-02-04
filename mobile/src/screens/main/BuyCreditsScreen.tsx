import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useTheme, spacing, borderRadius, typography } from '../../theme';
import { IconSymbol, Button } from '../../components/ui';
import { iapService, CREDIT_PACKS, type CreditPack } from '../../services/iapService';
import { useCreditStore } from '../../stores';

export function BuyCreditsScreen() {
    const navigation = useNavigation();
    const { colors, isDark } = useTheme();
    const { balance, fetchBalance } = useCreditStore();
    const styles = createStyles(colors, isDark);

    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [products, setProducts] = useState(CREDIT_PACKS);

    useEffect(() => {
        initializeIAP();
        return () => {
            // Clean up IAP connection when leaving
        };
    }, []);

    const initializeIAP = async () => {
        setLoading(true);
        try {
            await iapService.initialize();
            const fetchedProducts = await iapService.fetchProducts();

            // Update prices from App Store if available
            if (fetchedProducts.length > 0) {
                setProducts(CREDIT_PACKS.map(pack => {
                    const realPrice = iapService.getProductPrice(pack.id);
                    return realPrice ? { ...pack, price: realPrice } : pack;
                }));
            }
        } catch (error) {
            console.error('Failed to initialize IAP:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = useCallback(async (pack: CreditPack) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setPurchasing(pack.id);

        try {
            const result = await iapService.purchase(pack.id);

            if (result.success) {
                await fetchBalance();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                    '🎉 Purchase Complete!',
                    `You received ${pack.credits} credits`,
                    [{ text: 'Awesome!', onPress: () => navigation.goBack() }]
                );
            } else if (result.error && result.error !== 'Purchase cancelled') {
                Alert.alert('Purchase Failed', result.error);
            }
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Something went wrong');
        } finally {
            setPurchasing(null);
        }
    }, [fetchBalance, navigation]);

    const handleRestore = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert(
            'Restore Purchases',
            'Credit packs are consumable and cannot be restored. Each purchase adds credits immediately to your account.',
            [{ text: 'OK' }]
        );
    };

    const renderCreditPack = (pack: CreditPack, index: number) => {
        const isPurchasing = purchasing === pack.id;
        const isPopular = pack.badge === 'Popular';
        const isBestValue = pack.badge === 'Best Value';

        return (
            <TouchableOpacity
                key={pack.id}
                style={[
                    styles.packCard,
                    isPopular && styles.packCardPopular,
                    isBestValue && styles.packCardBestValue,
                ]}
                onPress={() => handlePurchase(pack)}
                disabled={purchasing !== null}
                activeOpacity={0.8}
            >
                {pack.badge && (
                    <View style={[
                        styles.badge,
                        isPopular && styles.badgePopular,
                        isBestValue && styles.badgeBestValue,
                    ]}>
                        <Text style={styles.badgeText}>{pack.badge}</Text>
                    </View>
                )}

                <View style={styles.packContent}>
                    <View style={styles.packLeft}>
                        <View style={styles.creditsRow}>
                            <IconSymbol
                                name="Sparkles"
                                size={20}
                                color={colors.brand.primary}
                            />
                            <Text style={styles.creditsAmount}>{pack.credits}</Text>
                        </View>
                        <Text style={styles.packName}>{pack.name}</Text>
                    </View>

                    <View style={styles.packRight}>
                        {isPurchasing ? (
                            <ActivityIndicator color={colors.brand.primary} />
                        ) : (
                            <View style={styles.priceButton}>
                                <Text style={styles.priceText}>{pack.price}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Per-credit value */}
                <Text style={styles.perCredit}>
                    {(pack.priceNumber / pack.credits).toFixed(2)}/credit
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <IconSymbol
                            name="ChevronLeft"
                            size={28}
                            color={colors.brand.primary}
                        />
                    </TouchableOpacity>
                    <Text style={styles.title}>Buy Credits</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Current Balance */}
                    <View style={styles.balanceCard}>
                        <LinearGradient
                            colors={isDark
                                ? ['rgba(138, 43, 226, 0.2)', 'rgba(75, 0, 130, 0.2)']
                                : ['rgba(138, 43, 226, 0.1)', 'rgba(75, 0, 130, 0.1)']}
                            style={styles.balanceGradient}
                        >
                            <View style={styles.balanceContent}>
                                <Text style={styles.balanceLabel}>Current Balance</Text>
                                <View style={styles.balanceRow}>
                                    <IconSymbol
                                        name="Sparkles"
                                        size={28}
                                        color={colors.brand.primary}
                                    />
                                    <Text style={styles.balanceValue}>{balance}</Text>
                                    <Text style={styles.balanceUnit}>credits</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Info */}
                    <Text style={styles.infoText}>
                        Credits are used for virtual try-on generations.
                        Standard quality uses 1 credit, Studio uses 2.
                    </Text>

                    {/* Credit Packs */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.brand.primary} />
                            <Text style={styles.loadingText}>Loading prices...</Text>
                        </View>
                    ) : (
                        <View style={styles.packsContainer}>
                            {products.map((pack, index) => renderCreditPack(pack, index))}
                        </View>
                    )}

                    {/* Restore Link */}
                    <TouchableOpacity
                        style={styles.restoreButton}
                        onPress={handleRestore}
                    >
                        <Text style={styles.restoreText}>Restore Purchases</Text>
                    </TouchableOpacity>

                    {/* Legal */}
                    <Text style={styles.legalText}>
                        Payment will be charged to your Apple ID account.
                        Credits are non-refundable and do not expire.
                    </Text>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.primary,
    },
    headerSpacer: {
        width: 44,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
    },
    balanceCard: {
        marginBottom: spacing.lg,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    balanceGradient: {
        padding: spacing.lg,
    },
    balanceContent: {
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: typography.subhead,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    balanceValue: {
        fontSize: 48,
        fontWeight: '700',
        color: colors.text.primary,
    },
    balanceUnit: {
        fontSize: typography.title3,
        color: colors.text.secondary,
        marginTop: 8,
    },
    infoText: {
        fontSize: typography.subhead,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 20,
    },
    loadingContainer: {
        paddingVertical: spacing.xxl,
        alignItems: 'center',
        gap: spacing.md,
    },
    loadingText: {
        fontSize: typography.subhead,
        color: colors.text.tertiary,
    },
    packsContainer: {
        gap: spacing.md,
    },
    packCard: {
        backgroundColor: colors.background.tertiary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.separator.opaque,
    },
    packCardPopular: {
        borderColor: colors.brand.primary,
        borderWidth: 2,
    },
    packCardBestValue: {
        borderColor: '#34C759',
        borderWidth: 2,
    },
    badge: {
        position: 'absolute',
        top: -10,
        right: spacing.lg,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.brand.primary,
    },
    badgePopular: {
        backgroundColor: colors.brand.primary,
    },
    badgeBestValue: {
        backgroundColor: '#34C759',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    packContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    packLeft: {
        flex: 1,
    },
    creditsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    creditsAmount: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.text.primary,
    },
    packName: {
        fontSize: typography.subhead,
        color: colors.text.secondary,
        marginTop: 2,
    },
    packRight: {
        minWidth: 80,
        alignItems: 'flex-end',
    },
    priceButton: {
        backgroundColor: colors.brand.primary,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.sm,
    },
    priceText: {
        fontSize: typography.body,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    perCredit: {
        fontSize: typography.caption1,
        color: colors.text.tertiary,
        marginTop: spacing.xs,
    },
    restoreButton: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
    restoreText: {
        fontSize: typography.subhead,
        color: colors.brand.primary,
    },
    legalText: {
        fontSize: typography.caption1,
        color: colors.text.tertiary,
        textAlign: 'center',
        lineHeight: 16,
    },
});
