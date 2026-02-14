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
 * @swagger
 * /users/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 */
router.get('/roles', userController.getRoles);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: roleId
 *         schema:
 *           type: integer
 *         description: Filter by role ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden (Super Admin only)
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
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *               - roleId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               fullName:
 *                 type: string
 *               roleId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Forbidden (Super Admin only)
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
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get(
    '/:id',
    authorize('super-admin'),
    validate([param('id').isInt().withMessage('User ID must be an integer')]),
    userController.getUser
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               fullName:
 *                 type: string
 *               roleId:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
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
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete(
    '/:id',
    authorize('super-admin'),
    validate([param('id').isInt().withMessage('User ID must be an integer')]),
    userController.deleteUser
);

export default router;
