import { useState, useCallback, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { PasswordInput, EmailInput, LoadingButton, SuccessBanner } from '../components/auth';
import { validatePassword } from '../utils/passwordValidation';

const REMEMBERED_EMAIL_KEY = 'aiwear-remembered-email';

export function LoginPage() {
    const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, isLoading } = useAuthStore();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/studio';

    const [mode, setMode] = useState<'quick' | 'email'>('quick');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [emailValid, setEmailValid] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    useEffect(() => {
        const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    const handleEmailValidation = useCallback((isValid: boolean) => {
        setEmailValid(isValid);
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

        if (isSignUp) {
            const validation = validatePassword(password);
            if (!validation.isValid) {
                setError('Please create a stronger password (12+ characters with uppercase, lowercase, and numbers)');
                setLoading(false);
                return;
            }
        }

        const result = isSignUp
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
            if (isSignUp) {
                setShowSuccess(true);
            }
        }
        setLoading(false);
    }, [isSignUp, password, email, signUpWithEmail, signInWithEmail, rememberMe]);

    if (user && !showSuccess) return <Navigate to={from} replace />;

    if (showSuccess) {
        return (
            <div className="h-[100dvh] w-full flex items-center justify-center px-4 relative overflow-hidden bg-[#0a0a0a]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-md w-full"
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

    return (
        <div className="h-[100dvh] w-full flex items-center justify-center px-4 relative overflow-hidden bg-[#0a0a0a]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-md w-full p-8 md:p-10 rounded-2xl relative"
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
            >
                {/* Back Button */}
                <Link
                    to="/"
                    className="absolute top-6 left-6 text-zinc-500 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">AIWEAR</h1>
                    <p className="text-sm text-zinc-500">
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </p>
                </div>

                {/* Error Message */}
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 rounded-xl text-sm text-red-400 text-center"
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {mode === 'quick' ? (
                    <div className="space-y-6">
                        {/* Get Started CTA */}
                        <div className="p-6 rounded-xl text-center"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}>
                            <p className="text-sm text-zinc-400 mb-4">
                                Create an account to save your generations and access your studio.
                            </p>
                            <button
                                onClick={() => {
                                    setMode('email');
                                    setIsSignUp(true);
                                }}
                                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.25)'
                                }}
                            >
                                Get Started
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
                            <span className="text-xs text-zinc-600">or continue with</span>
                            <div className="flex-1 h-px" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
                        </div>

                        {/* Google Button */}
                        <LoadingButton
                            onClick={handleGoogleSignIn}
                            loading={loading}
                            loadingText="Connecting..."
                            disabled={loading || isLoading}
                            variant="glass"
                            className="w-full"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </LoadingButton>

                        {/* Sign In Link */}
                        <div className="text-center">
                            <span className="text-xs text-zinc-600">Already have an account? </span>
                            <button
                                onClick={() => {
                                    setMode('email');
                                    setIsSignUp(false);
                                }}
                                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleEmailAuth} className="space-y-5">
                        <div className="space-y-4">
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
                                showStrengthMeter={isSignUp}
                                showRequirements={isSignUp}
                            />

                            {!isSignUp && (
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 rounded border-white/20 bg-zinc-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                                        />
                                        <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                            Remember me
                                        </span>
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            )}
                        </div>

                        <LoadingButton
                            type="submit"
                            loading={loading}
                            loadingText={isSignUp ? 'Creating Account...' : 'Signing In...'}
                            disabled={loading || (isSignUp && !emailValid)}
                            className="w-full"
                        >
                            {isSignUp ? 'Create Account' : 'Sign In'}
                        </LoadingButton>

                        <div className="text-center space-y-3">
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-xs text-zinc-500 hover:text-white transition-colors"
                            >
                                {isSignUp ? 'Already have an account? Sign In' : "New here? Create Account"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setMode('quick');
                                    setError(null);
                                }}
                                className="block w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                            >
                                ← Back
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
