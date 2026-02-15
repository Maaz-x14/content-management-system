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

// 1. Load Env Vars IMMEDIATELY
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
}

// 2. Import models AFTER env is loaded to prevent config crashes
import './models';

const app: Application = express();

// Disable ETag to prevent 304 caching issues during debugging
app.set('etag', false);

// ============================================
// Middleware Sequence (Order is Critical)
// ============================================

// A. CORS MUST BE FIRST
app.use(
    cors({
        origin: (origin, callback) => {
            const allowed = process.env.CORS_ORIGIN;
            // Allow no-origin requests (like Postman) or explicit matches
            if (!origin || origin.replace(/\/$/, "") === allowed?.replace(/\/$/, "") || origin === 'http://localhost:5173') {
                callback(null, true);
            } else {
                console.error(`CORS Blocked: ${origin} against ${allowed}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
);

// B. Security Headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Required for frontend image access
}));

// C. Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// D. Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: morganStream }));

// ============================================
// Routes
// ============================================

app.use('/api/v1', routes);

app.get('/', (req, res) => {
    res.json({ success: true, status: 'Online', message: 'Morphe Labs API' });
});

// ============================================
// Error Handling
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Vercel Serverless Initialization
// ============================================
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    testConnection().then(() => {
        app.listen(PORT, () => logger.info(`🚀 Local Server: ${PORT}`));
    });
} else {
    // In Vercel, we don't block the export with 'await'. 
    // We let the function spin up and log the connection status.
    testConnection()
        .then(() => logger.info('Production DB Connected'))
        .catch(err => logger.error('Production DB Error:', err));
}

export default app;