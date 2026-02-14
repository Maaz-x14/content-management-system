import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/encryption';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/User.model';
import { Role } from '../models/Role.model';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                email: string;
                role: string;
                roleId: number;
            };
        }
    }
}

/**
 * Middleware to authenticate requests using JWT
 * Verifies the access token and attaches user info to request
 */
export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('No authentication token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = verifyAccessToken(token);

        // Check if user still exists and is active
        const user = await User.findByPk(decoded.userId, {
            include: [{ model: Role, as: 'role' }],
        });

        if (!user) {
            throw ApiError.unauthorized('User not found');
        }

        if (!user.is_active) {
            throw ApiError.unauthorized('User account is deactivated');
        }

        // Attach user info to request
        req.user = {
            userId: user.id,
            email: user.email,
            role: decoded.role,
            roleId: user.role_id,
        };

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Used for endpoints that work for both authenticated and unauthenticated users
 */
export const optionalAuthenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyAccessToken(token);

            const user = await User.findByPk(decoded.userId, {
                include: [{ model: Role, as: 'role' }],
            });

            if (user && user.is_active) {
                req.user = {
                    userId: user.id,
                    email: user.email,
                    role: decoded.role,
                    roleId: user.role_id,
                };
            }
        }

        next();
    } catch (error) {
        // Don't fail on optional auth - just continue without user
        next();
    }
};
