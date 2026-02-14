import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as blogController from '../controllers/blog.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/permission.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Blog
 *   description: Blog post management
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all blog posts
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, scheduled]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get(
    '/',
    validate([
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
        query('status')
            .optional()
            .isIn(['draft', 'published', 'scheduled'])
            .withMessage('Invalid status'),
        query('categoryId').optional().isInt().withMessage('Category ID must be an integer'),
    ]),
    blogController.getAllPosts
);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get(
    '/:id',
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    blogController.getPostById
);

/**
 * @swagger
 * /posts/slug/{slug}:
 *   get:
 *     summary: Get post by slug
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get(
    '/slug/:slug',
    validate([param('slug').isString().notEmpty().withMessage('Slug is required')]),
    blogController.getPostBySlug
);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Blog]
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, scheduled]
 *     responses:
 *       201:
 *         description: Post created
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
        body('content').notEmpty().withMessage('Content is required'),
        body('status')
            .optional()
            .isIn(['draft', 'published', 'scheduled'])
            .withMessage('Invalid status'),
        body('categoryId').optional().isInt().withMessage('Category ID must be an integer'),
        body('tags').optional().isArray().withMessage('Tags must be an array of IDs'),
    ]),
    blogController.createPost
);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Blog]
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 *       404:
 *         description: Post not found
 */
router.put(
    '/:id',
    authorize('super-admin', 'editor'),
    validate([
        param('id').isInt().withMessage('ID must be an integer'),
        body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
        body('content').optional().notEmpty().withMessage('Content cannot be empty'),
        body('status')
            .optional()
            .isIn(['draft', 'published', 'scheduled'])
            .withMessage('Invalid status'),
        body('categoryId').optional().isInt().withMessage('Category ID must be an integer'),
    ]),
    blogController.updatePost
);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Blog]
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
 *         description: Post deleted
 *       404:
 *         description: Post not found
 */
router.delete(
    '/:id',
    authorize('super-admin', 'editor'),
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    blogController.deletePost
);

export default router;
