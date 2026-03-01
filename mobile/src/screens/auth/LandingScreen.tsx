import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    PanResponder,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { useTheme, spacing, borderRadius, typography } from '../../theme';
import { ScalePressable, IconSymbol } from '../../components/ui';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_W = SCREEN_W - spacing.lg * 2;
const CARD_H = CARD_W * (4 / 3);

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Compressed landing assets
const instagramImg = require('../../../assets/landing/hero-instagram.jpg');
const resultBoho = require('../../../assets/landing/hero-result-2.jpg');
const resultNavy = require('../../../assets/landing/hero-result-1.jpg');
const garmentImg = require('../../../assets/landing/hero-garment.jpg');
const sliderBefore = require('../../../assets/landing/showcase-3.jpg');
const sliderAfter = require('../../../assets/landing/showcase-4.jpg');
const model3a = require('../../../assets/landing/showcase-model3-a.jpg');
const model3b = require('../../../assets/landing/showcase-model3-b.jpg');

// ─── Horizontal Slider ─────────────────────────────────────────────
function ComparisonSlider({
    beforeSource,
    afterSource,
    colors,
}: {
    beforeSource: any;
    afterSource: any;
    colors: ReturnType<typeof useTheme>['colors'];
}) {
    const [clipX, setClipX] = useState(CARD_W * 0.5);
    const offsetX = useRef(CARD_W * 0.5);
    const handleScale = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2,
            onPanResponderGrant: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Animated.spring(handleScale, {
                    toValue: 1.15,
                    tension: 300,
                    friction: 10,
                    useNativeDriver: true,
                }).start();
            },
            onPanResponderMove: (_, g) => {
                const clamped = Math.max(12, Math.min(CARD_W - 12, offsetX.current + g.dx));
                setClipX(clamped);
            },
            onPanResponderRelease: (_, g) => {
                offsetX.current = Math.max(12, Math.min(CARD_W - 12, offsetX.current + g.dx));
                Animated.spring(handleScale, {
                    toValue: 1,
                    tension: 200,
                    friction: 12,
                    useNativeDriver: true,
                }).start();
            },
        })
    ).current;

    return (
        <View style={sliderStyles.container} {...panResponder.panHandlers}>
            {/* After image (full, behind) */}
            <Image source={afterSource} style={sliderStyles.fullImage} contentFit="cover" />

            {/* Before image (clipped by width) */}
            <View style={[sliderStyles.beforeClip, { width: clipX }]}>
                <Image source={beforeSource} style={sliderStyles.absoluteImage} contentFit="cover" />
            </View>

            {/* Divider line */}
            <View style={[sliderStyles.dividerLine, { left: clipX - 22 }]}>
                <View style={sliderStyles.line} />
            </View>

            {/* Handle knob */}
            <Animated.View style={[
                sliderStyles.handleWrap,
                {
                    left: clipX - 22,
                    transform: [{ scale: handleScale }],
                },
            ]}>
                <View style={sliderStyles.handleKnob}>
                    <View style={sliderStyles.handleChevronLeft} />
                    <View style={sliderStyles.handleChevronRight} />
                </View>
            </Animated.View>

            {/* Labels */}
            <View style={sliderStyles.labelLeft}>
                <LinearGradient
                    colors={['#8BC6FC', '#C9A0FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={sliderStyles.labelGradient}
                >
                    <Text style={sliderStyles.labelText}>Look 1</Text>
                </LinearGradient>
            </View>
            <View style={sliderStyles.labelRight}>
                <LinearGradient
                    colors={['#C9A0FF', '#FF8FAB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={sliderStyles.labelGradient}
                >
                    <Text style={sliderStyles.labelText}>Look 2</Text>
                </LinearGradient>
            </View>
        </View>
    );
}

const sliderStyles = StyleSheet.create({
    container: {
        width: CARD_W,
        height: CARD_H,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
    },
    fullImage: {
        ...StyleSheet.absoluteFillObject,
    },
    beforeClip: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        overflow: 'hidden',
    },
    absoluteImage: {
        width: CARD_W,
        height: CARD_H,
    },
    dividerLine: {
        position: 'absolute',
        top: 0,
        width: 44,
        height: '100%',
        alignItems: 'center',
    },
    line: {
        width: 2.5,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    handleWrap: {
        position: 'absolute',
        top: '50%',
        marginTop: -22,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    handleKnob: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.92)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    handleChevronLeft: {
        width: 0,
        height: 0,
        borderTopWidth: 5,
        borderBottomWidth: 5,
        borderRightWidth: 6,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: '#C9A0FF',
    },
    handleChevronRight: {
        width: 0,
        height: 0,
        borderTopWidth: 5,
        borderBottomWidth: 5,
        borderLeftWidth: 6,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: '#FF8FAB',
    },
    labelLeft: {
        position: 'absolute',
        bottom: spacing.sm,
        left: spacing.sm,
    },
    labelRight: {
        position: 'absolute',
        bottom: spacing.sm,
        right: spacing.sm,
    },
    labelGradient: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.xs,
    },
    labelText: {
        fontSize: typography.caption2,
        fontWeight: typography.semibold,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

// ─── Dissolve Toggle ────────────────────────────────────────────────
function DissolveToggle({
    sourceA,
    sourceB,
    colors,
}: {
    sourceA: any;
    sourceB: any;
    colors: ReturnType<typeof useTheme>['colors'];
}) {
    const [showAfter, setShowAfter] = useState(false);
    const crossfade = useRef(new Animated.Value(0)).current;

    const toggle = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const next = !showAfter;
        setShowAfter(next);
        Animated.timing(crossfade, {
            toValue: next ? 1 : 0,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [showAfter, crossfade]);

    const opacityA = crossfade.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });
    const opacityB = crossfade;

    return (
        <ScalePressable onPress={toggle} hapticType="light">
            <View style={dissolveStyles.container}>
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityA }]}>
                    <Image source={sourceA} style={dissolveStyles.image} contentFit="cover" />
                </Animated.View>
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityB }]}>
                    <Image source={sourceB} style={dissolveStyles.image} contentFit="cover" />
                </Animated.View>

                {/* Tap hint */}
                <View style={dissolveStyles.tapHint}>
                    <LinearGradient
                        colors={colors.gradient.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={dissolveStyles.tapHintGradient}
                    >
                        <IconSymbol name="Sparkles" size={12} color="#FFF" strokeWidth={2} />
                        <Text style={dissolveStyles.tapHintText}>
                            {showAfter ? 'Tap for before' : 'Tap to transform'}
                        </Text>
                    </LinearGradient>
                </View>
            </View>
        </ScalePressable>
    );
}

const dissolveStyles = StyleSheet.create({
    container: {
        width: CARD_W,
        height: CARD_H,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    tapHint: {
        position: 'absolute',
        bottom: spacing.sm,
        alignSelf: 'center',
    },
    tapHintGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: borderRadius.full,
    },
    tapHintText: {
        fontSize: typography.caption1,
        fontWeight: typography.semibold,
        color: '#FFFFFF',
    },
});

// ─── Main Landing Screen ────────────────────────────────────────────
export function LandingScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const scrollY = useRef(new Animated.Value(0)).current;

    // Scroll-driven reveal for hero section
    const instagramOpacity = scrollY.interpolate({
        inputRange: [0, CARD_H * 0.4],
        outputRange: [1, 0.2],
        extrapolate: 'clamp',
    });
    const instagramScale = scrollY.interpolate({
        inputRange: [0, CARD_H * 0.4],
        outputRange: [1, 0.93],
        extrapolate: 'clamp',
    });
    const resultSlideY = scrollY.interpolate({
        inputRange: [0, CARD_H * 0.5],
        outputRange: [50, 0],
        extrapolate: 'clamp',
    });
    const resultOpacity = scrollY.interpolate({
        inputRange: [0, CARD_H * 0.25, CARD_H * 0.5],
        outputRange: [0, 0.4, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* ── SECTION 1: Scroll Reveal ── */}
                <SafeAreaView edges={['top']} style={styles.section}>
                    <Text style={styles.logo}>AIWear</Text>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.heroTitle}>See it.{'\n'}Try it.</Text>
                        <Text style={styles.heroHint}>Scroll down</Text>
                    </View>

                    {/* Instagram "Before" card */}
                    <Animated.View style={[
                        styles.cardContainer,
                        {
                            opacity: instagramOpacity,
                            transform: [{ scale: instagramScale }],
                        },
                    ]}>
                        <Image source={instagramImg} style={styles.cardImage} contentFit="cover" transition={400} />
                        <View style={styles.cardLabel}>
                            <Text style={styles.cardLabelText}>Found on Instagram</Text>
                        </View>
                    </Animated.View>
                </SafeAreaView>

                {/* Result "After" — slides up with scroll */}
                <View style={styles.section}>
                    <Animated.View style={[
                        styles.cardContainer,
                        {
                            opacity: resultOpacity,
                            transform: [{ translateY: resultSlideY }],
                        },
                    ]}>
                        <Image source={resultBoho} style={styles.cardImage} contentFit="cover" transition={400} />
                        <View style={styles.cardLabelAfter}>
                            <LinearGradient
                                colors={colors.gradient.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.cardLabelGradient}
                            >
                                <IconSymbol name="Sparkles" size={11} color="#FFF" strokeWidth={2} />
                                <Text style={styles.cardLabelTextWhite}>AI Try-On</Text>
                            </LinearGradient>
                        </View>
                    </Animated.View>
                    <Text style={styles.revealTitle}>Now you're wearing it</Text>
                    <Text style={styles.revealDesc}>
                        Found a dress on social media? Upload your photo and try it on instantly.
                    </Text>
                </View>

                {/* ── SECTION 2: Horizontal Slider ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Compare side by side</Text>
                        <Text style={styles.sectionDesc}>Drag the slider to reveal</Text>
                    </View>
                    <ComparisonSlider
                        beforeSource={sliderBefore}
                        afterSource={sliderAfter}
                        colors={colors}
                    />
                </View>

                {/* ── SECTION 3: Dissolve ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Magic dissolve</Text>
                        <Text style={styles.sectionDesc}>Tap to transform</Text>
                    </View>
                    <DissolveToggle
                        sourceA={model3a}
                        sourceB={model3b}
                        colors={colors}
                    />
                </View>

                {/* ── Features ── */}
                <View style={styles.section}>
                    <View style={styles.featureRow}>
                        <View style={styles.featureIcon}>
                            <IconSymbol name="Zap" size={18} color={colors.brand.primary} strokeWidth={2} />
                        </View>
                        <View style={styles.featureText}>
                            <Text style={styles.featureTitle}>Results in seconds</Text>
                            <Text style={styles.featureDesc}>AI generates photorealistic output in under 30s</Text>
                        </View>
                    </View>
                    <View style={styles.featureRow}>
                        <View style={styles.featureIcon}>
                            <IconSymbol name="Shield" size={18} color={colors.brand.primary} strokeWidth={2} />
                        </View>
                        <View style={styles.featureText}>
                            <Text style={styles.featureTitle}>Your photos stay yours</Text>
                            <Text style={styles.featureDesc}>Processed securely, never stored</Text>
                        </View>
                    </View>
                    <View style={styles.featureRow}>
                        <View style={styles.featureIcon}>
                            <IconSymbol name="CreditCard" size={18} color={colors.brand.primary} strokeWidth={2} />
                        </View>
                        <View style={styles.featureText}>
                            <Text style={styles.featureTitle}>Pay as you go</Text>
                            <Text style={styles.featureDesc}>No subscription — buy credits when you need them</Text>
                        </View>
                    </View>
                </View>

                {/* ── CTA ── */}
                <SafeAreaView edges={['bottom']} style={styles.ctaSection}>
                    <ScalePressable
                        onPress={() => navigation.navigate('Login')}
                        hapticType="medium"
                        scaleValue={0.93}
                        style={styles.ctaPressable}
                    >
                        <LinearGradient
                            colors={colors.gradient.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaButton}
                        >
                            <Text style={styles.ctaText}>Get Started</Text>
                            <IconSymbol name="ChevronRight" size={18} color="#FFF" strokeWidth={2.5} />
                        </LinearGradient>
                    </ScalePressable>
                    <Text style={styles.ctaNote}>No subscription · Pay as you go</Text>
                </SafeAreaView>
            </Animated.ScrollView>
        </View>
    );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },

    // Sections
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xxl,
    },

    // Logo
    logo: {
        fontSize: typography.headline,
        fontWeight: typography.semibold,
        color: colors.text.primary,
        letterSpacing: 1,
        marginTop: spacing.md,
    },

    // Hero
    sectionHeader: {
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
    },
    heroTitle: {
        fontSize: 48,
        fontWeight: typography.bold,
        color: colors.text.primary,
        letterSpacing: -1.5,
        lineHeight: 52,
    },
    heroHint: {
        fontSize: typography.footnote,
        color: colors.text.tertiary,
        marginTop: spacing.sm,
    },

    // Cards
    cardContainer: {
        width: CARD_W,
        height: CARD_H,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardLabel: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xs + 1,
        borderRadius: borderRadius.xs,
    },
    cardLabelText: {
        fontSize: typography.caption1,
        fontWeight: typography.medium,
        color: '#FFFFFF',
    },
    cardLabelAfter: {
        position: 'absolute',
        bottom: spacing.md,
        right: spacing.md,
    },
    cardLabelGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xs + 2,
        borderRadius: borderRadius.xs,
    },
    cardLabelTextWhite: {
        fontSize: typography.caption1,
        fontWeight: typography.semibold,
        color: '#FFFFFF',
    },

    // Reveal text
    revealTitle: {
        fontSize: typography.title2,
        fontWeight: typography.bold,
        color: colors.text.primary,
        letterSpacing: -0.3,
        marginTop: spacing.lg,
    },
    revealDesc: {
        fontSize: typography.subhead,
        color: colors.text.secondary,
        marginTop: spacing.xs,
        lineHeight: 22,
    },

    // Section titles
    sectionTitle: {
        fontSize: typography.title3,
        fontWeight: typography.bold,
        color: colors.text.primary,
        letterSpacing: -0.3,
    },
    sectionDesc: {
        fontSize: typography.subhead,
        color: colors.text.tertiary,
        marginTop: spacing.xs,
    },

    // Features
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.brand.tint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: typography.subhead,
        fontWeight: typography.semibold,
        color: colors.text.primary,
    },
    featureDesc: {
        fontSize: typography.footnote,
        color: colors.text.secondary,
        marginTop: 1,
    },

    // CTA
    ctaSection: {
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    ctaPressable: {
        width: '100%',
        shadowColor: '#C9A0FF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        height: 56,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
    },
    ctaText: {
        fontSize: typography.headline,
        fontWeight: typography.semibold,
        color: '#FFFFFF',
    },
    ctaNote: {
        fontSize: typography.footnote,
        color: colors.text.tertiary,
        marginTop: spacing.md,
    },
});
