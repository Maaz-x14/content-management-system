// ============================================
// Database Configuration for Sequelize
// ============================================
// IMPORTANT: Only load .env.development locally
// On Vercel, environment variables are injected automatically
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.development' });
}

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
  },
  test: {
    url: process.env.DATABASE_URL_TEST || 'postgresql://postgres:asdf1234@localhost:5433/morphe_cms_test',
    dialect: 'postgres',
    logging: false,
  },
  production: {
    // Use DATABASE_URL from Vercel environment variables
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    // CRITICAL: Supabase requires SSL for external connections
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Required for Supabase SSL certificates
      },
    },
    // Connection pooling optimized for Vercel serverless
    pool: {
      max: 10,        // Maximum connections
      min: 2,         // Minimum connections
      acquire: 30000, // Maximum time (ms) to get connection before throwing error
      idle: 10000,    // Maximum time (ms) connection can be idle before being released
    },
  },
};