import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores/authStore';
import type { RootStackParamList } from '../../types';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { IconSymbol, ScalePressable } from '../../components/ui';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function LoginScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { signInWithEmail, signUpWithEmail } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                        {/* Back */}
                        <ScalePressable
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            hapticType="light"
                        >
                            <IconSymbol name="ChevronLeft" size={24} color={colors.brand.primary} strokeWidth={2} />
                            <Text style={styles.backText}>Back</Text>
                        </ScalePressable>

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
                        </View>

                        {/* Toggle */}
                        <View style={styles.toggleSection}>
                            <Text style={styles.toggleText}>
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                            </Text>
                            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                                <Text style={styles.toggleLink}>
                                    {isSignUp ? 'Sign In' : 'Create Account'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
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
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
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
});
