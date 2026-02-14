import { User } from '../models/User.model';
import { Role } from '../models/Role.model';
import { ApiError } from '../utils/ApiError';
import {
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    generateResetToken,
    verifyRefreshToken,
} from '../utils/encryption';
import { authConfig } from '../config/auth';

interface LoginResult {
    user: {
        id: number;
        email: string;
        fullName: string;
        role: string;
    };
    accessToken: string;
    refreshToken: string;
}

/**
 * Authenticate user with email and password
 */
export const login = async (email: string, password: string): Promise<LoginResult> => {
    // Find user with role
    const user = await User.findOne({
        where: { email },
        include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
        throw ApiError.unauthorized('Your account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate tokens
    const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role?.slug || 'viewer',
    });

    const refreshToken = generateRefreshToken({
        userId: user.id,
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role?.slug || 'viewer',
        },
        accessToken,
        refreshToken,
    };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Get user with role
        const user = await User.findByPk(decoded.userId, {
            include: [{ model: Role, as: 'role' }],
        });

        if (!user) {
            throw ApiError.unauthorized('User not found');
        }

        if (!user.is_active) {
            throw ApiError.unauthorized('User account is deactivated');
        }

        // Generate new access token
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role?.slug || 'viewer',
        });

        return { accessToken };
    } catch (error) {
        throw ApiError.unauthorized('Invalid refresh token');
    }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (userId: number) => {
    const user = await User.findByPk(userId, {
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password_hash', 'password_reset_token', 'password_reset_expires'] },
    });

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: {
            id: user.role?.id,
            name: user.role?.name,
            slug: user.role?.slug,
        },
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
    };
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<string> => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        // Don't reveal if user exists or not for security
        return 'If an account with that email exists, a password reset link has been sent.';
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + authConfig.passwordResetExpires);

    // Save reset token to user
    await user.update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires,
    });

    return resetToken;
};

/**
 * Reset password using reset token
 */
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    const user = await User.findOne({
        where: {
            password_reset_token: token,
        },
    });

    if (!user) {
        throw ApiError.badRequest('Invalid or expired reset token');
    }

    // Check if token is expired
    if (!user.password_reset_expires || user.password_reset_expires < new Date()) {
        throw ApiError.badRequest('Reset token has expired');
    }

    // Import hashPassword here to avoid circular dependency
    const { hashPassword } = await import('../utils/encryption');

    // Update password and clear reset token
    await user.update({
        password_hash: await hashPassword(newPassword),
        password_reset_token: null,
        password_reset_expires: null,
    });
};

/**
 * Logout user (client-side token removal)
 * This is mainly for logging purposes
 */
export const logout = async (userId: number): Promise<void> => {
    // In a stateless JWT system, logout is handled client-side
    // This function can be used for logging or token blacklisting if needed
    const user = await User.findByPk(userId);

    if (user) {
        // You could implement token blacklisting here if needed
        // For now, just log the logout event
        console.log(`User ${user.email} logged out`);
    }
};
