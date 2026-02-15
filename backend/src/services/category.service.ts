import { Category } from '../models';
import { ApiError } from '../utils/ApiError';
import { generateSlug } from '../utils/slugify';
import { Op } from 'sequelize';

interface CreateCategoryData {
    name: string;
    description?: string;
    parentId?: number;
    displayOrder?: number;
}

interface UpdateCategoryData {
    name?: string;
    description?: string;
    parentId?: number;
    displayOrder?: number;
}

/**
 * Get all categories (flat list or tree)
 */
export const getAllCategories = async (asTree: boolean = false) => {
    const categories = await Category.findAll({
        order: [['display_order', 'ASC']],
    });

    if (asTree) {
        return buildCategoryTree(categories);
    }

    return categories;
};

/**
 * Helper to build category tree
 */
const buildCategoryTree = (categories: Category[], parentId: number | null = null): any[] => {
    return categories
        .filter((cat) => cat.parent_id === parentId)
        .map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            displayOrder: cat.display_order,
            children: buildCategoryTree(categories, cat.id),
        }));
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: number) => {
    const category = await Category.findByPk(id, {
        include: [{ model: Category, as: 'parent' }],
    });

    if (!category) {
        throw ApiError.notFound('Category not found');
    }

    return category;
};

/**
 * Get category by Slug
 */
export const getCategoryBySlug = async (slug: string) => {
    const category = await Category.findOne({
        where: { slug },
        include: [{ model: Category, as: 'parent' }],
    });

    if (!category) {
        throw ApiError.notFound('Category not found');
    }

    return category;
};

/**
 * Create new category
 */
export const createCategory = async (data: CreateCategoryData) => {
    // Check for duplicate slug
    const slug = generateSlug(data.name);
    const existingSlug = await Category.findOne({ where: { slug } });

    if (existingSlug) {
        throw ApiError.conflict('A category with this name already exists');
    }

    // Verify parent if provided
    if (data.parentId) {
        const parent = await Category.findByPk(data.parentId);
        if (!parent) {
            throw ApiError.badRequest('Parent category not found');
        }
    }

    const category = await Category.create({
        name: data.name,
        slug,
        description: data.description || null,
        parent_id: data.parentId || null,
        display_order: data.displayOrder || 0,
    });

    return category;
};

/**
 * Update category
 */
export const updateCategory = async (id: number, data: UpdateCategoryData) => {
    const category = await Category.findByPk(id);

    if (!category) {
        throw ApiError.notFound('Category not found');
    }

    // Prevent circular parent reference
    if (data.parentId && data.parentId === id) {
        throw ApiError.badRequest('Category cannot be its own parent');
    }

    // Generate new slug if name changes
    let slug = category.slug;
    if (data.name && data.name !== category.name) {
        slug = generateSlug(data.name);
        const existingSlug = await Category.findOne({
            where: {
                slug,
                id: { [Op.ne]: id },
            },
        });

        if (existingSlug) {
            throw ApiError.conflict('A category with this name already exists');
        }
    }

    if (data.parentId) {
        const parent = await Category.findByPk(data.parentId);
        if (!parent) {
            throw ApiError.badRequest('Parent category not found');
        }
    }

    await category.update({
        name: data.name || category.name,
        slug,
        description: data.description !== undefined ? data.description : category.description,
        parent_id: data.parentId !== undefined ? data.parentId : category.parent_id,
        display_order: data.displayOrder !== undefined ? data.displayOrder : category.display_order,
    });

    return category;
};

/**
 * Delete category
 */
export const deleteCategory = async (id: number) => {
    const category = await Category.findByPk(id);

    if (!category) {
        throw ApiError.notFound('Category not found');
    }

    // Check if has children - handled by DB constraints usually (SET NULL), but good to check
    // Depending on requirements, we might want to block deletion if children exist

    await category.destroy();
};
