import { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
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
    placeholder = 'Password',
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
            return 'bg-gray-200';
        }
        switch (validation.strength) {
            case 'weak':
                return 'bg-red-400';
            case 'fair':
                return 'bg-orange-400';
            case 'good':
                return 'bg-yellow-400';
            case 'strong':
                return index === 0 ? 'bg-[#C9A0FF]' : index === 1 ? 'bg-[#FF8FAB]' : index === 2 ? 'bg-[#7DD3C0]' : 'bg-emerald-400';
            default:
                return 'bg-gray-200';
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-xs font-medium text-[#888] px-1 block">
                {label}
            </label>

            <div className="relative">
                {/* Lock icon */}
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${isFocused ? 'text-[#FF8FAB]' : 'text-[#AAA]'
                    }`}>
                    <Lock className="w-5 h-5" />
                </div>

                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    minLength={12}
                    className="w-full h-14 rounded-2xl text-sm transition-all duration-300 pl-12 pr-12 focus:outline-none"
                    style={{
                        background: isFocused ? 'white' : 'rgba(255, 255, 255, 0.6)',
                        border: error
                            ? '2px solid rgba(239, 68, 68, 0.5)'
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

                <button
                    type="button"
                    onClick={toggleVisibility}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAA] hover:text-[#1A1A2E] transition-colors"
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
                            <span className={`text-xs font-semibold ${validation.strength === 'weak' ? 'text-red-400' :
                                    validation.strength === 'fair' ? 'text-orange-400' :
                                        validation.strength === 'good' ? 'text-yellow-500' :
                                            'text-emerald-500'
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
                        className="px-1 space-y-1"
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
                        className="text-xs text-red-400 px-1 flex items-center gap-1"
                    >
                        <span>⚠</span> {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <span className={`text-xs font-medium transition-colors ${met ? 'text-emerald-500' : 'text-[#BBB]'
            }`}>
            {met ? '✓' : '○'} {text}
        </span>
    );
}
