import { Request, Response, NextFunction } from 'express';
import * as serviceService from '../services/service.service';
import { ApiError } from '../utils/ApiError';
import { validateId } from '../utils/validators';

/**
 * Get all services
 */
export const getAllServices = async (req: Request, res: Response, _next: NextFunction) => {
    const { status, isFeatured } = req.query;
    const services = await serviceService.getAllServices({
        status: status as string,
        isFeatured: isFeatured === 'true',
    });
    res.json({ success: true, data: services });
};

/**
 * Get service by ID
 */
export const getServiceById = async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const service = await serviceService.getServiceById(validateId(id));
    res.json({ success: true, data: service });
};

/**
 * Get service by Slug
 */
export const getServiceBySlug = async (req: Request, res: Response, _next: NextFunction) => {
    const { slug } = req.params;
    const service = await serviceService.getServiceBySlug(slug);
    res.json({ success: true, data: service });
};

/**
 * Create service
 */
export const createService = async (req: Request, res: Response, _next: NextFunction) => {
    const {
        title,
        description,
        status,
        isFeatured,
        category,
        technologies,
        industry,
        challenge,
        solution,
        results,
        metrics,
        displayOrder,
        images,
    } = req.body;

    if (!req.user) {
        throw ApiError.unauthorized('User not authenticated');
    }

    const service = await serviceService.createService({
        title,
        description,
        status,
        isFeatured,
        category,
        technologies,
        industry,
        challenge,
        solution,
        results,
        metrics,
        displayOrder,
        userId: req.user.userId,
        images,
    });

    res.status(201).json({ success: true, data: service });
};

/**
 * Update service
 */
export const updateService = async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const {
        title,
        description,
        status,
        isFeatured,
        category,
        technologies,
        industry,
        challenge,
        solution,
        results,
        metrics,
        displayOrder,
    } = req.body;

    const service = await serviceService.updateService(validateId(id), {
        title,
        description,
        status,
        isFeatured,
        category,
        technologies,
        industry,
        challenge,
        solution,
        results,
        metrics,
        displayOrder,
    });

    res.json({ success: true, data: service });
};

/**
 * Delete service
 */
export const deleteService = async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await serviceService.deleteService(validateId(id));
    res.json({ success: true, message: 'Service deleted successfully' });
};
