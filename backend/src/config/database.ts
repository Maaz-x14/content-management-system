import { Sequelize } from 'sequelize';

// Import the config using the environment-aware logic we built
const env = process.env.NODE_ENV || 'development';
const config = require('./database.config.js')[env];

if (!config.url && !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
}

// Initialize Sequelize using the URL and the specific config block (SSL, Pool, etc.)
export const sequelize = new Sequelize(config.url || process.env.DATABASE_URL, config);

/**
 * Test database connection
 */
export async function testConnection(): Promise<void> {
    try {
        await sequelize.authenticate();
        console.log(`✅ Database connection established successfully in ${env} mode`);
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        // On Vercel, we don't want to throw and kill the whole lambda immediately
        // so the app can at least send a proper error response.
    }
}

/**
 * Sync database models (use only in development)
 */
export async function syncDatabase(force = false): Promise<void> {
    if (process.env.NODE_ENV === 'production') return;
    try {
        await sequelize.sync({ force });
        console.log('✅ Database synchronized successfully');
    } catch (error) {
        console.error('❌ Database synchronization failed:', error);
        throw error;
    }
}