import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps {
    children: ReactNode;
    loading?: boolean;
    loadingText?: string;
    variant?: 'primary' | 'secondary' | 'glass';
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
}

export function LoadingButton({
    children,
    loading = false,
    loadingText,
    variant = 'primary',
    disabled,
    className = '',
    type = 'button',
    onClick,
}: LoadingButtonProps) {
    const baseStyles = 'relative font-bold text-xs uppercase tracking-[0.3em] transition-all disabled:opacity-50 flex items-center justify-center gap-3';

    const variants = {
        primary: 'gradient-primary rounded-2xl px-8 py-5 text-white hover:opacity-90 shadow-2xl shadow-violet-500/20',
        secondary: 'bg-zinc-800 rounded-2xl px-8 py-5 text-white hover:bg-zinc-700',
        glass: 'bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-8 py-4 text-white',
    };

    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            disabled={disabled || loading}
            type={type}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{loadingText || 'Processing...'}</span>
                </>
            ) : (
                children
            )}
        </motion.button>
    );
}
