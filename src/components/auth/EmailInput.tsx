import { useState, useEffect, useCallback } from 'react';
import { Check, AlertCircle, Mail } from 'lucide-react';
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
    placeholder = 'Email',
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
            <label className="text-xs font-medium text-[#888] px-1 block">
                {label}
            </label>

            <div className="relative">
                {/* Input icon */}
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${isFocused ? 'text-[#FF8FAB]' : 'text-[#AAA]'
                    }`}>
                    <Mail className="w-5 h-5" />
                </div>

                <input
                    type="email"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    required
                    className="w-full h-14 rounded-2xl text-sm transition-all duration-300 pl-12 pr-12 focus:outline-none"
                    style={{
                        background: isFocused ? 'white' : 'rgba(255, 255, 255, 0.6)',
                        border: error || showError
                            ? '2px solid rgba(239, 68, 68, 0.5)'
                            : showSuccess
                                ? '2px solid rgba(16, 185, 129, 0.5)'
                                : isFocused
                                    ? '2px solid #FF8FAB'
                                    : '2px solid transparent',
                        color: '#1A1A2E',
                        boxShadow: isFocused
                            ? '0 8px 24px rgba(255, 143, 171, 0.2)'
                            : '0 4px 16px rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(10px)',
                    }}
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
                            <Check className="w-5 h-5 text-emerald-500" />
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
                        className="text-xs text-emerald-500 px-1 flex items-center gap-1"
                    >
                        <Check className="w-3 h-3" /> Valid email
                    </motion.p>
                )}

                {showError && !error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs text-red-400 px-1 flex items-center gap-1"
                    >
                        <AlertCircle className="w-3 h-3" /> Please enter a valid email address
                    </motion.p>
                )}

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs text-red-400 px-1 flex items-center gap-1"
                    >
                        <AlertCircle className="w-3 h-3" /> {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
