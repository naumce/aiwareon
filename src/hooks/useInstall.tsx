import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    // Listen for install prompt
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const isIOS = () => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    };

    const isInstalled = () => {
        return window.matchMedia('(display-mode: standalone)').matches;
    };

    const handleInstall = async () => {
        // iOS - show manual instructions
        if (isIOS()) {
            setShowIOSInstructions(true);
            return;
        }

        // Android - use native prompt
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                localStorage.setItem('pwa_installed', 'true');
            }
            setDeferredPrompt(null);
        }
    };

    const IOSInstructions = () => (
        <AnimatePresence>
            {showIOSInstructions && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowIOSInstructions(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-sm glass rounded-3xl p-6 border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold mb-4">Install AIWear on iOS</h3>
                        <div className="space-y-4 text-sm text-zinc-300">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-violet-400 font-bold">1</span>
                                </div>
                                <p>Tap the <strong>Share</strong> button at the bottom of Safari</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-violet-400 font-bold">2</span>
                                </div>
                                <p>Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-violet-400 font-bold">3</span>
                                </div>
                                <p>Tap <strong>"Add"</strong> in the top right corner</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowIOSInstructions(false)}
                            className="w-full mt-6 py-3 rounded-xl gradient-primary text-white font-bold text-sm uppercase tracking-widest"
                        >
                            Got it!
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return {
        canInstall: !isInstalled() && (!!deferredPrompt || isIOS()),
        isInstalled: isInstalled(),
        handleInstall,
        IOSInstructions
    };
}
