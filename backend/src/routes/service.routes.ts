import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as serviceController from '../controllers/service.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/permission.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Portfolio/Service management
 */

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of services
 */
router.get(
    '/',
    validate([
        query('status').optional().isIn(['draft', 'published']),
        query('isFeatured').optional().isBoolean(),
    ]),
    serviceController.getAllServices
);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service details
 *       404:
 *         description: Service not found
 */
router.get(
    '/:id',
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    serviceController.getServiceById
);

/**
 * @swagger
 * /services/slug/{slug}:
 *   get:
 *     summary: Get service by slug
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service details
 *       404:
 *         description: Service not found
 */
router.get(
    '/slug/:slug',
    validate([param('slug').isString().notEmpty().withMessage('Slug is required')]),
    serviceController.getServiceBySlug
);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       201:
 *         description: Service created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/',
    authorize('super-admin', 'editor'),
    validate([
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('status')
            .optional()
            .isIn(['draft', 'published'])
            .withMessage('Invalid status'),
        body('images').optional().isArray(),
    ]),
    serviceController.createService
);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update a service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service updated
 *       404:
 *         description: Service not found
 */
router.put(
    '/:id',
    authorize('super-admin', 'editor'),
    validate([
        param('id').isInt().withMessage('ID must be an integer'),
        body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
        body('status')
            .optional()
            .isIn(['draft', 'published'])
            .withMessage('Invalid status'),
    ]),
    serviceController.updateService
);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
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
 *         description: Service deleted
 *       404:
 *         description: Service not found
 */
router.delete(
    '/:id',
    authorize('super-admin', 'editor'),
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    serviceController.deleteService
);

export default router;
