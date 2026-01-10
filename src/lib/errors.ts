/**
 * Error handling per 12_ERROR_AND_FAILURE_PATTERN.md
 * - Errors are explicit
 * - UI shows clear, human-readable messages
 */

export type ErrorCode =
    | 'INSUFFICIENT_CREDITS'
    | 'GENERATION_FAILED'
    | 'GENERATION_TIMEOUT'
    | 'NETWORK_ERROR'
    | 'AUTH_REQUIRED'
    | 'UPLOAD_FAILED'
    | 'INVALID_IMAGE'
    | 'INVALID_INPUT'
    | 'UPSCALE_FAILED'
    | 'SERVICE_UNAVAILABLE';

export interface AppError {
    code: ErrorCode;
    message: string;
    userMessage: string;
    recoverable: boolean;
}

export const ERROR_MESSAGES: Record<ErrorCode, { userMessage: string; recoverable: boolean }> = {
    INSUFFICIENT_CREDITS: {
        userMessage: "You don't have enough credits. Purchase more to continue.",
        recoverable: true,
    },
    GENERATION_FAILED: {
        userMessage: "Image generation failed. Your credits have been refunded.",
        recoverable: true,
    },
    GENERATION_TIMEOUT: {
        userMessage: "Generation is taking too long. Please try again.",
        recoverable: true,
    },
    NETWORK_ERROR: {
        userMessage: "Network connection lost. Please check your internet.",
        recoverable: true,
    },
    AUTH_REQUIRED: {
        userMessage: "Please sign in to continue.",
        recoverable: true,
    },
    UPLOAD_FAILED: {
        userMessage: "Failed to upload image. Please try again.",
        recoverable: true,
    },
    INVALID_IMAGE: {
        userMessage: "This image format is not supported. Please use JPG or PNG.",
        recoverable: true,
    },
    SERVICE_UNAVAILABLE: {
        userMessage: "Service is temporarily unavailable. Please try again later.",
        recoverable: false,
    },
    INVALID_INPUT: {
        userMessage: "Invalid input. Please check and try again.",
        recoverable: true,
    },
    UPSCALE_FAILED: {
        userMessage: "Failed to enhance image. Please try again.",
        recoverable: true,
    },
};

export function createAppError(code: ErrorCode, technicalMessage?: string): AppError {
    const errorConfig = ERROR_MESSAGES[code];
    return {
        code,
        message: technicalMessage || code,
        userMessage: errorConfig.userMessage,
        recoverable: errorConfig.recoverable,
    };
}
