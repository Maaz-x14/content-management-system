import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import * as emailService from '../services/email.service';
import { validatePasswordStrength } from '../utils/encryption';
import { ApiError } from '../utils/ApiError';

/**
 * GET /api/v1/users
 * Get all users with filters and pagination
 */
export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { search, roleId, isActive, page, limit } = req.query;

        const filters = {
            search: search as string,
            roleId: roleId ? parseInt(roleId as string) : undefined,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        };

        const pagination = {
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10,
        };

        const result = await userService.getAllUsers(filters, pagination);

        res.json({
            success: true,
            data: result.users,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(parseInt(id));

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/users
 * Create new user
 */
export const createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password, fullName, roleId } = req.body;

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);

        if (!passwordValidation.valid) {
            throw ApiError.validationError('Password does not meet requirements', {
                errors: passwordValidation.errors,
            });
        }

        const user = await userService.createUser({
            email,
            password,
            fullName,
            roleId: parseInt(roleId),
        });

        // Send welcome email
        try {
            await emailService.sendWelcomeEmail(email, fullName);
        } catch (emailError) {
            // Log error but don't fail the request
            console.error('Failed to send welcome email:', emailError);
        }

        res.status(201).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/v1/users/:id
 * Update user
 */
export const updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const { email, fullName, roleId, isActive } = req.body;

        const user = await userService.updateUser(parseInt(id), {
            email,
            fullName,
            roleId: roleId ? parseInt(roleId) : undefined,
            isActive,
        });

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/users/:id
 * Delete user (soft delete)
 */
export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (req.user && req.user.userId === parseInt(id)) {
            throw ApiError.badRequest('You cannot delete your own account');
        }

        await userService.deleteUser(parseInt(id));

        res.json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/users/roles
 * Get all roles
 */
export const getRoles = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const roles = await userService.getAllRoles();

        res.json({
            success: true,
            data: roles,
        });
    } catch (error) {
        next(error);
    }
};
