import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstall } from '../hooks/useInstall';

/**
 * Floating side icon that prompts users to install the PWA
 * Shows on mobile/tablet when not already installed
 */
export function PWAInstallFloater() {
    const { canInstall, isInstalled, handleInstall, IOSInstructions } = useInstall();
    const [isDismissed, setIsDismissed] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Check if user previously dismissed
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa_floater_dismissed');
        if (dismissed) {
            setIsDismissed(true);
        }
    }, []);

    // Auto-show tooltip after 3 seconds
    useEffect(() => {
        if (canInstall && !isInstalled && !isDismissed) {
            const timer = setTimeout(() => {
                setShowTooltip(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [canInstall, isInstalled, isDismissed]);

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('pwa_floater_dismissed', 'true');
    };

    const handleClick = () => {
        setShowTooltip(false);
        handleInstall();
    };

    // Don't show if installed or can't install or dismissed
    if (isInstalled || !canInstall || isDismissed) return <IOSInstructions />;

    return (
        <>
            <IOSInstructions />

            {/* Floating Install Button */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                className="fixed right-4 bottom-24 z-40 flex items-center gap-2"
            >
                {/* Tooltip */}
                <AnimatePresence>
                    {showTooltip && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className="relative max-w-[200px] p-3 rounded-xl text-sm"
                            style={{
                                background: 'rgba(20, 20, 20, 0.95)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            {/* Arrow */}
                            <div
                                className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45"
                                style={{ background: 'rgba(20, 20, 20, 0.95)' }}
                            />

                            <button
                                onClick={() => setShowTooltip(false)}
                                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-white"
                            >
                                ×
                            </button>

                            <p className="text-white font-medium mb-1">📲 Install App</p>
                            <p className="text-zinc-400 text-xs leading-relaxed">
                                Add AIWEAR to your home screen for faster access!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClick}
                    className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)'
                    }}
                >
                    {/* Pulse ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                    />

                    {/* Icon */}
                    <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </motion.button>

                {/* Dismiss X (small button below main) */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    onClick={handleDismiss}
                    className="absolute -bottom-8 right-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                    Hide
                </motion.button>
            </motion.div>
        </>
    );
}
