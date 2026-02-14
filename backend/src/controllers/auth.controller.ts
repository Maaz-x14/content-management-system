import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import * as emailService from '../services/email.service';
import { validatePasswordStrength } from '../utils/encryption';
import { ApiError } from '../utils/ApiError';

/**
 * POST /api/v1/auth/login
 * Login user with email and password
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        const result = await authService.login(email, password);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw ApiError.badRequest('Refresh token is required');
        }

        const result = await authService.refreshAccessToken(refreshToken);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/auth/me
 * Get current authenticated user
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw ApiError.unauthorized('Not authenticated');
        }

        const user = await authService.getCurrentUser(req.user.userId);

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/auth/forgot-password
 * Request password reset
 */
export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email } = req.body;

        const resetToken = await authService.requestPasswordReset(email);

        // Send password reset email
        // Note: We get the user again to send the email, but don't reveal if user exists
        const { User } = await import('../models/User.model');
        const user = await User.findOne({ where: { email } });

        if (user) {
            await emailService.sendPasswordResetEmail(user.email, user.full_name, resetToken);
        }

        // Always return success to prevent email enumeration
        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/auth/reset-password
 * Reset password using reset token
 */
export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { token, newPassword } = req.body;

        // Validate password strength
        const passwordValidation = validatePasswordStrength(newPassword);

        if (!passwordValidation.valid) {
            throw ApiError.validationError('Password does not meet requirements', {
                errors: passwordValidation.errors,
            });
        }

        await authService.resetPassword(token, newPassword);

        res.json({
            success: true,
            message: 'Password has been reset successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (req.user) {
            await authService.logout(req.user.userId);
        }

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};
