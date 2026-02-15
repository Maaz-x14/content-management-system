import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { logger, morganStream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiRateLimiter } from './middleware/rateLimit.middleware';
import routes from './routes';

// Load environment variables
// Vercel injects env vars automatically; only load file for local dev
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
}

// Import models to ensure associations are loaded
import './models';

const app: Application = express();
app.set('etag', false);

// ============================================
// Middleware
// ============================================

// 1. CORS - MUST come before routes and helmet for preflight success
app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigin = process.env.CORS_ORIGIN;
            
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);
            
            // Clean strings to prevent trailing slash mismatches
            const cleanOrigin = origin.replace(/\/$/, "");
            const cleanAllowed = allowedOrigin?.replace(/\/$/, "");

            if (
                cleanOrigin === cleanAllowed || 
                origin === 'http://localhost:5173' || 
                process.env.NODE_ENV !== 'production'
            ) {
                callback(null, true);
            } else {
                console.error(`CORS Blocked: ${origin} vs Expected: ${allowedOrigin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
);

// 2. Security & Parsing
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 3. Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev', { stream: morganStream }));
} else {
    app.use(morgan('combined', { stream: morganStream }));
}

// 4. Rate limiting (Applied to API routes)
app.use('/api', apiRateLimiter);

// ============================================
// Routes
// ============================================

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import path from 'path';

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/v1', routes);

app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Morphe Labs CMS API',
        version: '1.0.0',
        env: process.env.NODE_ENV
    });
});

// ============================================
// Error Handling
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Server Initialization
// ============================================

const PORT = process.env.PORT || 5000;

// FOR VERCEL: We must export the app and NOT block on app.listen in production
if (process.env.NODE_ENV !== 'production') {
    testConnection().then(() => {
        app.listen(PORT, () => {
            logger.info(`🚀 Local server running on port ${PORT}`);
        });
    }).catch(err => {
        logger.error('Failed to connect to DB locally:', err);
        process.exit(1);
    });
} else {
    // In Vercel, we just verify connection. The lambda handles the execution.
    testConnection()
        .then(() => logger.info('Database connected successfully in production'))
        .catch((err) => logger.error('Production DB Connection Error:', err));
}

export default app;