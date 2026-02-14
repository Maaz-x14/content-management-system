import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

export const authConfig = {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    bcryptRounds: 12,
    passwordResetExpires: 3600000, // 1 hour in milliseconds
};

// Validate that secrets are set in production
if (process.env.NODE_ENV === 'production') {
    if (
        authConfig.jwtSecret === 'fallback-secret-key' ||
        authConfig.refreshTokenSecret === 'fallback-refresh-secret'
    ) {
        throw new Error('JWT secrets must be set in production environment');
    }
}
