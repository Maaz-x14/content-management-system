import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

// ============================================
// Serverless-Compatible Logger Configuration
// ============================================
// In production (Vercel), only use Console transport
// File system is read-only in serverless environments

const transports: winston.transport[] = [
    new winston.transports.Console({
        format: process.env.NODE_ENV === 'production'
            ? combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json())
            : combine(colorize(), devFormat),
    }),
];

// Only add file transports in non-production environments
if (process.env.NODE_ENV !== 'production') {
    transports.push(
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
        }),
        new winston.transports.File({
            filename: path.join('logs', 'combined.log'),
        })
    );
}

// Create logger instance
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        process.env.NODE_ENV === 'production' ? json() : devFormat
    ),
    transports,
});

// Stream for Morgan HTTP logger
export const morganStream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};
