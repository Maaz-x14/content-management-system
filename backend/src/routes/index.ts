import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import tagRoutes from './tag.routes';
import blogRoutes from './blog.routes';
import serviceRoutes from './service.routes';
import jobRoutes from './job.routes';

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
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/posts', blogRoutes);
router.use('/services', serviceRoutes);
router.use('/jobs', jobRoutes);

export default router;
