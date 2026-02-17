/**
 * ErrorBoundary Component - Apple HIG Compliant
 *
 * Design Decisions:
 * - Uses SF Pro system font stack (-apple-system) for native iOS feel
 * - Follows Apple's "Clarity" principle: clear error messaging without technical jargon
 * - Follows "Deference" principle: minimal UI, content-focused
 * - 44pt minimum touch target for restart button (HIG accessibility requirement)
 * - Capsule button shape (HIG recommendation for primary actions)
 * - Automatic light/dark mode support via useColorScheme
 * - Semantic color usage (system-red for errors, system-blue for actions)
 * - Proper visual hierarchy with Title1 (28px) and Body (17px) typography
 * - 8pt grid spacing system throughout
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    useColorScheme,
} from 'react-native';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI with the option to restart the app.
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Send to error tracking service when configured
        // Sentry.captureException(error, { extra: errorInfo });
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // If custom fallback provided, use it
            if (this.props.fallback && this.state.error) {
                return this.props.fallback(this.state.error, this.resetError);
            }

            // Default HIG-compliant error UI
            return <DefaultErrorFallback error={this.state.error} onReset={this.resetError} />;
        }

        return this.props.children;
    }
}

/**
 * Default Error Fallback UI - Apple HIG Design
 */
function DefaultErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Apple System Colors (from Figma Design Kit)
    const colors = {
        // Backgrounds
        bgPrimary: isDark ? '#000000' : '#FFFFFF',
        bgSecondary: isDark ? '#242426' : '#F2F2F7',

        // Labels (Text)
        labelPrimary: isDark ? '#FFFFFF' : '#000000',
        labelSecondary: isDark ? 'rgba(235, 235, 245, 0.7)' : 'rgba(60, 60, 67, 0.6)',
        labelTertiary: isDark ? 'rgba(235, 235, 245, 0.55)' : 'rgba(60, 60, 67, 0.3)',

        // System Colors
        systemRed: isDark ? '#FF6165' : '#FF383C',
        systemBlue: isDark ? '#5CB8FF' : '#0088FF',

        // Fills
        fillQuaternary: isDark ? 'rgba(118, 118, 128, 0.26)' : 'rgba(116, 116, 128, 0.08)',
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
            <View style={styles.content}>
                {/* Error Icon - Using system red */}
                <View
                    style={[styles.iconContainer, { backgroundColor: colors.fillQuaternary }]}
                    accessibilityLabel="Error icon"
                >
                    <Text style={[styles.iconText, { color: colors.systemRed }]}>⚠️</Text>
                </View>

                {/* Error Title - Title1 (28px, -0.26px letter-spacing) */}
                <Text
                    style={[styles.title, { color: colors.labelPrimary }]}
                    accessibilityRole="header"
                >
                    Something Went Wrong
                </Text>

                {/* Error Message - Body (17px, -0.43px letter-spacing) */}
                <Text
                    style={[styles.message, { color: colors.labelSecondary }]}
                    accessibilityRole="text"
                >
                    We're sorry for the inconvenience. The app encountered an unexpected error.
                </Text>

                {/* Error Details (if in development) - Footnote (13px) */}
                {__DEV__ && error && (
                    <View
                        style={[styles.errorDetails, { backgroundColor: colors.bgSecondary }]}
                        accessibilityLabel="Error details"
                    >
                        <Text
                            style={[styles.errorDetailsTitle, { color: colors.labelSecondary }]}
                            accessibilityRole="header"
                        >
                            Error Details (Development Only):
                        </Text>
                        <Text
                            style={[styles.errorDetailsText, { color: colors.labelTertiary }]}
                            accessibilityRole="text"
                            selectable
                        >
                            {error.toString()}
                        </Text>
                    </View>
                )}

                {/* Restart Button - Capsule Style, 44pt touch target */}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.systemBlue }]}
                    onPress={onReset}
                    activeOpacity={0.9}
                    accessibilityRole="button"
                    accessibilityLabel="Restart app"
                    accessibilityHint="Tap to restart the application"
                >
                    <Text style={styles.buttonText}>Restart App</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Container - Full screen with centered content
    container: {
        flex: 1,
    },

    // Content wrapper - Centered with padding
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32, // --space-8 (32px)
    },

    // Icon Container - Circular with fill background
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24, // --space-6 (24px)
    },

    iconText: {
        fontSize: 48,
    },

    // Title - Title1 typography (28px, bold)
    title: {
        fontFamily: '-apple-system',
        fontSize: 28, // --text-title1
        lineHeight: 34,
        letterSpacing: 0.38,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12, // --space-3 (12px)
    },

    // Message - Body typography (17px)
    message: {
        fontFamily: '-apple-system',
        fontSize: 17, // --text-body
        lineHeight: 22,
        letterSpacing: -0.43,
        fontWeight: '400',
        textAlign: 'center',
        marginBottom: 32, // --space-8 (32px)
    },

    // Error Details Container (Development only)
    errorDetails: {
        width: '100%',
        padding: 16, // --space-4
        borderRadius: 12, // --radius-md
        marginBottom: 24, // --space-6
    },

    errorDetailsTitle: {
        fontFamily: '-apple-system',
        fontSize: 13, // --text-footnote
        lineHeight: 18,
        letterSpacing: -0.08,
        fontWeight: '600',
        marginBottom: 8, // --space-2
    },

    errorDetailsText: {
        fontFamily: 'Menlo', // Monospace for code
        fontSize: 12,
        lineHeight: 16,
    },

    // Primary Button - Capsule style with 44pt touch target
    button: {
        minHeight: 44, // iOS minimum touch target
        paddingVertical: 12, // --space-3 (12px)
        paddingHorizontal: 24, // --space-6 (24px)
        borderRadius: 9999, // --radius-full (capsule)
        alignItems: 'center',
        justifyContent: 'center',
        // Active state handled by activeOpacity prop
    },

    buttonText: {
        fontFamily: '-apple-system',
        fontSize: 17, // --text-body
        lineHeight: 22,
        letterSpacing: -0.43,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

/**
 * Wrapper component to handle color scheme
 * (Class components can't use hooks directly)
 */
export function ErrorBoundary(props: ErrorBoundaryProps) {
    return <ErrorBoundaryClass {...props} />;
}

export default ErrorBoundary;
