import { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    validatePassword,
    getPasswordStrengthSegments,
    getStrengthLabel,
    type PasswordValidation,
} from '../../utils/passwordValidation';

interface PasswordInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    showStrengthMeter?: boolean;
    showRequirements?: boolean;
    error?: string;
    placeholder?: string;
    className?: string;
}

export function PasswordInput({
    label,
    value,
    onChange,
    showStrengthMeter = false,
    showRequirements = false,
    error,
    placeholder = '••••••••',
    className = '',
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [validation, setValidation] = useState<PasswordValidation | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (value && (showStrengthMeter || showRequirements)) {
            setValidation(validatePassword(value));
        } else {
            setValidation(null);
        }
    }, [value, showStrengthMeter, showRequirements]);

    const toggleVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const segments = validation ? getPasswordStrengthSegments(validation.strength) : 0;

    const getSegmentColor = (index: number) => {
        if (!validation || index >= segments) {
            return 'bg-zinc-800';
        }
        switch (validation.strength) {
            case 'weak':
                return 'bg-red-500';
            case 'fair':
                return 'bg-orange-500';
            case 'good':
                return 'bg-yellow-500';
            case 'strong':
                return index === 0 ? 'bg-violet-500' : index === 1 ? 'bg-violet-400' : index === 2 ? 'bg-pink-400' : 'bg-pink-500';
            default:
                return 'bg-zinc-800';
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-2">
                {label}
            </label>

            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    minLength={12}
                    className={`w-full px-5 py-4 pr-12 rounded-2xl bg-zinc-900/50 
            text-white placeholder-zinc-700 focus:outline-none transition-colors text-sm
            ${error ? 'border-red-500/50 border' : isFocused ? 'border-violet-500/50 border' : 'border border-white/5'}
          `}
                />

                <button
                    type="button"
                    onClick={toggleVisibility}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                    ) : (
                        <Eye className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Strength Meter */}
            <AnimatePresence>
                {showStrengthMeter && value && validation && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                        data-testid="strength-meter"
                    >
                        <div className="flex gap-1">
                            {[0, 1, 2, 3].map((index) => (
                                <motion.div
                                    key={index}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: index * 0.1, duration: 0.3 }}
                                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${getSegmentColor(index)}`}
                                />
                            ))}
                        </div>

                        <div className="flex justify-between items-center px-1">
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${validation.strength === 'weak' ? 'text-red-400' :
                                    validation.strength === 'fair' ? 'text-orange-400' :
                                        validation.strength === 'good' ? 'text-yellow-400' :
                                            'text-emerald-400'
                                }`}>
                                {getStrengthLabel(validation.strength)}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Requirements */}
            <AnimatePresence>
                {showRequirements && isFocused && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-2 space-y-1"
                    >
                        {validation && (
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                                <RequirementItem met={validation.requirements.minLength} text="12+ chars" />
                                <RequirementItem met={validation.requirements.hasUppercase} text="uppercase" />
                                <RequirementItem met={validation.requirements.hasLowercase} text="lowercase" />
                                <RequirementItem met={validation.requirements.hasNumber} text="number" />
                                <RequirementItem met={validation.requirements.hasSpecial} text="special" />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-[9px] font-bold text-red-400 uppercase tracking-widest px-2 flex items-center gap-1"
                    >
                        <span className="text-red-500">⚠</span> {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <span className={`text-[8px] font-bold uppercase tracking-widest transition-colors ${met ? 'text-emerald-400' : 'text-zinc-600'
            }`}>
            {met ? '✓' : '○'} {text}
        </span>
    );
}
