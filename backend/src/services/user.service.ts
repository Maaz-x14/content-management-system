import { User, Role } from '../models';
import { ApiError } from '../utils/ApiError';
import { hashPassword } from '../utils/encryption';
import { Op } from 'sequelize';

interface CreateUserData {
    email: string;
    password: string;
    fullName: string;
    roleId: number;
}

interface UpdateUserData {
    email?: string;
    fullName?: string;
    roleId?: number;
    isActive?: boolean;
}

interface UserFilters {
    search?: string;
    roleId?: number;
    isActive?: boolean;
}

interface PaginationOptions {
    page?: number;
    limit?: number;
}

/**
 * Get all users with filters and pagination
 */
export const getAllUsers = async (
    filters: UserFilters = {},
    pagination: PaginationOptions = {}
) => {
    const { search, roleId, isActive } = filters;
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
        where[Op.or] = [
            { email: { [Op.iLike]: `%${search}%` } },
            { full_name: { [Op.iLike]: `%${search}%` } },
        ];
    }

    if (roleId !== undefined) {
        where.role_id = roleId;
    }

    if (isActive !== undefined) {
        where.is_active = isActive;
    }

    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
        where,
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password_hash', 'password_reset_token', 'password_reset_expires'] },
        limit,
        offset,
        order: [['created_at', 'DESC']],
    });

    return {
        users: users.map((user) => ({
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: {
                id: user.role?.id,
                name: user.role?.name,
                slug: user.role?.slug,
            },
            isActive: user.is_active,
            lastLogin: user.last_login,
            createdAt: user.created_at,
        })),
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        },
    };
};

/**
 * Get user by ID
 */
export const getUserById = async (id: number) => {
    const user = await User.findByPk(id, {
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password_hash', 'password_reset_token', 'password_reset_expires'] },
    });

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: {
            id: user.role?.id,
            name: user.role?.name,
            slug: user.role?.slug,
        },
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
    };
};

/**
 * Create new user
 */
export const createUser = async (data: CreateUserData) => {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: data.email } });

    if (existingUser) {
        throw ApiError.conflict('A user with this email already exists');
    }

    // Verify role exists
    const role = await Role.findByPk(data.roleId);

    if (!role) {
        throw ApiError.badRequest('Invalid role ID');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await User.create({
        email: data.email,
        password_hash: passwordHash,
        full_name: data.fullName,
        role_id: data.roleId,
        is_active: true,
    });

    // Return user without sensitive data
    return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        roleId: user.role_id,
        isActive: user.is_active,
        createdAt: user.created_at,
    };
};

/**
 * Update user
 */
export const updateUser = async (id: number, data: UpdateUserData) => {
    const user = await User.findByPk(id);

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== user.email) {
        const existingUser = await User.findOne({ where: { email: data.email } });

        if (existingUser) {
            throw ApiError.conflict('A user with this email already exists');
        }
    }

    // Verify role exists if being changed
    if (data.roleId) {
        const role = await Role.findByPk(data.roleId);

        if (!role) {
            throw ApiError.badRequest('Invalid role ID');
        }
    }

    // Update user
    await user.update({
        ...(data.email && { email: data.email }),
        ...(data.fullName && { full_name: data.fullName }),
        ...(data.roleId && { role_id: data.roleId }),
        ...(data.isActive !== undefined && { is_active: data.isActive }),
    });

    // Return updated user
    const updatedUser = await User.findByPk(id, {
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password_hash', 'password_reset_token', 'password_reset_expires'] },
    });

    return {
        id: updatedUser!.id,
        email: updatedUser!.email,
        fullName: updatedUser!.full_name,
        role: {
            id: updatedUser!.role?.id,
            name: updatedUser!.role?.name,
            slug: updatedUser!.role?.slug,
        },
        isActive: updatedUser!.is_active,
        lastLogin: updatedUser!.last_login,
        createdAt: updatedUser!.created_at,
        updatedAt: updatedUser!.updated_at,
    };
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (id: number): Promise<void> => {
    const user = await User.findByPk(id);

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Soft delete
    await user.destroy();
};

/**
 * Get all roles
 */
export const getAllRoles = async () => {
    const roles = await Role.findAll({
        attributes: ['id', 'name', 'slug', 'description'],
        order: [['id', 'ASC']],
    });

    return roles;
};
