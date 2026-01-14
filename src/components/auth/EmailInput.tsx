import { useState, useEffect, useCallback } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateEmail } from '../../utils/emailValidation';

interface EmailInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onValidationChange?: (isValid: boolean) => void;
    error?: string;
    placeholder?: string;
    className?: string;
}

export function EmailInput({
    label,
    value,
    onChange,
    onValidationChange,
    error,
    placeholder = 'EX: COUTURE@AIWEAR.COLLECTIVE',
    className = '',
}: EmailInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasBlurred, setHasBlurred] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);

    // Debounced validation
    useEffect(() => {
        if (!value) {
            setIsValid(null);
            onValidationChange?.(false);
            return;
        }

        const timer = setTimeout(() => {
            const valid = validateEmail(value);
            setIsValid(valid);
            onValidationChange?.(valid);
        }, 300);

        return () => clearTimeout(timer);
    }, [value, onValidationChange]);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        setHasBlurred(true);
    }, []);

    const showValidation = hasBlurred && value.length > 0;
    const showError = showValidation && isValid === false;
    const showSuccess = showValidation && isValid === true && !error;

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-2">
                {label}
            </label>

            <div className="relative">
                <input
                    type="email"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    required
                    className={`w-full px-5 py-4 rounded-2xl bg-zinc-900/50 
            text-white placeholder-zinc-700 focus:outline-none transition-all duration-300 text-sm
            ${error ? 'border-red-500/50 border' :
                            showError ? 'border-red-500/50 border' :
                                showSuccess ? 'border-emerald-500/50 border' :
                                    isFocused ? 'border-violet-500/50 border' : 'border border-white/5'}
          `}
                />

                {/* Validation Icon */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                            <Check className="w-5 h-5 text-emerald-400" />
                        </motion.div>
                    )}
                    {showError && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Validation Messages */}
            <AnimatePresence>
                {showSuccess && !error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest px-2 flex items-center gap-1"
                    >
                        <Check className="w-3 h-3" /> Valid email
                    </motion.p>
                )}

                {showError && !error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-[9px] font-bold text-red-400 uppercase tracking-widest px-2 flex items-center gap-1"
                    >
                        <AlertCircle className="w-3 h-3" /> Please enter a valid email address
                    </motion.p>
                )}

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-[9px] font-bold text-red-400 uppercase tracking-widest px-2 flex items-center gap-1"
                    >
                        <AlertCircle className="w-3 h-3" /> {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
