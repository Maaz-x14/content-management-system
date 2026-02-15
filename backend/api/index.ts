// ============================================
// Vercel Serverless Function Entry Point
// ============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

const app = express();

// Disable ETag
app.set('etag', false);

// ============================================
// CORS FIRST (CRITICAL)
// ============================================
app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                process.env.CORS_ORIGIN,
                'https://content-management-system-udo3.vercel.app',
                'http://localhost:5173',
            ].filter(Boolean);

            if (!origin) {
                return callback(null, true);
            }

            const normalizedOrigin = origin.replace(/\/$/, '');
            const isAllowed = allowedOrigins.some(
                allowed => normalizedOrigin === allowed?.replace(/\/$/, '')
            );

            if (isAllowed) {
                callback(null, true);
            } else {
                console.error(`🚫 CORS Blocked: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
);

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================
// DEBUG ENDPOINT (TEMPORARY)
// ============================================
app.get('/api/v1/debug/db-check', async (req, res) => {
    try {
        const { User, Role } = await import('../src/models');
        const userCount = await User.count();
        const roleCount = await Role.count();
        const adminUser = await User.findOne({
            where: { email: 'admin@morphelabs.com' },
            attributes: ['id', 'email', 'full_name', 'is_active', 'role_id']
        });

        res.json({
            success: true,
            stats: { userCount, roleCount },
            admin: adminUser ? {
                id: adminUser.id,
                email: adminUser.email,
                isActive: adminUser.is_active,
                hasRole: !!adminUser.role_id
            } : null,
            env: {
                nodeEnv: process.env.NODE_ENV,
                hasDbUrl: !!process.env.DATABASE_URL
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
    res.json({
        success: true,
        status: 'Online',
        message: 'Morphe Labs CMS API',
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// LAZY-LOAD ROUTES
// ============================================
// This prevents the serverless function from crashing if models fail to load
// Routes are only loaded when actually accessed
app.use('/api/v1', async (req, res, next) => {
    try {
        const routes = await import('../src/routes');
        const router = routes.default;
        router(req, res, next);
    } catch (error: any) {
        console.error('CRITICAL: Failed to load routes:', error);
        res.status(503).json({
            success: false,
            message: 'Service temporarily unavailable',
            error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
        });
    }
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

export default app;
