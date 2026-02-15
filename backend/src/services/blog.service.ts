import { BlogPost, PostStatus, Category, Tag, User } from '../models';
import { ApiError } from '../utils/ApiError';
import { generateSlug } from '../utils/slugify';
import { Op } from 'sequelize';

interface CreatePostData {
    title: string;
    content: string;
    excerpt?: string;
    status: 'draft' | 'published' | 'scheduled';
    authorId: number;
    categoryId?: number;
    tags?: number[];
    featuredImage?: string;
    metaTitle?: string;
    metaDescription?: string;
    publishedAt?: Date;
}

interface UpdatePostData {
    title?: string;
    content?: string;
    excerpt?: string;
    status?: 'draft' | 'published' | 'scheduled';
    categoryId?: number;
    tags?: number[];
    featuredImage?: string;
    metaTitle?: string;
    metaDescription?: string;
    publishedAt?: Date;
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
    filters: PostFilters,
    pagination: { page: number; limit: number }
) => {
    const { status, categoryId, tagId, authorId, search } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;
    if (categoryId) where.category_id = categoryId;
    if (authorId) where.author_id = authorId;

    if (search) {
        where[Op.or] = [
            { title: { [Op.iLike]: `%${search}%` } },
            { content: { [Op.iLike]: `%${search}%` } },
        ];
    }

    const include: any[] = [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'author', attributes: ['id', 'full_name', 'email'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
    ];

    if (tagId) {
        include[2] = {
            model: Tag,
            as: 'tags',
            where: { id: tagId },
            through: { attributes: [] },
        };
    }

    const { count, rows } = await BlogPost.findAndCountAll({
        where,
        include,
        limit,
        offset,
        order: [['published_at', 'DESC'], ['created_at', 'DESC']],
        distinct: true, // Needed for correct count with includes
    });

    return {
        posts: rows,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        },
    };
};

/**
 * Get post by ID
 */
export const getPostById = async (id: number) => {
    const post = await BlogPost.findByPk(id, {
        include: [
            { model: Category, as: 'category' },
            { model: User, as: 'author', attributes: ['id', 'full_name'] },
            { model: Tag, as: 'tags', through: { attributes: [] } },
        ],
    });

    if (!post) {
        throw ApiError.notFound('Blog post not found');
    }

    return post;
};

/**
 * Get post by Slug
 */
export const getPostBySlug = async (slug: string) => {
    const post = await BlogPost.findOne({
        where: { slug },
        include: [
            { model: Category, as: 'category' },
            { model: User, as: 'author', attributes: ['id', 'full_name'] },
            { model: Tag, as: 'tags', through: { attributes: [] } },
        ],
    });

    if (!post) {
        throw ApiError.notFound('Blog post not found');
    }

    // Increment view count
    await post.increment('view_count');

    return post;
};

/**
 * Create new post
 */
export const createPost = async (data: CreatePostData) => {
    const slug = generateSlug(data.title);

    // Check unique slug
    const existingSlug = await BlogPost.findOne({ where: { slug } });
    if (existingSlug) {
        throw ApiError.conflict('A post with this title already exists');
    }

    const post = await BlogPost.create({
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status as PostStatus, // Cast string to enum
        author_id: data.authorId,
        category_id: data.categoryId,
        featured_image: data.featuredImage,
        meta_title: data.metaTitle,
        meta_description: data.metaDescription,
        published_at: data.publishedAt || (data.status === 'published' ? new Date() : null),
    });

    if (data.tags && data.tags.length > 0) {
        await post.setTags(data.tags);
    }

    return getPostById(post.id);
};

/**
 * Update post
 */
export const updatePost = async (id: number, data: UpdatePostData) => {
    const post = await BlogPost.findByPk(id);

    if (!post) {
        throw ApiError.notFound('Blog post not found');
    }

    let slug = post.slug;
    if (data.title && data.title !== post.title) {
        slug = generateSlug(data.title);
        const existingSlug = await BlogPost.findOne({
            where: {
                slug,
                id: { [Op.ne]: id },
            },
        });

        if (existingSlug) {
            throw ApiError.conflict('A post with this title already exists');
        }
    }

    await post.update({
        title: data.title || post.title,
        slug,
        content: data.content || post.content,
        excerpt: data.excerpt !== undefined ? data.excerpt : post.excerpt,
        status: (data.status as PostStatus) || post.status,
        category_id: data.categoryId !== undefined ? data.categoryId : post.category_id,
        featured_image: data.featuredImage !== undefined ? data.featuredImage : post.featured_image,
        meta_title: data.metaTitle !== undefined ? data.metaTitle : post.meta_title,
        meta_description:
            data.metaDescription !== undefined ? data.metaDescription : post.meta_description,
        published_at: data.publishedAt || post.published_at,
    });

    if (data.tags) {
        await post.setTags(data.tags);
    }

    return getPostById(id);
};

/**
 * Delete post (soft delete)
 */
export const deletePost = async (id: number) => {
    const post = await BlogPost.findByPk(id);

    if (!post) {
        throw ApiError.notFound('Blog post not found');
    }

    await post.destroy();
};
