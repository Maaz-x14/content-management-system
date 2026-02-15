// ============================================
// VERCEL SERVERLESS CONFIGURATION
// ============================================
// CRITICAL: Environment variables MUST be loaded BEFORE any imports
// that depend on them (database config, models, etc.)

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// ============================================
// 1. ENVIRONMENT SETUP (MUST BE FIRST)
// ============================================
// Only load .env.development locally
// On Vercel, environment variables are injected automatically
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
    console.log('📁 Loaded .env.development for local development');
}

// ============================================
// 2. INITIALIZE EXPRESS APP
// ============================================
const app: Application = express();

// Disable ETag to prevent 304 caching issues
app.set('etag', false);

// ============================================
// 3. CORS MIDDLEWARE (MUST BE ABSOLUTE FIRST)
// ============================================
// CRITICAL: CORS must run before ANY other middleware to handle
// preflight OPTIONS requests and prevent CORS errors
app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                process.env.CORS_ORIGIN,
                'https://content-management-system-udo3.vercel.app',
                'http://localhost:5173',
            ].filter(Boolean); // Remove undefined values

            // Allow requests with no origin (mobile apps, Postman, curl)
            if (!origin) {
                return callback(null, true);
            }

            // Normalize URLs by removing trailing slashes
            const normalizedOrigin = origin.replace(/\/$/, '');
            const isAllowed = allowedOrigins.some(
                allowed => normalizedOrigin === allowed?.replace(/\/$/, '')
            );

            if (isAllowed) {
                callback(null, true);
            } else {
                console.error(`🚫 CORS Blocked: ${origin}`);
                console.error(`   Allowed origins: ${allowedOrigins.join(', ')}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
);

// ============================================
// 4. SECURITY & PARSING MIDDLEWARE
// ============================================
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================
// 5. LOGGING MIDDLEWARE
// ============================================
// Import logger utilities after environment is set up
import { logger, morganStream } from './utils/logger';
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: morganStream }));

// ============================================
// 6. IMPORT DATABASE & MODELS
// ============================================
// IMPORTANT: Import AFTER environment is loaded to prevent crashes
import { testConnection } from './config/database';
import './models'; // This initializes all Sequelize models

// ============================================
// 7. ROUTES
// ============================================
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import routes from './routes';

// Health check endpoint
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
// 8. ERROR HANDLING (MUST BE LAST)
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// 9. SERVER INITIALIZATION
// ============================================
// VERCEL: Export app immediately, don't call app.listen()
// LOCAL: Start server with app.listen()

if (process.env.NODE_ENV !== 'production') {
    // LOCAL DEVELOPMENT MODE
    const PORT = process.env.PORT || 5000;

    testConnection()
        .then(() => {
            app.listen(PORT, () => {
                logger.info(`🚀 Server running on port ${PORT}`);
                logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
                logger.info(`🌐 CORS Origin: ${process.env.CORS_ORIGIN}`);
            });
        })
        .catch((error) => {
            logger.error('❌ Failed to start server:', error);
            process.exit(1);
        });
} else {
    // PRODUCTION MODE (VERCEL SERVERLESS)
    // Don't call app.listen() - Vercel handles this
    // Test connection asynchronously without blocking export
    testConnection()
        .then(() => logger.info('✅ Production database connection established'))
        .catch((error) => {
            logger.error('❌ Production database connection failed:', error);
            logger.error('⚠️  Server will continue but database operations may fail');
        });

    logger.info('🚀 Vercel serverless function initialized');
}

// ============================================
// EXPORT FOR VERCEL
// ============================================
// This is the entry point for Vercel serverless functions
export default app;