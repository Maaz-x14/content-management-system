import api from './api';
import type { User } from '../types/auth.types';

export interface UsersResponse {
    success: boolean;
    data: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface CreateUserDto {
    email: string;
    fullName: string;
    roleId: number;
    password?: string;
}

export interface UpdateUserDto {
    email?: string;
    fullName?: string;
    roleId?: number;
    isActive?: boolean;
}

export const userService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; roleId?: number; isActive?: boolean }) => {
        const response = await api.get('/users', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    create: async (data: CreateUserDto) => {
        const response = await api.post('/users', data);
        return response.data;
    },

    update: async (id: number, data: UpdateUserDto) => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    getRoles: async () => {
        const response = await api.get('/users/roles', { // Ensure trailing slash handling? backend route is /users/roles (no generic param conflicts)
            // Wait, backend route is defined as router.get('/roles', ...) mounted on /api/v1/users ??
            // Let's check user.routes.ts
        });
        return response.data;
    }
};
