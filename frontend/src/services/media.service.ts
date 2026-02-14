import api from './api';

export interface MediaFile {
    id: number;
    filename: string;
    original_name: string;
    file_path: string;
    file_url: string;
    thumbnail_url: string | null;
    file_type: 'image' | 'video' | 'document' | 'other';
    mime_type: string;
    file_size: number;
    image_width: number | null;
    image_height: number | null;
    alt_text: string | null;
    uploaded_by: number;
    created_at: string;
}

export interface MediaResponse {
    success: boolean;
    data: MediaFile[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const mediaService = {
    getAll: async (params?: { page?: number; limit?: number; type?: string; search?: string }) => {
        const response = await api.get('/media', { params });
        return response.data;
    },

    upload: async (file: File, altText?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        if (altText) formData.append('altText', altText);

        const response = await api.post('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    update: async (id: number, altText: string) => {
        const response = await api.put(`/media/${id}`, { altText });
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/media/${id}`);
        return response.data;
    }
};
