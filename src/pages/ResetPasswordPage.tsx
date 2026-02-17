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
                {flowState === 'reset' && (
                    <Link to="/login" className="absolute top-6 left-6 text-[#AAA] hover:text-[#1A1A2E] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                )}

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold mb-2 text-gradient">
                        AIWEAR
                    </h1>
                    <p className="text-sm text-[#888]">
                        {flowState === 'reset' ? 'Create New Password' : 'Password Updated'}
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
                    {flowState === 'reset' ? (
                        <motion.form
                            key="reset"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div className="space-y-4">
                                <PasswordInput
                                    label="New Password"
                                    value={password}
                                    onChange={setPassword}
                                    showStrengthMeter={true}
                                    showRequirements={true}
                                />

                                <PasswordInput
                                    label="Confirm Password"
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
                                Reset Password
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
                                title="Password Updated"
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
