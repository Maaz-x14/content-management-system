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

// Create logger instance
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        process.env.NODE_ENV === 'production' ? json() : devFormat
    ),
    transports: [
        new winston.transports.Console({
            format: combine(colorize(), devFormat),
        }),
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
        }),
        new winston.transports.File({
            filename: path.join('logs', 'combined.log'),
        }),
    ],
});

// Stream for Morgan HTTP logger
export const morganStream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};
