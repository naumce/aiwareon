import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { useTheme, spacing, borderRadius, typography } from '../../theme';

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

    const handleSubmit = async () => {
        if (!email) {
            setError('Please enter your email');
            return;
        }

        setLoading(true);
        setError(null);

        const result = await requestPasswordReset(email);

        if (result.error) {
            setError(result.error);
        } else {
            setFlowState('sent');
        }
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>AIWEAR</Text>
                        <Text style={styles.subtitle}>Password Recovery</Text>
                    </View>

                    {/* Error Message */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {flowState === 'request' ? (
                        <View style={styles.form}>
                            <Text style={styles.title}>Forgot Password?</Text>
                            <Text style={styles.description}>
                                Enter your email and we'll send you a recovery link
                            </Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    placeholderTextColor={colors.text.disabled}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={colors.gradient.primary}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.submitButton}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={colors.text.primary} />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Send Reset Link</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.successState}>
                            <View style={styles.successIcon}>
                                <Text style={styles.successIconText}>✉️</Text>
                            </View>
                            <Text style={styles.successTitle}>Check Your Email</Text>
                            <Text style={styles.successDescription}>
                                We've sent a recovery link to
                            </Text>
                            <Text style={styles.successEmail}>{email}</Text>

                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                <Text style={styles.resendText}>
                                    Didn't receive it?{' '}
                                    <Text style={styles.resendLink}>
                                        {loading ? 'Sending...' : 'Resend'}
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.returnText}>Return to Sign In</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    backButton: {
        padding: spacing.sm,
        marginTop: spacing.md,
    },
    backButtonText: {
        fontSize: 20,
        color: colors.text.muted,
    },
    header: {
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.xxl,
    },
    logo: {
        fontSize: typography.xxl,
        fontWeight: typography.bold,
        color: colors.text.primary,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: typography.xs,
        color: colors.text.muted,
        marginTop: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    errorText: {
        color: colors.state.error,
        fontSize: typography.sm,
        textAlign: 'center',
    },
    form: {
        gap: spacing.md,
    },
    title: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.text.primary,
        textAlign: 'center',
    },
    description: {
        fontSize: typography.sm,
        color: colors.text.muted,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    inputGroup: {
        gap: spacing.xs,
    },
    inputLabel: {
        fontSize: typography.xs,
        fontWeight: typography.semibold,
        color: colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: colors.background.elevated,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.base,
        color: colors.text.primary,
    },
    submitButton: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    submitButtonText: {
        fontSize: typography.base,
        fontWeight: typography.semibold,
        color: colors.text.primary,
    },
    successState: {
        alignItems: 'center',
        gap: spacing.md,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.brand.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successIconText: {
        fontSize: 40,
    },
    successTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.text.primary,
    },
    successDescription: {
        fontSize: typography.sm,
        color: colors.text.muted,
    },
    successEmail: {
        fontSize: typography.base,
        color: colors.brand.primary,
        fontWeight: typography.medium,
    },
    resendText: {
        fontSize: typography.sm,
        color: colors.text.muted,
        marginTop: spacing.lg,
    },
    resendLink: {
        color: colors.brand.primary,
    },
    returnText: {
        fontSize: typography.sm,
        color: colors.text.disabled,
        textAlign: 'center',
        marginTop: spacing.xxl,
    },
});
