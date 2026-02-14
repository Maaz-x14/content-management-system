import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const databaseUrl = process.env.DATABASE_URL || '';

if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not defined');
}

export const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000,
    },
    define: {
        timestamps: true,
        underscored: true,
    },
});

/**
 * Test database connection
 */
export async function testConnection(): Promise<void> {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        throw error;
    }
}

/**
 * Sync database models (use only in development)
 */
export async function syncDatabase(force = false): Promise<void> {
    try {
        await sequelize.sync({ force });
        console.log('✅ Database synchronized successfully');
    } catch (error) {
        console.error('❌ Database synchronization failed:', error);
        throw error;
    }
}
