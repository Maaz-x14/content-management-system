import api from './api';

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featured_image: string | null;
    status: 'draft' | 'published' | 'scheduled' | 'archived';
    published_at: string | null;
    scheduled_for: string | null;
    author_id: number;
    created_at: string;
    author?: {
        full_name: string;
    };
}

export const postService = {
    getAll: async (params?: any) => {
        const response = await api.get('/posts', { params });
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/posts/${id}`);
        return response.data;
    }
    // Add create/update later
};
