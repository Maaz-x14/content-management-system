import { Request, Response, NextFunction } from 'express';
import * as tagService from '../services/tag.service';

/**
 * Get all tags
 */
export const getAllTags = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const tags = await tagService.getAllTags();

        res.json({
            success: true,
            data: tags,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get tag by ID
 */
export const getTagById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const tag = await tagService.getTagById(parseInt(id));

        res.json({
            success: true,
            data: tag,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new tag
 */
export const createTag = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name } = req.body;

        const tag = await tagService.createTag(name);

        res.status(201).json({
            success: true,
            data: tag,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update tag
 */
export const updateTag = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const tag = await tagService.updateTag(parseInt(id), name);

        res.json({
            success: true,
            data: tag,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete tag
 */
export const deleteTag = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        await tagService.deleteTag(parseInt(id));

        res.json({
            success: true,
            message: 'Tag deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
