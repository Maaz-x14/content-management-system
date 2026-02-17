import api from './api';

export interface Job {
    id: number;
    title: string;
    slug: string;
    department: string;
    location_city: string | null;
    location_type: 'onsite' | 'remote' | 'hybrid';
    employment_type: 'full-time' | 'part-time' | 'contract' | 'internship';
    description: string;
    status: 'draft' | 'active' | 'closed' | 'archived';
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
    },
    getApplications: async () => {
        const response = await api.get('/jobs/all/applications');
        return response.data;
    },
    updateApplicationStatus: async (id: number, status: string, notes?: string) => {
        const response = await api.patch(`/jobs/applications/${id}/status`, { status, notes });
        return response.data;
    }
};
