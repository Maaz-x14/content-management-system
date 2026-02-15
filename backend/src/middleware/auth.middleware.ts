import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/encryption';
import { ApiError } from '../utils/ApiError';
import { User, Role } from '../models';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                userId: number;
                email: string;
                role: string;
                roleId: number;
            };
        }
    }
}

// Add AuthenticatedRequest type for use in controllers
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        userId: number;
        email: string;
        role: string;
        roleId: number;
    };
    file?: Express.Multer.File; // Multer adds file property
    files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] }; // Multer add files property
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
            return next(ApiError.unauthorized('No authentication token provided'));
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            // Verify token
            const decoded = verifyAccessToken(token);

            // Check if user still exists and is active
            const user = await User.findByPk(decoded.userId, {
                include: [{ model: Role, as: 'role' }],
            });

            if (!user) {
                return next(ApiError.unauthorized('User not found'));
            }

            if (!user.is_active) {
                return next(ApiError.unauthorized('User account is deactivated'));
            }

            // Attach user info to request
            req.user = {
                id: user.id, // Add id alias for convenience
                userId: user.id,
                email: user.email,
                role: decoded.role,
                roleId: user.role_id,
            };

            next();
        } catch (error) {
            return next(ApiError.unauthorized('Invalid token'));
        }
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
            try {
                const token = authHeader.substring(7);
                const decoded = verifyAccessToken(token);

                const user = await User.findByPk(decoded.userId, {
                    include: [{ model: Role, as: 'role' }],
                });

                if (user && user.is_active) {
                    req.user = {
                        id: user.id, // Add id alias for convenience
                        userId: user.id,
                        email: user.email,
                        role: decoded.role,
                        roleId: user.role_id,
                    };
                }
            } catch (error) {
                // Ignore invalid token for optional auth
            }
        }

        next();
    } catch (error) {
        // Don't fail on optional auth - just continue without user
        next();
    }
};
