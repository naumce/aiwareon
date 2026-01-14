import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { PasswordInput, LoadingButton, SuccessBanner } from '../components/auth';
import { validatePassword } from '../utils/passwordValidation';

type FlowState = 'reset' | 'success';

export function ResetPasswordPage() {
    const { resetPassword } = useAuthStore();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [flowState, setFlowState] = useState<FlowState>('reset');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Check if we have a valid recovery session
    useEffect(() => {
        // Supabase handles the token from URL automatically
        // The user will have an active session if they clicked the reset link
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate password strength
        const validation = validatePassword(password);
        if (!validation.isValid) {
            setError('Please create a stronger password (12+ characters with uppercase, lowercase, and numbers)');
            setLoading(false);
            return;
        }

        // Check passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const result = await resetPassword(password);

        if (result.error) {
            setError(result.error);
        } else {
            setFlowState('success');
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
                {flowState === 'reset' && (
                    <Link to="/login" className="absolute top-8 left-8 text-zinc-600 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                )}

                <div className="text-center mb-10">
                    <div className="text-2xl font-bold tracking-tighter mb-2">
                        <span className="text-white">AI</span>
                        <span className="text-zinc-500">WEAR</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                        {flowState === 'reset' ? 'New Secure Code' : 'Password Updated'}
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
                    {flowState === 'reset' ? (
                        <motion.form
                            key="reset"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <PasswordInput
                                    label="New Secure Code"
                                    value={password}
                                    onChange={setPassword}
                                    showStrengthMeter={true}
                                    showRequirements={true}
                                />

                                <PasswordInput
                                    label="Confirm Secure Code"
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
                                />
                            </div>

                            <LoadingButton
                                type="submit"
                                loading={loading}
                                loadingText="Resetting..."
                                disabled={loading || !password || !confirmPassword}
                                className="w-full"
                            >
                                Reset Secure Code
                            </LoadingButton>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <SuccessBanner
                                title="Secure Code Updated"
                                message="Your password has been successfully reset."
                                ctaText="Sign In"
                                ctaLink="/login"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
