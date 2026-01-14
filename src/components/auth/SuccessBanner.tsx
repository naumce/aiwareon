import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SuccessBannerProps {
    title: string;
    message: string;
    ctaText?: string;
    ctaLink?: string;
    onClose?: () => void;
    onContinue?: () => void;
    showEmailVerification?: boolean;
    autoHide?: boolean;
    autoHideDelay?: number;
}

export function SuccessBanner({
    title,
    message,
    ctaText,
    ctaLink,
    onClose,
    onContinue,
    showEmailVerification = false,
    autoHide = false,
    autoHideDelay = 5000,
}: SuccessBannerProps) {
    useEffect(() => {
        if (autoHide && onClose) {
            const timer = setTimeout(onClose, autoHideDelay);
            return () => clearTimeout(timer);
        }
    }, [autoHide, autoHideDelay, onClose]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
            >
                {/* Main Success Banner */}
                <div className="glass rounded-2xl p-6 border-white/10 shadow-2xl shadow-violet-500/20 relative">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    <div className="flex items-center gap-4">
                        {/* Checkmark Icon */}
                        <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-7 h-7 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold uppercase tracking-tight text-white">
                                {title}
                            </h3>
                            <p className="text-sm text-zinc-400 mt-1">
                                {message}
                            </p>
                        </div>

                        {/* CTA */}
                        {ctaText && (ctaLink || onContinue) && (
                            <div className="flex-shrink-0">
                                {ctaLink ? (
                                    <Link
                                        to={ctaLink}
                                        className="text-[10px] font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest transition-colors whitespace-nowrap"
                                        onClick={onContinue}
                                    >
                                        {ctaText} →
                                    </Link>
                                ) : (
                                    <button
                                        onClick={onContinue}
                                        className="text-[10px] font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest transition-colors whitespace-nowrap"
                                    >
                                        {ctaText} →
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Email Verification Notice */}
                {showEmailVerification && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/30 border border-white/5"
                    >
                        <Info className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            We've sent a verification email to verify your account
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
