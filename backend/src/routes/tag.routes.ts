import { Router } from 'express';
import { body, param } from 'express-validator';
import * as tagController from '../controllers/tag.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/permission.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Tag management
 */

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of tags
 */
router.get('/', tagController.getAllTags);

/**
 * @swagger
 * /tags/{id}:
 *   get:
 *     summary: Get tag by ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag details
 *       404:
 *         description: Tag not found
 */
router.get(
    '/:id',
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    tagController.getTagById
);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
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
 *     responses:
 *       201:
 *         description: Tag created
 *       400:
 *         description: Invalid input or duplicate tag
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    '/',
    authorize('super-admin', 'editor'),
    validate([body('name').trim().notEmpty().withMessage('Tag name is required')]),
    tagController.createTag
);

/**
 * @swagger
 * /tags/{id}:
 *   put:
 *     summary: Update a tag
 *     tags: [Tags]
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag updated
 *       404:
 *         description: Tag not found
 */
router.put(
    '/:id',
    authorize('super-admin', 'editor'),
    validate([
        param('id').isInt().withMessage('ID must be an integer'),
        body('name').trim().notEmpty().withMessage('Tag name is required'),
    ]),
    tagController.updateTag
);

/**
 * @swagger
 * /tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [Tags]
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
 *         description: Tag deleted
 *       404:
 *         description: Tag not found
 */
router.delete(
    '/:id',
    authorize('super-admin', 'editor'),
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    tagController.deleteTag
);

export default router;
