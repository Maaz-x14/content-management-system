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

// ============================================
// 1. SPECIFIC PROTECTED ROUTES (Must be above /:id)
// ============================================

router.get(
    '/all/applications',
    authenticate,
    authorize('super-admin', 'editor'),
    jobController.getAllApplications
);

router.patch(
    '/applications/:applicationId/status',
    authenticate,
    authorize('super-admin', 'editor'),
    validate([
        param('applicationId').isInt().withMessage('Application ID must be an integer'),
        body('status').notEmpty().withMessage('Status is required'),
    ]),
    jobController.updateApplicationStatus
);

// ============================================
// 2. SPECIFIC PUBLIC ROUTES (Must be above /:id)
// ============================================

router.get(
    '/slug/:slug',
    validate([param('slug').isString().notEmpty().withMessage('Slug is required')]),
    jobController.getJobBySlug
);

// ============================================
// 3. GENERIC PUBLIC ROUTES
// ============================================

router.get(
    '/',
    validate([
        query('status').optional().isIn(['draft', 'active', 'closed']),
    ]),
    jobController.getAllJobs
);

router.get(
    '/:id',
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    jobController.getJobById
);

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

// ============================================
// 4. PROTECTED ADMIN ROUTES (Job Management)
// ============================================
router.use(authenticate);

router.post(
    '/',
    authorize('super-admin', 'editor'),
    validate([
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('department').notEmpty().withMessage('Department is required'),
        body('location_city').optional().trim(),
        body('location_type')
            .notEmpty()
            .isIn(['onsite', 'remote', 'hybrid'])
            .withMessage('Invalid location type'),
        body('employment_type')
            .notEmpty()
            .isIn(['full-time', 'part-time', 'contract', 'internship'])
            .withMessage('Invalid employment type'),
        body('status')
            .optional()
            .isIn(['draft', 'active', 'closed'])
            .withMessage('Invalid status'),
    ]),
    jobController.createJob
);

router.put(
    '/:id',
    authorize('super-admin', 'editor'),
    validate([
        param('id').isInt().withMessage('ID must be an integer'),
        body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    ]),
    jobController.updateJob
);

router.get(
    '/:id/applications',
    authorize('super-admin', 'editor'),
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    jobController.getJobApplications
);

router.delete(
    '/:id',
    authorize('super-admin', 'editor'),
    validate([param('id').isInt().withMessage('ID must be an integer')]),
    jobController.deleteJob
);

export default router;
