import api from './api';

export interface Job {
    id: number;
    title: string;
    slug: string;
    department: string;
    location: string;
    type: 'full-time' | 'part-time' | 'contract' | 'remote';
    description: string;
    is_active: boolean;
    created_at: string;
}

export const careerService = {
    getAll: async (params?: any) => {
        const response = await api.get('/jobs', { params });
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/jobs/${id}`);
        return response.data;
    }
};
