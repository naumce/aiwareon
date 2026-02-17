import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { EmailInput, LoadingButton } from '../components/auth';

type FlowState = 'request' | 'sent';

export function ForgotPasswordPage() {
    const { requestPasswordReset } = useAuthStore();
    const [email, setEmail] = useState('');
    const [flowState, setFlowState] = useState<FlowState>('request');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [emailValid, setEmailValid] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

    const handleResend = async () => {
        setLoading(true);
        setError(null);

        const result = await requestPasswordReset(email);

        if (result.error) {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="h-[100dvh] w-full flex items-center justify-center px-4 relative overflow-y-auto overflow-x-hidden"
            style={{ background: '#F7F5F2' }}>

            {/* Animated Mesh Background */}
            <div className="mesh-bg" />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-3xl p-8 md:p-10 max-w-md w-full relative z-10"
                style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
                }}
            >
                <Link to="/login" className="absolute top-6 left-6 text-[#AAA] hover:text-[#1A1A2E] transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold mb-2 text-gradient">
                        AIWEAR
                    </h1>
                    <p className="text-sm text-[#888]">
                        Password Recovery
                    </p>
                </div>

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

                <AnimatePresence mode="wait">
                    {flowState === 'request' ? (
                        <motion.form
                            key="request"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div className="text-center mb-4">
                                <h2 className="text-lg font-bold text-[#1A1A2E] mb-2">
                                    Forgot Password?
                                </h2>
                                <p className="text-sm text-[#888]">
                                    Enter your email and we'll send you a recovery link
                                </p>
                            </div>

                            <EmailInput
                                label="Account Email"
                                value={email}
                                onChange={setEmail}
                                onValidationChange={setEmailValid}
                            />

                            <LoadingButton
                                type="submit"
                                loading={loading}
                                loadingText="Sending..."
                                disabled={loading || !emailValid}
                                className="w-full"
                            >
                                Send Reset Link
                            </LoadingButton>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="text-sm font-semibold text-[#888] hover:text-[#FF8FAB] transition-colors"
                                >
                                    Return to Sign In
                                </Link>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="sent"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6 text-center"
                        >
                            {/* Mail Icon */}
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #C9A0FF, #FF8FAB)' }}>
                                    <Mail className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-[#1A1A2E] mb-2">
                                    Check Your Email
                                </h2>
                                <p className="text-sm text-[#888]">
                                    We've sent a recovery link to
                                </p>
                                <p className="text-sm text-[#FF8FAB] font-semibold mt-2">
                                    {email}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.6)',
                                    border: '1px solid rgba(0, 0, 0, 0.05)',
                                }}>
                                <p className="text-xs text-[#888]">
                                    Didn't receive it?{' '}
                                    <button
                                        onClick={handleResend}
                                        disabled={loading}
                                        className="text-[#FF8FAB] hover:text-[#C9A0FF] transition-colors underline underline-offset-4 font-semibold"
                                    >
                                        {loading ? 'Sending...' : 'Resend'}
                                    </button>
                                </p>
                            </div>

                            <Link
                                to="/login"
                                className="inline-block text-sm font-semibold text-[#888] hover:text-[#FF8FAB] transition-colors"
                            >
                                Return to Sign In
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
