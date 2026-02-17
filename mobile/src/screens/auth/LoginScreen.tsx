import React, { useState, useRef, useCallback } from 'react';
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
    LayoutAnimation,
    UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores/authStore';
import type { RootStackParamList } from '../../types';
import { useTheme, spacing, borderRadius, typography } from '../../theme';
import { IconSymbol, ScalePressable } from '../../components/ui';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export function LoginScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuthStore();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Animation values
    const contentOpacity = useRef(new Animated.Value(1)).current;
    const contentSlide = useRef(new Animated.Value(0)).current;

    const toggleMode = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setError(null);

        // Phase 1: Animate content out (fade + slide left)
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
            // Switch form mode
            setIsSignUp(prev => !prev);

            // LayoutAnimation for forgot password link appear/disappear
            LayoutAnimation.configureNext({
                duration: 300,
                create: { type: 'easeInEaseOut', property: 'opacity' },
                update: { type: 'easeInEaseOut' },
                delete: { type: 'easeInEaseOut', property: 'opacity' },
            });

            // Phase 2: Reset slide to right side, then animate in
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
    }, [contentOpacity, contentSlide]);

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError('Please enter your email and password');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);
        setError(null);

        const result = isSignUp
            ? await signUpWithEmail(email.trim(), password)
            : await signInWithEmail(email.trim(), password);

        if (result.error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError(result.error);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setLoading(false);
    };

    const handleGoogleSignIn = useCallback(async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);
        setError(null);

        const result = await signInWithGoogle();
        if (result.error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError(result.error);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setLoading(false);
    }, [signInWithGoogle]);

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
                        {/* Back — goes to Landing on sign-in, switches to sign-in on sign-up */}
                        <ScalePressable
                            style={styles.backButton}
                            onPress={() => isSignUp ? toggleMode() : navigation.goBack()}
                            hapticType="light"
                        >
                            <IconSymbol name="ChevronLeft" size={24} color={colors.brand.primary} strokeWidth={2} />
                            <Text style={styles.backText}>{isSignUp ? 'Sign In' : 'Back'}</Text>
                        </ScalePressable>

                        {/* Animated Header + Form */}
                        <Animated.View style={{
                            opacity: contentOpacity,
                            transform: [{ translateX: contentSlide }],
                        }}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>
                                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                                </Text>
                                <Text style={styles.subtitle}>
                                    {isSignUp
                                        ? 'Enter your details to get started'
                                        : 'Sign in to continue'}
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

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="••••••••"
                                        placeholderTextColor={colors.text.tertiary}
                                        secureTextEntry
                                        autoComplete="password"
                                    />
                                </View>

                                {!isSignUp && (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('ForgotPassword')}
                                        style={styles.forgotLink}
                                    >
                                        <Text style={styles.forgotText}>Forgot Password?</Text>
                                    </TouchableOpacity>
                                )}

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
                                            <Text style={styles.submitButtonText}>
                                                {isSignUp ? 'Create Account' : 'Sign In'}
                                            </Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Toggle — directly below submit */}
                                <View style={styles.toggleSection}>
                                    <Text style={styles.toggleText}>
                                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                                    </Text>
                                    <TouchableOpacity onPress={toggleMode}>
                                        <Text style={styles.toggleLink}>
                                            {isSignUp ? 'Sign In' : 'Create Account'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Divider */}
                                <View style={styles.dividerRow}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>Or continue with</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                {/* Google Sign In */}
                                <TouchableOpacity
                                    onPress={handleGoogleSignIn}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                    style={styles.googleButton}
                                >
                                    <View style={styles.googleIconContainer}>
                                        <Text style={styles.googleIcon}>G</Text>
                                    </View>
                                    <Text style={styles.googleButtonText}>
                                        {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
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
    backIcon: {
        fontSize: 32,
        color: colors.brand.primary,
        marginRight: 2,
        marginTop: -2,
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
    forgotLink: {
        alignSelf: 'flex-end',
    },
    forgotText: {
        fontSize: typography.subhead,
        color: colors.brand.primary,
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
    toggleSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.xs,
        paddingTop: spacing.md,
    },
    toggleText: {
        fontSize: typography.subhead,
        color: colors.text.secondary,
    },
    toggleLink: {
        fontSize: typography.subhead,
        fontWeight: typography.medium,
        color: colors.brand.primary,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.separator.opaque,
    },
    dividerText: {
        marginHorizontal: spacing.md,
        fontSize: typography.caption1,
        color: colors.text.tertiary,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.separator.opaque,
        gap: spacing.sm,
    },
    googleIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4285F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleIcon: {
        fontSize: 14,
        fontWeight: '700' as const,
        color: '#FFFFFF',
    },
    googleButtonText: {
        fontSize: typography.body,
        fontWeight: typography.medium,
        color: colors.text.primary,
    },
});
