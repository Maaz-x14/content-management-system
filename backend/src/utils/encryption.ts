import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authConfig } from '../config/auth';

/**
 * Hash password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, authConfig.bcryptRounds);
}

/**
 * Compare password with hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 * @param payload - Token payload
 * @returns JWT token
 */
export function generateAccessToken(payload: { userId: number; email: string; role: string }): string {
    return jwt.sign(payload, authConfig.jwtSecret, {
        expiresIn: authConfig.jwtExpiresIn,
    } as jwt.SignOptions);
}

/**
 * Generate JWT refresh token
 * @param payload - Token payload
 * @returns Refresh token
 */
export function generateRefreshToken(payload: { userId: number }): string {
    return jwt.sign(payload, authConfig.refreshTokenSecret, {
        expiresIn: authConfig.refreshTokenExpiresIn,
    } as jwt.SignOptions);
}

/**
 * Verify JWT access token
 * @param token - JWT token
 * @returns Decoded payload
 */
export function verifyAccessToken(token: string): { userId: number; email: string; role: string } {
    return jwt.verify(token, authConfig.jwtSecret) as { userId: number; email: string; role: string };
}

/**
 * Verify JWT refresh token
 * @param token - Refresh token
 * @returns Decoded payload
 */
export function verifyRefreshToken(token: string): { userId: number } {
    return jwt.verify(token, authConfig.refreshTokenSecret) as { userId: number };
}

/**
 * Generate random token for password reset
 * @returns Random token
 */
export function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result
 */
export function validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
