import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../stores/authStore';
import { useTheme, spacing, borderRadius, typography } from '../../theme';
import { IconSymbol, ScalePressable } from '../../components/ui';

type FlowState = 'request' | 'sent';

export function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const { requestPasswordReset } = useAuthStore();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [email, setEmail] = useState('');
    const [flowState, setFlowState] = useState<FlowState>('request');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Animation for state transition
    const contentOpacity = useRef(new Animated.Value(1)).current;
    const contentSlide = useRef(new Animated.Value(0)).current;

    const handleSubmit = async () => {
        if (!email.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError('Please enter your email');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);
        setError(null);

        const result = await requestPasswordReset(email.trim());

        if (result.error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError(result.error);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            animateToSent();
        }
        setLoading(false);
    };

    const animateToSent = () => {
        Animated.parallel([
            Animated.timing(contentOpacity, {
                toValue: 0,
                duration: 160,
                useNativeDriver: true,
            }),
            Animated.timing(contentSlide, {
                toValue: -30,
                duration: 160,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setFlowState('sent');
            contentSlide.setValue(30);
            Animated.parallel([
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 280,
                    useNativeDriver: true,
                }),
                Animated.spring(contentSlide, {
                    toValue: 0,
                    tension: 80,
                    friction: 12,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Back Button */}
                        <ScalePressable
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            hapticType="light"
                        >
                            <IconSymbol name="ChevronLeft" size={24} color={colors.brand.primary} strokeWidth={2} />
                            <Text style={styles.backText}>Sign In</Text>
                        </ScalePressable>

                        {/* Animated Content */}
                        <Animated.View style={{
                            opacity: contentOpacity,
                            transform: [{ translateX: contentSlide }],
                        }}>
                            {flowState === 'request' ? (
                                <>
                                    {/* Header */}
                                    <View style={styles.header}>
                                        <Text style={styles.title}>Reset Password</Text>
                                        <Text style={styles.subtitle}>
                                            Enter your email and we'll send you a recovery link
                                        </Text>
                                    </View>

                                    {/* Error */}
                                    {error && (
                                        <View style={styles.errorBox}>
                                            <Text style={styles.errorText}>{error}</Text>
                                        </View>
                                    )}

                                    {/* Form */}
                                    <View style={styles.form}>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>Email</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={email}
                                                onChangeText={setEmail}
                                                placeholder="you@example.com"
                                                placeholderTextColor={colors.text.tertiary}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                                autoComplete="email"
                                            />
                                        </View>

                                        {/* Submit */}
                                        <TouchableOpacity
                                            onPress={handleSubmit}
                                            disabled={loading}
                                            activeOpacity={0.9}
                                            style={styles.submitWrapper}
                                        >
                                            <LinearGradient
                                                colors={colors.gradient.primary}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.submitButton}
                                            >
                                                {loading ? (
                                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                                ) : (
                                                    <Text style={styles.submitButtonText}>Send Reset Link</Text>
                                                )}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <>
                                    {/* Success State */}
                                    <View style={styles.header}>
                                        <Text style={styles.title}>Check Your Email</Text>
                                        <Text style={styles.subtitle}>
                                            We've sent a recovery link to
                                        </Text>
                                        <Text style={styles.emailHighlight}>{email}</Text>
                                    </View>

                                    {/* Error (for resend failures) */}
                                    {error && (
                                        <View style={styles.errorBox}>
                                            <Text style={styles.errorText}>{error}</Text>
                                        </View>
                                    )}

                                    <View style={styles.form}>
                                        {/* Resend Button */}
                                        <TouchableOpacity
                                            onPress={handleSubmit}
                                            disabled={loading}
                                            activeOpacity={0.9}
                                            style={styles.submitWrapper}
                                        >
                                            <LinearGradient
                                                colors={colors.gradient.primary}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.submitButton}
                                            >
                                                {loading ? (
                                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                                ) : (
                                                    <Text style={styles.submitButtonText}>Resend Link</Text>
                                                )}
                                            </LinearGradient>
                                        </TouchableOpacity>

                                        {/* Return to Sign In */}
                                        <View style={styles.returnSection}>
                                            <Text style={styles.returnText}>Didn't receive it? Check your spam folder or</Text>
                                            <TouchableOpacity
                                                onPress={() => navigation.goBack()}
                                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                            >
                                                <Text style={styles.returnLink}>return to Sign In</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </>
                            )}
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
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
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginLeft: -spacing.xs,
    },
    backText: {
        fontSize: typography.body,
        color: colors.brand.primary,
    },
    header: {
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    title: {
        fontSize: typography.largeTitle,
        fontWeight: typography.bold,
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: typography.body,
        color: colors.text.secondary,
        marginTop: spacing.sm,
    },
    emailHighlight: {
        fontSize: typography.body,
        fontWeight: typography.medium,
        color: colors.brand.primary,
        marginTop: spacing.xs,
    },
    errorBox: {
        backgroundColor: 'rgba(255, 69, 58, 0.12)',
        borderRadius: borderRadius.sm,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    errorText: {
        fontSize: typography.subhead,
        color: colors.state.error,
        textAlign: 'center',
    },
    form: {
        gap: spacing.lg,
    },
    inputGroup: {
        gap: spacing.xs,
    },
    inputLabel: {
        fontSize: typography.subhead,
        fontWeight: typography.medium,
        color: colors.text.secondary,
    },
    input: {
        backgroundColor: colors.fill.secondary,
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.body,
        color: colors.text.primary,
    },
    submitWrapper: {
        marginTop: spacing.sm,
    },
    submitButton: {
        paddingVertical: spacing.md + 2,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: typography.body,
        fontWeight: typography.semibold,
        color: '#FFFFFF',
    },
    returnSection: {
        alignItems: 'center',
        gap: spacing.xs,
        paddingTop: spacing.md,
    },
    returnText: {
        fontSize: typography.subhead,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    returnLink: {
        fontSize: typography.subhead,
        fontWeight: typography.medium,
        color: colors.brand.primary,
    },
});
