import api from './api';

export interface Service {
    id: number;
    title: string;
    slug: string;
    description: string;
    short_description: string | null;
    icon: string | null;
    status: 'completed' | 'ongoing' | 'archived';
    is_active?: boolean;
    created_at: string;
}

export const serviceService = {
    getAll: async (params?: any) => {
        const response = await api.get('/services', { params });
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    }
};
