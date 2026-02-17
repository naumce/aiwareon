import { useState, useCallback, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { PasswordInput, EmailInput, LoadingButton, SuccessBanner } from '../components/auth';
import { validatePassword } from '../utils/passwordValidation';

const REMEMBERED_EMAIL_KEY = 'aiwear-remembered-email';

type AuthMode = 'login' | 'signup' | 'forgot';

export function LoginPage() {
    const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, requestPasswordReset, isLoading } = useAuthStore();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/studio';

    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [emailValid, setEmailValid] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [forgotSent, setForgotSent] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    const handleEmailValidation = useCallback((isValid: boolean) => {
        setEmailValid(isValid);
    }, []);

    const switchMode = useCallback((newMode: AuthMode) => {
        setMode(newMode);
        setError(null);
        setForgotSent(false);
    }, []);

    const handleGoogleSignIn = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await signInWithGoogle();
        if (result.error) setError(result.error);
        setLoading(false);
    }, [signInWithGoogle]);

    const handleEmailAuth = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (mode === 'signup') {
            const validation = validatePassword(password);
            if (!validation.isValid) {
                setError('Please create a stronger password (12+ characters with uppercase, lowercase, and numbers)');
                setLoading(false);
                return;
            }
        }

        if (mode === 'forgot') {
            const result = await requestPasswordReset(email);
            if (result.error) {
                setError(result.error);
            } else {
                setForgotSent(true);
            }
            setLoading(false);
            return;
        }

        const result = mode === 'signup'
            ? await signUpWithEmail(email, password)
            : await signInWithEmail(email, password);

        if (result.error) {
            setError(result.error);
        } else {
            if (rememberMe) {
                localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
            } else {
                localStorage.removeItem(REMEMBERED_EMAIL_KEY);
            }
            if (mode === 'signup') {
                setShowSuccess(true);
            }
        }
        setLoading(false);
    }, [mode, password, email, signUpWithEmail, signInWithEmail, requestPasswordReset, rememberMe]);

    if (user && !showSuccess) return <Navigate to={from} replace />;

    if (showSuccess) {
        return (
            <div className="h-[100dvh] w-full flex items-center justify-center px-4 relative overflow-hidden"
                style={{ background: '#F7F5F2' }}>
                <div className="mesh-bg" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-md w-full relative z-10"
                >
                    <SuccessBanner
                        title="Account Created"
                        message="Welcome to AIWEAR. Your studio is ready."
                        ctaText="Continue to Studio"
                        ctaLink="/studio"
                        showEmailVerification={false}
                        onClose={() => setShowSuccess(false)}
                    />
                </motion.div>
            </div>
        );
    }

    // Header text based on mode
    const headerTitle = mode === 'login' ? 'Welcome Back'
        : mode === 'signup' ? 'Join AIWEAR'
            : 'Reset Password';

    const headerSubtitle = mode === 'login' ? 'Sign in to continue your style journey'
        : mode === 'signup' ? 'Create an account to start trying on'
            : "We'll help you get back in";

    return (
        <div className="h-[100dvh] w-full flex items-center justify-center px-4 relative overflow-hidden"
            style={{ background: '#F7F5F2' }}>

            {/* Animated Mesh Background */}
            <div className="mesh-bg" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-md w-full relative z-10"
            >
                {/* Skip Button */}
                <Link
                    to="/"
                    className="absolute -top-12 right-0 text-sm text-[#888] hover:text-[#FF8FAB] transition-colors font-medium"
                >
                    Skip for now
                </Link>

                {/* Auth Card */}
                <div className="rounded-3xl p-8 md:p-10"
                    style={{
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
                    }}>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold mb-2 text-gradient">
                            {headerTitle}
                        </h1>
                        <p className="text-sm text-[#888]">
                            {headerSubtitle}
                        </p>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 rounded-2xl text-sm text-red-500 text-center"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.15)'
                                }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Forms Container */}
                    <AnimatePresence mode="wait">
                        {/* ===== LOGIN FORM ===== */}
                        {mode === 'login' && (
                            <motion.form
                                key="login"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleEmailAuth}
                                className="space-y-4"
                            >
                                <EmailInput
                                    label="Email"
                                    value={email}
                                    onChange={setEmail}
                                    onValidationChange={handleEmailValidation}
                                />

                                <PasswordInput
                                    label="Password"
                                    value={password}
                                    onChange={setPassword}
                                />

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 rounded accent-[#FF8FAB]"
                                        />
                                        <span className="text-xs text-[#888] group-hover:text-[#1A1A2E] transition-colors">
                                            Remember me
                                        </span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => switchMode('forgot')}
                                        className="text-xs text-[#FF8FAB] hover:text-[#C9A0FF] font-semibold transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                <LoadingButton
                                    type="submit"
                                    loading={loading}
                                    loadingText="Logging in..."
                                    disabled={loading || isLoading}
                                    className="w-full"
                                >
                                    Log In
                                </LoadingButton>
                            </motion.form>
                        )}

                        {/* ===== SIGNUP FORM ===== */}
                        {mode === 'signup' && (
                            <motion.form
                                key="signup"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleEmailAuth}
                                className="space-y-4"
                            >
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[#888] px-1 block">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#AAA]">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Full Name"
                                            className="w-full h-14 rounded-2xl text-sm transition-all duration-300 pl-12 pr-4 focus:outline-none"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.6)',
                                                border: '2px solid transparent',
                                                color: '#1A1A2E',
                                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.background = 'white';
                                                e.target.style.borderColor = '#FF8FAB';
                                                e.target.style.boxShadow = '0 8px 24px rgba(255, 143, 171, 0.2)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.background = 'rgba(255, 255, 255, 0.6)';
                                                e.target.style.borderColor = 'transparent';
                                                e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05)';
                                            }}
                                        />
                                    </div>
                                </div>

                                <EmailInput
                                    label="Email"
                                    value={email}
                                    onChange={setEmail}
                                    onValidationChange={handleEmailValidation}
                                />

                                <PasswordInput
                                    label="Password"
                                    value={password}
                                    onChange={setPassword}
                                    showStrengthMeter
                                    showRequirements
                                />

                                <LoadingButton
                                    type="submit"
                                    loading={loading}
                                    loadingText="Creating Account..."
                                    disabled={loading || !emailValid}
                                    className="w-full"
                                >
                                    Sign Up
                                </LoadingButton>
                            </motion.form>
                        )}

                        {/* ===== FORGOT PASSWORD FORM ===== */}
                        {mode === 'forgot' && (
                            <motion.div
                                key="forgot"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {forgotSent ? (
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                                            style={{ background: '#4CAF50' }}>
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-[#888]">
                                            Recovery link sent to <strong className="text-[#1A1A2E]">{email}</strong>
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => switchMode('login')}
                                            className="text-sm text-[#FF8FAB] hover:text-[#C9A0FF] font-semibold transition-colors"
                                        >
                                            Back to Login
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleEmailAuth} className="space-y-4">
                                        <p className="text-sm text-[#888] text-center mb-2">
                                            Enter your email and we'll send you a link to reset your password.
                                        </p>

                                        <EmailInput
                                            label="Email"
                                            value={email}
                                            onChange={setEmail}
                                            onValidationChange={handleEmailValidation}
                                        />

                                        <LoadingButton
                                            type="submit"
                                            loading={loading}
                                            loadingText="Sending..."
                                            disabled={loading || !emailValid}
                                            className="w-full"
                                        >
                                            Send Link
                                        </LoadingButton>

                                        <button
                                            type="button"
                                            onClick={() => switchMode('login')}
                                            className="w-full text-center text-sm text-[#888] hover:text-[#1A1A2E] font-medium transition-colors"
                                        >
                                            Back to Login
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Divider — hidden in forgot mode */}
                    {mode !== 'forgot' && (
                        <div className="flex items-center my-6">
                            <div className="flex-1 h-px bg-[#EEE]" />
                            <span className="mx-4 text-xs text-[#BBB]">Or continue with</span>
                            <div className="flex-1 h-px bg-[#EEE]" />
                        </div>
                    )}

                    {/* Social Buttons — hidden in forgot mode */}
                    {mode !== 'forgot' && (
                        <div className="flex justify-center gap-5 mb-6">
                            {/* Google */}
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={loading || isLoading}
                                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1 disabled:opacity-50"
                                style={{
                                    background: 'white',
                                    border: '1px solid #EEE',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A1A2E">
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.146 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.333-1.133 8.547-3.2 2.293-2.187 2.973-5.24 2.973-7.747 0-.76-.053-1.467-.173-2.133H12.48z" />
                                </svg>
                            </button>

                            {/* Apple */}
                            <button
                                disabled
                                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1 disabled:opacity-40"
                                style={{
                                    background: 'white',
                                    border: '1px solid #EEE',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A1A2E">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.07.45-2.2.53-3.19-.34C4.19 17.53 1.8 12.63 4.22 8.3c1.23-2.12 3.42-3.4 5.76-3.46 1.28-.03 2.52.88 3.3.88.75 0 2.16-1.1 3.63-.94 1.24.13 2.17.61 2.85 1.56-2.52 1.53-2.1 4.79.46 5.86-.53 1.55-1.25 3.09-2.05 4.16h-.06l-.06.02zM12.03 4.9c-.19-1.92 1.48-3.9 3.4-4.22.25 2.18-2 4.41-3.4 4.22z" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Switch Auth Mode Text — hidden in forgot mode */}
                    {mode !== 'forgot' && (
                        <p className="text-center text-sm text-[#888]">
                            {mode === 'login' ? (
                                <>
                                    Don't have an account?{' '}
                                    <strong
                                        onClick={() => switchMode('signup')}
                                        className="text-[#FF8FAB] cursor-pointer hover:text-[#C9A0FF] transition-colors"
                                    >
                                        Sign Up
                                    </strong>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <strong
                                        onClick={() => switchMode('login')}
                                        className="text-[#FF8FAB] cursor-pointer hover:text-[#C9A0FF] transition-colors"
                                    >
                                        Log In
                                    </strong>
                                </>
                            )}
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
