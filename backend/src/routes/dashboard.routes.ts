import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/permission.middleware';

const router = Router();

// Protect all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics and activity
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                 breakdown:
 *                   type: object
 *                 recentActivity:
 *                   type: object
 */
router.get(
    '/stats',
    authorize('super_admin', 'super-admin', 'editor', 'author', 'viewer'),
    dashboardController.getDashboardStats
);

router.get(
    '/search',
    authorize('super_admin', 'super-admin', 'editor', 'author'),
    dashboardController.search
);

export default router;
