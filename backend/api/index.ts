// ============================================
// Vercel Serverless Function Entry Point
// ============================================
// CRITICAL: Initialize database and models BEFORE importing routes

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables (Vercel injects them, but this is safe)
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
}

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
// INITIALIZE DATABASE & MODELS
// ============================================
// Import database connection (this initializes Sequelize)
import { testConnection } from '../src/config/database';

// Import models to register them with Sequelize
// This MUST happen after database config is loaded
import '../src/models';

// Test database connection asynchronously (don't block)
testConnection()
    .then(() => console.log('✅ Database connected'))
    .catch((err) => console.error('❌ Database connection failed:', err));

// ============================================
// ROUTES
// ============================================
import routes from '../src/routes';
import { errorHandler, notFoundHandler } from '../src/middleware/error.middleware';

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        status: 'Online',
        message: 'Morphe Labs CMS API',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/v1', routes);

// ============================================
// ERROR HANDLING
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
