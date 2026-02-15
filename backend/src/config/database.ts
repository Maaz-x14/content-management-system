import { Sequelize } from 'sequelize';

// ============================================
// Database Configuration & Initialization
// ============================================
// Determine environment (defaults to 'development' if not set)
const env = process.env.NODE_ENV || 'development';

// Load the appropriate config block from database.config.js
const config = require('./database.config.js')[env];

// Validate DATABASE_URL exists
if (!config.url && !process.env.DATABASE_URL) {
    const errorMsg = '❌ FATAL: DATABASE_URL environment variable is not defined';
    console.error(errorMsg);

    // In production (Vercel), log but don't throw to allow graceful error responses
    if (process.env.NODE_ENV === 'production') {
        console.error('⚠️  Server will start but database operations will fail');
    } else {
        // In development, throw immediately to catch config issues early
        throw new Error(errorMsg);
    }
}

// Initialize Sequelize with the environment-specific configuration
// This includes SSL settings for production (Supabase) and pooling options
export const sequelize = new Sequelize(
    config.url || process.env.DATABASE_URL,
    {
        ...config,
        // Ensure we're using the correct dialect
        dialect: 'postgres',
        // CRITICAL FOR VERCEL: Explicitly pass the dialect module
        dialectModule: require('pg'),
        // Disable logging in production for cleaner Vercel logs
        logging: env === 'production' ? false : console.log,
    }
);

/**
 * Test database connection
 * Safe for serverless - logs errors instead of throwing
 */
export async function testConnection(): Promise<void> {
    try {
        await sequelize.authenticate();
        console.log(`✅ Database connection established successfully in ${env} mode`);

        // Log connection details (without sensitive info)
        if (env !== 'production') {
            console.log(`📊 Database: ${sequelize.getDatabaseName()}`);
        }
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);

        // In production, log detailed error but don't crash the serverless function
        // This allows the app to send proper error responses with CORS headers
        if (process.env.NODE_ENV === 'production') {
            console.error('⚠️  Database connection failed. Check:');
            console.error('   1. DATABASE_URL is set in Vercel environment variables');
            console.error('   2. Using Transaction Pooler URL (port 6543)');
            console.error('   3. SSL is enabled in the connection string');
        }
    }
}

/**
 * Sync database models (use only in development)
 * NEVER runs in production to prevent accidental schema changes
 */
export async function syncDatabase(force = false): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
        console.log('⏭️  Skipping database sync in production mode');
        return;
    }

    try {
        await sequelize.sync({ force });
        console.log('✅ Database synchronized successfully');
    } catch (error) {
        console.error('❌ Database synchronization failed:', error);
        throw error;
    }
}