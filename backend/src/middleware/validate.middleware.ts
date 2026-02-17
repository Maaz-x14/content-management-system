import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiError } from '../utils/ApiError';

/**
 * Middleware to validate request using express-validator
 * @param validations - Array of validation chains
 */
export const validate = (validations: ValidationChain[]) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        // Run all validations
        await Promise.all(validations.map((validation) => validation.run(req)));

        // Check for validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map((error) => ({
                field: error.type === 'field' ? (error as any).path : 'unknown',
                message: error.msg,
            }));

            return next(ApiError.validationError('Validation failed', formattedErrors));
        }

        next();
    };
};
