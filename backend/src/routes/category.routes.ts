import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as categoryController from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/permission.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: asTree
 *         schema:
 *           type: boolean
 *         description: Return categories as a tree structure
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get(
    '/',
    validate([
        query('asTree').optional().isBoolean().withMessage('asTree must be a boolean'),
    ]),
    categoryController.getAllCategories
);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get(
    '/:id',
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    categoryController.getCategoryById
);

/**
 * @swagger
 * /categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get(
    '/slug/:slug',
    validate([param('slug').isString().notEmpty().withMessage('Slug is required')]),
    categoryController.getCategoryBySlug
);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentId:
 *                 type: integer
 *               displayOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    '/',
    authorize('super-admin', 'editor'),
    validate([
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('description').optional().isString(),
        body('parentId').optional().isInt().withMessage('Parent ID must be an integer'),
        body('displayOrder').optional().isInt().withMessage('Display order must be an integer'),
    ]),
    categoryController.createCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentId:
 *                 type: integer
 *               displayOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 */
router.patch(
    '/:id',
    authorize('super-admin', 'editor'),
    validate([
        param('id').isInt().withMessage('ID must be an integer'),
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
        body('parentId').optional().isInt().withMessage('Parent ID must be an integer'),
        body('displayOrder').optional().isInt().withMessage('Display order must be an integer'),
    ]),
    categoryController.updateCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 */
router.delete(
    '/:id',
    authorize('super-admin', 'editor'),
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    categoryController.deleteCategory
);

export default router;
