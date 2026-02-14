import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Morphe CMS API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
