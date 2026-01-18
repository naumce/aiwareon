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
        <div className="h-[100dvh] w-full flex items-center justify-center px-4 relative overflow-y-auto overflow-x-hidden bg-zinc-950">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full max-h-lg bg-violet-500/10 blur-[120px] rounded-full -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="glass p-12 rounded-[2.5rem] max-w-md w-full border-white/5 relative"
            >
                <Link to="/login" className="absolute top-8 left-8 text-zinc-600 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="text-center mb-10">
                    <div className="text-2xl font-bold tracking-tighter mb-2">
                        <span className="text-white">AI</span>
                        <span className="text-zinc-500">WEAR</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                        Password Recovery
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest text-center"
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
                            className="space-y-6"
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-2">
                                    Forgot Password?
                                </h2>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
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
                                    className="text-[9px] font-bold text-zinc-600 hover:text-zinc-400 uppercase tracking-widest transition-colors"
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
                                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                                    <Mail className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-2">
                                    Check Your Email
                                </h2>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
                                    We've sent a recovery link to
                                </p>
                                <p className="text-sm text-violet-400 font-medium mt-2">
                                    {email}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">
                                    Didn't receive it?{' '}
                                    <button
                                        onClick={handleResend}
                                        disabled={loading}
                                        className="text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-4"
                                    >
                                        {loading ? 'Sending...' : 'Resend'}
                                    </button>
                                </p>
                            </div>

                            <Link
                                to="/login"
                                className="inline-block text-[9px] font-bold text-zinc-600 hover:text-zinc-400 uppercase tracking-widest transition-colors"
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
