import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { Role } from '../models/Role.model';

/**
 * Middleware to check if user has required role(s)
 * @param allowedRoles - Array of role slugs that are allowed
 */
export const authorize = (...allowedRoles: string[]) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                throw ApiError.unauthorized('Authentication required');
            }

            // Check if user's role is in allowed roles
            if (!allowedRoles.includes(req.user.role)) {
                throw ApiError.forbidden('You do not have permission to perform this action');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware to check if user has specific permission
 * @param module - Module name (e.g., 'blog', 'users')
 * @param action - Action name (e.g., 'create', 'update', 'delete')
 */
export const checkPermission = (module: string, action: string) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                throw ApiError.unauthorized('Authentication required');
            }

            // Get user's role with permissions
            const role = await Role.findByPk(req.user.roleId);

            if (!role) {
                throw ApiError.forbidden('Invalid role');
            }

            // Check if role has the required permission
            const permissions = role.permissions as any;
            const hasPermission = permissions?.[module]?.[action] === true;

            if (!hasPermission) {
                throw ApiError.forbidden(
                    `You do not have permission to ${action} ${module}`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware to check if user is the owner of a resource or has admin role
 * @param getUserIdFromResource - Function to extract user ID from the resource
 */
export const checkOwnership = (
    getUserIdFromResource: (req: Request) => Promise<number | null>
) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                throw ApiError.unauthorized('Authentication required');
            }

            // Super admins can access everything
            if (req.user.role === 'super-admin') {
                return next();
            }

            // Get the resource owner's user ID
            const resourceUserId = await getUserIdFromResource(req);

            if (resourceUserId === null) {
                throw ApiError.notFound('Resource not found');
            }

            // Check if user is the owner
            if (req.user.userId !== resourceUserId) {
                throw ApiError.forbidden('You can only access your own resources');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
