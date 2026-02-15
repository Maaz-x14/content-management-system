import { Request, Response, NextFunction } from 'express';
import { mediaService } from '../services/media.service';
import { ApiError } from '../utils/ApiError';
import { FileType } from '../models';


export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw ApiError.badRequest('No file uploaded');
        }

        if (!req.user) {
            throw ApiError.unauthorized('User not authenticated');
        }

        const altText = req.body.altText;
        const media = await mediaService.processUpload(req.file, req.user.id, altText);

        res.status(201).json({
            success: true,
            data: media,
        });
    } catch (error) {
        next(error);
    }
};

export const getMediaFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const type = req.query.type as FileType | undefined;
        const search = req.query.search as string | undefined;

        const result = await mediaService.getAllMedia(page, limit, type, search);

        res.json({
            success: true,
            data: result.files,
            pagination: {
                total: result.total,
                page,
                limit,
                totalPages: result.totalPages,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getMediaById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        const media = await mediaService.getMediaById(id);

        res.json({
            success: true,
            data: media,
        });
    } catch (error) {
        next(error);
    }
};

export const updateMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        const { altText } = req.body;

        if (!altText) {
            throw ApiError.badRequest('Alt text is required');
        }

        const media = await mediaService.updateMedia(id, altText);

        res.json({
            success: true,
            data: media,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        await mediaService.deleteMedia(id);

        res.json({
            success: true,
            message: 'Media file deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
