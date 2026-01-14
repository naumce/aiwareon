import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

// Initialize zxcvbn with language packages
const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
};
zxcvbnOptions.setOptions(options);

export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface PasswordValidation {
  isValid: boolean;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  requirements: PasswordRequirements;
  score: number; // 0-4 from zxcvbn
  feedback: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const requirements: PasswordRequirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  const result = zxcvbn(password);

  const strengthMap: Record<number, PasswordValidation['strength']> = {
    0: 'weak',
    1: 'weak',
    2: 'fair',
    3: 'good',
    4: 'strong',
  };

  return {
    isValid: metRequirements >= 4 && password.length >= 12,
    strength: strengthMap[result.score] || 'weak',
    requirements,
    score: result.score,
    feedback: result.feedback.suggestions,
  };
}

export function getPasswordStrengthColor(strength: PasswordValidation['strength']): string {
  const colors = {
    weak: 'bg-red-500',
    fair: 'bg-orange-500',
    good: 'bg-yellow-500',
    strong: 'bg-gradient-to-r from-violet-500 to-pink-500',
  };
  return colors[strength];
}

export function getPasswordStrengthSegments(strength: PasswordValidation['strength']): number {
  const segments = { weak: 1, fair: 2, good: 3, strong: 4 };
  return segments[strength];
}

export function getStrengthLabel(strength: PasswordValidation['strength']): string {
  const labels = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };
  return labels[strength];
}
