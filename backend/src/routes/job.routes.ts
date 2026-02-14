import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as jobController from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/permission.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Careers
 *   description: Job listings and applications
 */

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all job listings
 *     tags: [Careers]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, closed]
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get(
    '/',
    validate([
        query('status').optional().isIn(['draft', 'published', 'closed']),
    ]),
    jobController.getAllJobs
);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Careers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get(
    '/:id',
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    jobController.getJobById
);

/**
 * @swagger
 * /jobs/slug/{slug}:
 *   get:
 *     summary: Get job by slug
 *     tags: [Careers]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get(
    '/slug/:slug',
    validate([param('slug').isString().notEmpty().withMessage('Slug is required')]),
    jobController.getJobBySlug
);

/**
 * @swagger
 * /jobs/{id}/apply:
 *   post:
 *     summary: Submit job application
 *     tags: [Careers]
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
 *               - applicantName
 *               - applicantEmail
 *               - resumeUrl
 *             properties:
 *               applicantName:
 *                 type: string
 *               applicantEmail:
 *                 type: string
 *               resumeUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted
 *       400:
 *         description: Invalid input
 */
router.post(
    '/:id/apply',
    validate([
        param('id').isInt().withMessage('ID must be an integer'),
        body('applicantName').trim().notEmpty().withMessage('Name is required'),
        body('applicantEmail').isEmail().withMessage('Valid email is required'),
        body('resumeUrl').isURL().withMessage('Resume URL must be a valid URL'),
    ]),
    jobController.submitApplication
);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job listing
 *     tags: [Careers]
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
 *               - department
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               department:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/',
    authorize('super-admin', 'editor'),
    validate([
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('department').notEmpty().withMessage('Department is required'),
        body('location').notEmpty().withMessage('Location is required'),
        body('status')
            .optional()
            .isIn(['draft', 'published', 'closed'])
            .withMessage('Invalid status'),
    ]),
    jobController.createJob
);

/**
 * @swagger
 * /jobs/{id}:
 *   put:
 *     summary: Update a job listing
 *     tags: [Careers]
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
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated
 *       404:
 *         description: Job not found
 */
router.put(
    '/:id',
    authorize('super-admin', 'editor'),
    validate([
        param('id').isInt().withMessage('ID must be an integer'),
        body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    ]),
    jobController.updateJob
);

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: Delete a job listing
 *     tags: [Careers]
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
 *         description: Job deleted
 *       404:
 *         description: Job not found
 */
router.delete(
    '/:id',
    authorize('super-admin', 'editor'),
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    jobController.deleteJob
);

/**
 * @swagger
 * /jobs/{id}/applications:
 *   get:
 *     summary: Get applications for a job
 *     tags: [Careers]
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
 *         description: List of applications
 */
router.get(
    '/:id/applications',
    authorize('super-admin', 'editor'),
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    jobController.getJobApplications
);

export default router;
