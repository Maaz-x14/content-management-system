import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/permission.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users/roles
 * @desc    Get all roles
 * @access  Private (All authenticated users)
 */
router.get('/roles', userController.getRoles);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private (Super Admin only)
 */
router.get(
    '/',
    authorize('super-admin'),
    validate([
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
        query('roleId').optional().isInt().withMessage('Role ID must be an integer'),
        query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    ]),
    userController.getAllUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Super Admin only)
 */
router.get(
    '/:id',
    authorize('super-admin'),
    validate([param('id').isInt().withMessage('User ID must be an integer')]),
    userController.getUser
);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user
 * @access  Private (Super Admin only)
 */
router.post(
    '/',
    authorize('super-admin'),
    validate([
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
        body('fullName').trim().notEmpty().withMessage('Full name is required'),
        body('roleId').isInt().withMessage('Role ID must be an integer'),
    ]),
    userController.createUser
);

/**
 * @route   PATCH /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Super Admin only)
 */
router.patch(
    '/:id',
    authorize('super-admin'),
    validate([
        param('id').isInt().withMessage('User ID must be an integer'),
        body('email').optional().isEmail().withMessage('Please provide a valid email'),
        body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
        body('roleId').optional().isInt().withMessage('Role ID must be an integer'),
        body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    ]),
    userController.updateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private (Super Admin only)
 */
router.delete(
    '/:id',
    authorize('super-admin'),
    validate([param('id').isInt().withMessage('User ID must be an integer')]),
    userController.deleteUser
);

export default router;
