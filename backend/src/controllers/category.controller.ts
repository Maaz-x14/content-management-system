import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';

/**
 * Get all categories
 */
export const getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { asTree } = req.query;

        const categories = await categoryService.getAllCategories(asTree === 'true');

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const category = await categoryService.getCategoryById(parseInt(id));

        res.json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get category by Slug
 */
export const getCategoryBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { slug } = req.params;

        const category = await categoryService.getCategoryBySlug(slug);

        res.json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new category
 */
export const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, description, parentId, displayOrder } = req.body;

        const category = await categoryService.createCategory({
            name,
            description,
            parentId,
            displayOrder,
        });

        res.status(201).json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update category
 */
export const updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, parentId, displayOrder } = req.body;

        const category = await categoryService.updateCategory(parseInt(id), {
            name,
            description,
            parentId,
            displayOrder,
        });

        res.json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete category
 */
export const deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        await categoryService.deleteCategory(parseInt(id));

        res.json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
