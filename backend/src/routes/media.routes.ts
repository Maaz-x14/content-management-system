import { Router } from 'express';

import { upload } from '../middleware/upload.middleware';
import * as mediaController from '../controllers/media.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/permission.middleware';
import { validate } from '../middleware/validate.middleware';
import { query, body, param } from 'express-validator';

const router = Router();

// Protect all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Media file management
 */

/**
 * @swagger
 * /media/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               altText:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or no file uploaded
 */
router.post(
    '/upload',
    authorize('super-admin', 'editor', 'author'),
    upload.single('file'),
    mediaController.uploadFile
);

/**
 * @swagger
 * /media:
 *   get:
 *     summary: Get all media files
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [image, video, document, other]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of media files
 */
router.get(
    '/',
    authorize('super-admin', 'editor', 'author'),
    validate([
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1 }),
        query('type').optional().isIn(['image', 'video', 'document', 'other']),
    ]),
    mediaController.getMediaFiles
);

/**
 * @swagger
 * /media/{id}:
 *   get:
 *     summary: Get media by ID
 *     tags: [Media]
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
 *         description: Media details
 *       404:
 *         description: Not found
 */
router.get(
    '/:id',
    authorize('super-admin', 'editor', 'author'),
    validate([param('id').isInt()]),
    mediaController.getMediaById
);

/**
 * @swagger
 * /media/{id}:
 *   put:
 *     summary: Update media details (alt text)
 *     tags: [Media]
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
 *               altText:
 *                 type: string
 *     responses:
 *       200:
 *         description: Media updated
 *       404:
 *         description: Not found
 */
router.put(
    '/:id',
    authorize('super-admin', 'editor', 'author'),
    validate([
        param('id').isInt(),
        body('altText').optional().isString(),
    ]),
    mediaController.updateMedia
);

/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     summary: Delete media file
 *     tags: [Media]
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
 *         description: Media deleted
 *       404:
 *         description: Not found
 */
router.delete(
    '/:id',
    authorize('super-admin', 'editor'),
    validate([param('id').isInt()]),
    mediaController.deleteMedia
);

export default router;
