import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

/**
 * Global error handler middleware
 * Catches all errors and returns consistent error responses
 */
export const errorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Log error
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Handle ApiError (our custom errors)
    if (err instanceof ApiError || (err as any).isApiError) {
        return res.status((err as any).statusCode || 500).json({
            success: false,
            error: {
                code: (err as any).code || 'API_ERROR',
                message: err.message,
                details: (err as any).details,
            },
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token',
            },
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_EXPIRED',
                message: 'Authentication token has expired',
            },
        });
    }

    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        return res.status(422).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: (err as any).errors?.map((e: any) => ({
                    field: e.path,
                    message: e.message,
                })),
            },
        });
    }

    // Handle Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            success: false,
            error: {
                code: 'DUPLICATE_ENTRY',
                message: 'A record with this value already exists',
                details: (err as any).errors?.map((e: any) => ({
                    field: e.path,
                    message: e.message,
                })),
            },
        });
    }

    // Handle Sequelize foreign key constraint errors
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_REFERENCE',
                message: 'Referenced record does not exist',
            },
        });
    }

    // Handle unexpected errors
    const statusCode = (err as any).statusCode || 500;
    const message =
        process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message || 'Internal server error';

    return res.status(statusCode).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
    });
};
