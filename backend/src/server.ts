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
// Load environment variables
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
} else {
    dotenv.config(); // Vercel handles the rest
}

// Import models to ensure associations are loaded
import './models';

// Create Express app
const app: Application = express();
app.set('etag', false); // Disable ETag to avoid 304s during development

// ============================================
// Middleware
// ============================================

// Security headers
// 1. Helmet first for security, but we need to be careful with its defaults
app.use(helmet());

// 2. CORS - Must be before routes and most other middleware
const allowedOrigin = process.env.CORS_ORIGIN;

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);
            
            // In production, strictly match the Vercel var
            // In dev, allow localhost
            if (origin === allowedOrigin || origin === 'http://localhost:5173') {
                callback(null, true);
            } else {
                console.error(`CORS Blocked: Origin ${origin} does not match ${allowedOrigin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
);

// ============================================
// Routes
// ============================================

// Swagger UI
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Serve Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve static files from uploads directory
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Morphe Labs CMS API',
        version: '1.0.0',
        documentation: '/api/v1/health',
    });
});

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// Server Initialization
// ============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Start server
        app.listen(PORT, () => {
            logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
            logger.info(`🌐 Server listening on port ${PORT}`);
            logger.info(`📡 API available at http://localhost:${PORT}/api/v1`);
            logger.info(`🏥 Health check at http://localhost:${PORT}/api/v1/health`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    logger.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

// Start the server
startServer();

export default app;
