import { Tag } from '../models/Tag.model';
import { ApiError } from '../utils/ApiError';
import { generateSlug } from '../utils/slugify';
import { Op } from 'sequelize';

/**
 * Get all tags (flat list)
 */
export const getAllTags = async () => {
    return Tag.findAll({ order: [['name', 'ASC']] });
};

/**
 * Get tag by ID
 */
export const getTagById = async (id: number) => {
    const tag = await Tag.findByPk(id);

    if (!tag) {
        throw ApiError.notFound('Tag not found');
    }

    return tag;
};

/**
 * Get tag by Slug
 */
export const getTagBySlug = async (slug: string) => {
    const tag = await Tag.findOne({ where: { slug } });

    if (!tag) {
        throw ApiError.notFound('Tag not found');
    }

    return tag;
};

/**
 * Create new tag
 */
export const createTag = async (name: string) => {
    const slug = generateSlug(name);

    // Check if tag already exists
    const existingTag = await Tag.findOne({ where: { slug } });
    if (existingTag) {
        throw ApiError.conflict('Tag with this name already exists');
    }

    return Tag.create({ name, slug });
};

/**
 * Update tag
 */
export const updateTag = async (id: number, name: string) => {
    const tag = await Tag.findByPk(id);

    if (!tag) {
        throw ApiError.notFound('Tag not found');
    }

    const slug = generateSlug(name);

    // Check if new slug already exists
    const existingTag = await Tag.findOne({
        where: {
            slug,
            id: { [Op.ne]: id },
        },
    });

    if (existingTag) {
        throw ApiError.conflict('Tag with this name already exists');
    }

    return tag.update({ name, slug });
};

/**
 * Delete tag
 */
export const deleteTag = async (id: number) => {
    const tag = await Tag.findByPk(id);

    if (!tag) {
        throw ApiError.notFound('Tag not found');
    }

    await tag.destroy();
};
