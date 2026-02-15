// ============================================
// Vercel Serverless Function Entry Point
// ============================================
// Gradually adding back functionality to find the crash

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

const app = express();

// Disable ETag
app.set('etag', false);

// ============================================
// CORS FIRST
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
// ROUTES - Import dynamically to catch errors
// ============================================

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        status: 'Online',
        message: 'Morphe Labs CMS API',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        database: 'Not connected (testing mode)'
    });
});

// Try to import and use routes, but catch any errors
try {
    const routes = require('../src/routes').default;
    app.use('/api/v1', routes);
    console.log('✅ Routes loaded successfully');
} catch (error) {
    console.error('❌ Failed to load routes:', error);
    app.use('/api/v1', (req, res) => {
        res.status(503).json({
            success: false,
            message: 'API routes temporarily unavailable',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
    });
}

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
