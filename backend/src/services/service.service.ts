import { Service, ServiceStatus, ServiceImage } from '../models';
import { ApiError } from '../utils/ApiError';
import { generateSlug } from '../utils/slugify';
import { Op } from 'sequelize';

interface ServiceData {
    title: string;
    description: string;
    clientName?: string;
    projectUrl?: string;
    status: 'draft' | 'published';
    isFeatured?: boolean;
    category?: string;
    technologies?: string[];
    industry?: string;
    challenge?: string;
    solution?: string;
    results?: string;
    metrics?: object;
    displayOrder?: number;
    userId: number;
    images?: {
        imageUrl: string;
        caption?: string;
        isPrimary?: boolean;
        displayOrder?: number;
    }[];
}

interface UpdateServiceData {
    title?: string;
    description?: string;
    clientName?: string;
    projectUrl?: string;
    status?: 'draft' | 'published';
    isFeatured?: boolean;
    category?: string;
    technologies?: string[];
    industry?: string;
    challenge?: string;
    solution?: string;
    results?: string;
    metrics?: object;
    displayOrder?: number;
}

/**
 * Get all services
 */
export const getAllServices = async (filters: { status?: string; isFeatured?: boolean }) => {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.isFeatured !== undefined) where.featured = filters.isFeatured;

    return Service.findAll({
        where,
        include: [{ model: ServiceImage, as: 'images' }],
        order: [
            ['display_order', 'ASC'],
            ['created_at', 'DESC'],
        ],
    });
};

/**
 * Get service by ID
 */
export const getServiceById = async (id: number) => {
    const service = await Service.findByPk(id, {
        include: [{ model: ServiceImage, as: 'images' }],
    });

    if (!service) {
        throw ApiError.notFound('Service not found');
    }

    return service;
};

/**
 * Get service by Slug
 */
export const getServiceBySlug = async (slug: string) => {
    const service = await Service.findOne({
        where: { slug },
        include: [{ model: ServiceImage, as: 'images' }],
    });

    if (!service) {
        throw ApiError.notFound('Service not found');
    }

    return service;
};

/**
 * Create service
 */
export const createService = async (data: ServiceData) => {
    const slug = generateSlug(data.title);

    const existingSlug = await Service.findOne({ where: { slug } });
    if (existingSlug) {
        throw ApiError.conflict('Service with this title already exists');
    }

    const service = await Service.create({
        title: data.title,
        slug,
        description: data.description,
        client_name: data.clientName,
        project_url: data.projectUrl,
        status: data.status as ServiceStatus,
        featured: data.isFeatured || false,
        category: data.category,
        technologies: data.technologies,
        industry: data.industry,
        challenge: data.challenge,
        solution: data.solution,
        results: data.results,
        metrics: data.metrics,
        display_order: data.displayOrder || 0,
        created_by: data.userId,
    });

    if (data.images && data.images.length > 0) {
        await ServiceImage.bulkCreate(
            data.images.map((img) => ({
                service_id: service.id,
                image_url: img.imageUrl,
                caption: img.caption,
                is_primary: img.isPrimary || false,
                display_order: img.displayOrder || 0,
            }))
        );
    }

    return getServiceById(service.id);
};

/**
 * Update service
 */
export const updateService = async (id: number, data: UpdateServiceData) => {
    const service = await Service.findByPk(id);

    if (!service) {
        throw ApiError.notFound('Service not found');
    }

    let slug = service.slug;
    if (data.title && data.title !== service.title) {
        slug = generateSlug(data.title);
        const existingSlug = await Service.findOne({
            where: {
                slug,
                id: { [Op.ne]: id },
            },
        });

        if (existingSlug) {
            throw ApiError.conflict('Service with this title already exists');
        }
    }

    await service.update({
        title: data.title || service.title,
        slug,
        description: data.description || service.description,
        client_name: data.clientName !== undefined ? data.clientName : service.client_name,
        project_url: data.projectUrl !== undefined ? data.projectUrl : service.project_url,
        status: data.status ? (data.status as ServiceStatus) : service.status,
        featured: data.isFeatured !== undefined ? data.isFeatured : service.featured,
        category: data.category !== undefined ? data.category : service.category,
        technologies: data.technologies !== undefined ? data.technologies : service.technologies,
        industry: data.industry !== undefined ? data.industry : service.industry,
        challenge: data.challenge !== undefined ? data.challenge : service.challenge,
        solution: data.solution !== undefined ? data.solution : service.solution,
        results: data.results !== undefined ? data.results : service.results,
        metrics: data.metrics !== undefined ? data.metrics : service.metrics,
        display_order: data.displayOrder !== undefined ? data.displayOrder : service.display_order,
    });

    return getServiceById(id);
};

/**
 * Delete service
 */
export const deleteService = async (id: number) => {
    const service = await Service.findByPk(id);

    if (!service) {
        throw ApiError.notFound('Service not found');
    }

    await service.destroy();
};
