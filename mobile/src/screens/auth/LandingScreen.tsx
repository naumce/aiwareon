import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { ScalePressable } from '../../components/ui';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FEATURES = [
    { title: 'Virtual Try-On', description: 'See yourself in any garment' },
    { title: 'Instant Results', description: 'AI processing in seconds' },
    { title: 'Studio Quality', description: 'Photorealistic output' },
    { title: 'Pay As You Go', description: 'No subscription required' },
];

export function LandingScreen() {
    const navigation = useNavigation<NavigationProp>();

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo */}
                    <View style={styles.logoSection}>
                        <Text style={styles.logo}>AIWear</Text>
                    </View>

                    {/* Hero */}
                    <View style={styles.hero}>
                        <Text style={styles.heroTitle}>
                            AI Virtual{'\n'}Try-On
                        </Text>
                        <Text style={styles.heroSubtitle}>
                            See yourself in any outfit before you buy.{'\n'}
                            Photorealistic results powered by AI.
                        </Text>
                    </View>

                    {/* Features */}
                    <View style={styles.features}>
                        {FEATURES.map((feature, index) => (
                            <View key={index} style={styles.featureRow}>
                                <View style={styles.featureDot} />
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDesc}>{feature.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* CTA */}
                    <View style={styles.ctaSection}>
                        <ScalePressable
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                navigation.navigate('Login');
                            }}
                        >
                            <LinearGradient
                                colors={colors.gradient.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.ctaButton}
                            >
                                <Text style={styles.ctaButtonText}>Get Started</Text>
                            </LinearGradient>
                        </ScalePressable>
                        <Text style={styles.ctaNote}>
                            Pay as you go · No subscription
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    logoSection: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    logo: {
        fontSize: typography.headline,
        fontWeight: typography.semibold,
        color: colors.text.primary,
        letterSpacing: 1,
    },
    hero: {
        paddingBottom: spacing.xxl,
    },
    heroTitle: {
        fontSize: 52,
        fontWeight: typography.bold,
        color: colors.text.primary,
        letterSpacing: -1.5,
        lineHeight: 56,
    },
    heroSubtitle: {
        fontSize: typography.body,
        color: colors.text.secondary,
        marginTop: spacing.lg,
        lineHeight: 24,
    },
    features: {
        paddingBottom: spacing.xxl,
        gap: spacing.md,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    featureDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.brand.primary,
        marginTop: 6,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: typography.body,
        fontWeight: typography.semibold,
        color: colors.text.primary,
    },
    featureDesc: {
        fontSize: typography.subhead,
        color: colors.text.secondary,
        marginTop: 2,
    },
    ctaSection: {
        alignItems: 'center',
        paddingTop: spacing.lg,
    },
    ctaButton: {
        paddingVertical: spacing.md + 2,
        paddingHorizontal: spacing.xxl + spacing.lg,
        borderRadius: borderRadius.md,
    },
    ctaButtonText: {
        fontSize: typography.body,
        fontWeight: typography.semibold,
        color: '#FFFFFF',
    },
    ctaNote: {
        fontSize: typography.footnote,
        color: colors.text.tertiary,
        marginTop: spacing.md,
    },
});
