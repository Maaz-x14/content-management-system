import { Request, Response, NextFunction } from 'express';
import * as blogService from '../services/blog.service';
import { ApiError } from '../utils/ApiError';
import { validateId } from '../utils/validators';

interface CreatePostRequest extends Request {
    body: {
        title: string;
        content: string;
        excerpt?: string;
        status?: 'draft' | 'published' | 'scheduled';
        categoryId?: number;
        tags?: number[];
        featuredImage?: string;
        metaTitle?: string;
        metaDescription?: string;
        isFeatured?: boolean;
        publishedAt?: Date;
    };
}

interface UpdatePostRequest extends Request {
    params: {
        id: string;
    };
    body: {
        title?: string;
        content?: string;
        excerpt?: string;
        status?: 'draft' | 'published' | 'scheduled';
        categoryId?: number;
        tags?: number[];
        featuredImage?: string;
        metaTitle?: string;
        metaDescription?: string;
        isFeatured?: boolean;
        publishedAt?: Date;
    };
}

interface PostFilters {
    status?: string;
    categoryId?: number;
    tagId?: number;
    authorId?: number;
    search?: string;
}

/**
 * Get all blog posts with filtering and pagination
 */
export const getAllPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { status, categoryId, tagId, authorId, search, page, limit } = req.query;

        const filters: PostFilters = {
            status: status as string,
            categoryId: categoryId ? parseInt(categoryId as string) : undefined,
            tagId: tagId ? parseInt(tagId as string) : undefined,
            authorId: authorId ? parseInt(authorId as string) : undefined,
            search: search as string,
        };

        const pagination = {
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10,
        };

        const result = await blogService.getAllPosts(filters, pagination);

        res.json({
            success: true,
            data: result.posts,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get post by ID
 */
export const getPostById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const post = await blogService.getPostById(validateId(id, 'Post ID'));

        res.json({
            success: true,
            data: post,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get post by Slug
 */
export const getPostBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { slug } = req.params;

        const post = await blogService.getPostBySlug(slug);

        res.json({
            success: true,
            data: post,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new post
 */
export const createPost = async (
    req: CreatePostRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const {
            title,
            content,
            excerpt,
            status,
            categoryId,
            tags,
            featuredImage,
            metaTitle,
            metaDescription,
            publishedAt,
        } = req.body;

        if (!req.user) {
            throw ApiError.unauthorized('User not authenticated');
        }

        const post = await blogService.createPost({
            title,
            content,
            excerpt,
            status: status || 'draft',
            authorId: req.user.userId,
            categoryId,
            tags,
            featuredImage,
            metaTitle,
            metaDescription,
            publishedAt,
        });

        res.status(201).json({
            success: true,
            data: post,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update post
 */
export const updatePost = async (
    req: UpdatePostRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            title,
            content,
            excerpt,
            status,
            categoryId,
            tags,
            featuredImage,
            metaTitle,
            metaDescription,
            publishedAt,
        } = req.body;

        const post = await blogService.updatePost(validateId(id, 'Post ID'), {
            title,
            content,
            excerpt,
            status,
            categoryId,
            tags,
            featuredImage,
            metaTitle,
            metaDescription,
            publishedAt,
        });

        res.json({
            success: true,
            data: post,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete post (soft delete)
 */
export const deletePost = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        await blogService.deletePost(validateId(id, 'Post ID'));

        res.json({
            success: true,
            message: 'Post deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
