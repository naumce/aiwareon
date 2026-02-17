import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useTheme, spacing, borderRadius, typography } from '../../theme';
import { IconSymbol } from '../../components/ui';
import { iapService, CREDIT_PACKS, type CreditPack } from '../../services/iapService';
import { useCreditStore } from '../../stores';

/** Animated credit pack card */
function PackCard({
    pack,
    index,
    onPurchase,
    isPurchasing,
    disabled,
    colors,
    isDark,
}: {
    pack: CreditPack;
    index: number;
    onPurchase: (pack: CreditPack) => void;
    isPurchasing: boolean;
    disabled: boolean;
    colors: ReturnType<typeof useTheme>['colors'];
    isDark: boolean;
}) {
    const slideAnim = useRef(new Animated.Value(40)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isPopular = pack.badge === 'Popular';
    const isBestValue = pack.badge === 'Best Value';
    const isHighlighted = isPopular || isBestValue;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 350,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 80,
                friction: 12,
                delay: index * 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, [index, opacityAnim, slideAnim]);

    const perCredit = (pack.priceNumber / pack.credits).toFixed(2);

    const cardContent = (
        <View style={{
            padding: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
        }}>
            {/* Left — credits + name */}
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                    <Text style={{
                        fontSize: 32,
                        fontWeight: '700',
                        color: isHighlighted ? '#FFFFFF' : colors.text.primary,
                    }}>
                        {pack.credits}
                    </Text>
                    <Text style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: isHighlighted ? 'rgba(255,255,255,0.7)' : colors.text.tertiary,
                    }}>
                        credits
                    </Text>
                </View>
                <Text style={{
                    fontSize: 13,
                    color: isHighlighted ? 'rgba(255,255,255,0.6)' : colors.text.tertiary,
                    marginTop: 2,
                }}>
                    ${perCredit}/credit
                </Text>
            </View>

            {/* Right — price button */}
            <View>
                {isPurchasing ? (
                    <ActivityIndicator color={isHighlighted ? '#FFFFFF' : colors.brand.primary} />
                ) : (
                    <View style={{
                        backgroundColor: isHighlighted
                            ? 'rgba(255,255,255,0.2)'
                            : (isDark ? 'rgba(201,160,255,0.12)' : 'rgba(201,160,255,0.1)'),
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: isHighlighted
                            ? 'rgba(255,255,255,0.3)'
                            : (isDark ? 'rgba(201,160,255,0.25)' : 'rgba(201,160,255,0.2)'),
                    }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: isHighlighted ? '#FFFFFF' : colors.brand.primary,
                        }}>
                            {pack.price}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    const badgeView = pack.badge ? (
        <View style={{
            position: 'absolute',
            top: -1,
            right: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            backgroundColor: isPopular ? colors.brand.primary : '#34C759',
        }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {pack.badge}
            </Text>
        </View>
    ) : null;

    return (
        <Animated.View style={{
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onPurchase(pack)}
                disabled={disabled}
                onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, tension: 300, friction: 15, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 12, useNativeDriver: true }).start()}
            >
                {isHighlighted ? (
                    <LinearGradient
                        colors={isPopular
                            ? colors.gradient.primary as [string, string]
                            : ['#34C759', '#30D158']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 20, overflow: 'hidden' }}
                    >
                        {badgeView}
                        {cardContent}
                    </LinearGradient>
                ) : (
                    <View style={{
                        borderRadius: 20,
                        overflow: 'hidden',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    }}>
                        {badgeView}
                        {cardContent}
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

export function BuyCreditsScreen() {
    const navigation = useNavigation();
    const { colors, isDark } = useTheme();
    const { balance, fetchBalance } = useCreditStore();

    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [products, setProducts] = useState(CREDIT_PACKS);

    // Balance entrance animation
    const balancePulse = useRef(new Animated.Value(0)).current;
    const balanceScale = useRef(new Animated.Value(0.8)).current;
    const balanceOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        initializeIAP();
    }, []);

    useEffect(() => {
        // Animate balance number in
        Animated.parallel([
            Animated.spring(balanceScale, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
            Animated.timing(balanceOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();

        // Subtle pulse loop on the glow
        Animated.loop(
            Animated.sequence([
                Animated.timing(balancePulse, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(balancePulse, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ]),
        ).start();
    }, [balanceScale, balanceOpacity, balancePulse]);

    const initializeIAP = async () => {
        setLoading(true);
        try {
            await iapService.initialize();
            const fetchedProducts = await iapService.fetchProducts();
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
                    'Purchase Complete!',
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

    const glowOpacity = balancePulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing.md,
                    paddingTop: spacing.sm,
                    paddingBottom: spacing.md,
                }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <IconSymbol name="ChevronLeft" size={28} color={colors.brand.primary} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text.primary }}>
                            Credits
                        </Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Balance Hero */}
                    <View style={{ marginBottom: spacing.xl, borderRadius: 24, overflow: 'hidden' }}>
                        <LinearGradient
                            colors={colors.gradient.primary as [string, string]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ padding: spacing.xl, alignItems: 'center' }}
                        >
                            {/* Pulsing glow behind balance */}
                            <Animated.View style={{
                                position: 'absolute',
                                width: 120,
                                height: 120,
                                borderRadius: 60,
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                top: '50%',
                                marginTop: -60,
                                opacity: glowOpacity,
                            }} />

                            <Text style={{
                                fontSize: 13,
                                fontWeight: '600',
                                color: 'rgba(255,255,255,0.7)',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                marginBottom: 8,
                            }}>
                                Your Balance
                            </Text>

                            <Animated.View style={{
                                flexDirection: 'row',
                                alignItems: 'baseline',
                                gap: 8,
                                opacity: balanceOpacity,
                                transform: [{ scale: balanceScale }],
                            }}>
                                <Text style={{
                                    fontSize: 56,
                                    fontWeight: '700',
                                    color: '#FFFFFF',
                                    letterSpacing: -2,
                                }}>
                                    {balance}
                                </Text>
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: '500',
                                    color: 'rgba(255,255,255,0.7)',
                                    marginBottom: 6,
                                }}>
                                    credits
                                </Text>
                            </Animated.View>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 16,
                                marginTop: 12,
                                opacity: 0.6,
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <IconSymbol name="Zap" size={12} color="#FFFFFF" strokeWidth={2} />
                                    <Text style={{ fontSize: 12, color: '#FFFFFF' }}>Standard: 1</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <IconSymbol name="Sparkles" size={12} color="#FFFFFF" strokeWidth={2} />
                                    <Text style={{ fontSize: 12, color: '#FFFFFF' }}>Studio: 2</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Packs */}
                    {loading ? (
                        <View style={{ paddingVertical: spacing.xxl, alignItems: 'center', gap: spacing.md }}>
                            <ActivityIndicator size="large" color={colors.brand.primary} />
                            <Text style={{ fontSize: 14, color: colors.text.tertiary }}>Loading prices...</Text>
                        </View>
                    ) : (
                        <View style={{ gap: 14 }}>
                            {products.map((pack, index) => (
                                <PackCard
                                    key={pack.id}
                                    pack={pack}
                                    index={index}
                                    onPurchase={handlePurchase}
                                    isPurchasing={purchasing === pack.id}
                                    disabled={purchasing !== null}
                                    colors={colors}
                                    isDark={isDark}
                                />
                            ))}
                        </View>
                    )}

                    {/* Restore */}
                    <TouchableOpacity
                        style={{ paddingVertical: spacing.lg, alignItems: 'center' }}
                        onPress={handleRestore}
                    >
                        <Text style={{ fontSize: 14, color: colors.brand.primary }}>
                            Restore Purchases
                        </Text>
                    </TouchableOpacity>

                    {/* Legal */}
                    <Text style={{
                        fontSize: 11,
                        color: colors.text.tertiary,
                        textAlign: 'center',
                        lineHeight: 16,
                    }}>
                        Payment will be charged to your Apple ID account.{'\n'}
                        Credits are non-refundable and do not expire.
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
