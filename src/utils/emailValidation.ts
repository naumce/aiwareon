const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
    if (!email) return false;
    return EMAIL_REGEX.test(email.toLowerCase());
}

export function getEmailDomain(email: string): string | null {
    if (!validateEmail(email)) return null;
    const parts = email.split('@');
    return parts[1] || null;
}

// Check if email is from common disposable email providers
const DISPOSABLE_DOMAINS = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'throwaway.email',
    'mailinator.com',
    'yopmail.com',
];

export function isDisposableEmail(email: string): boolean {
    const domain = getEmailDomain(email);
    if (!domain) return false;
    return DISPOSABLE_DOMAINS.includes(domain.toLowerCase());
}
