import { ApiError } from './ApiError';

/**
 * Validate that an ID is a valid integer
 * @param id The ID to validate (string or number)
 * @param entityName The name of the entity for the error message
 * @returns The parsed integer ID
 * @throws ApiError if the ID is invalid
 */
export const validateId = (id: string | number, entityName: string = 'ID'): number => {
    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(parsedId) || parsedId <= 0) {
        throw ApiError.badRequest(`Invalid ${entityName}`);
    }

    return parsedId;
};
