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
    const baseStyles = 'relative font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden';

    const variants = {
        primary: 'rounded-2xl px-8 py-4 text-white',
        secondary: 'bg-white rounded-2xl px-8 py-4 text-[#1A1A2E] border border-[rgba(0,0,0,0.05)] shadow-sm hover:shadow-md',
        glass: 'bg-white/60 hover:bg-white/80 border border-[rgba(0,0,0,0.08)] rounded-2xl px-8 py-4 text-[#1A1A2E] shadow-sm backdrop-blur-xl',
    };

    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            disabled={disabled || loading}
            type={type}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            style={variant === 'primary' ? {
                background: 'linear-gradient(135deg, #C9A0FF, #FF8FAB)',
                boxShadow: disabled ? 'none' : '0 10px 30px rgba(255, 143, 171, 0.4)',
            } : undefined}
        >
            {/* Shimmer sweep for primary */}
            {variant === 'primary' && !loading && !disabled && (
                <span className="shimmer-sweep" />
            )}

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
