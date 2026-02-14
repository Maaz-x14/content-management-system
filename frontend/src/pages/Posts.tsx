import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '../services/post.service';
import type { BlogPost } from '../services/post.service';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import api from '../services/api';

interface PostFormData {
    title: string;
    content: string;
    status: 'draft' | 'published';
}

const Posts: React.FC = () => {
    const queryClient = useQueryClient();
    const [page] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editPost, setEditPost] = useState<BlogPost | null>(null);

    const { register, handleSubmit, reset, setValue } = useForm<PostFormData>();

    const { data, isLoading } = useQuery({
        queryKey: ['posts', page],
        queryFn: () => postService.getAll({ page, limit: 10 }),
    });

    useEffect(() => {
        if (editPost) {
            setValue('title', editPost.title);
            setValue('content', editPost.content);
            setValue('status', editPost.status as 'draft' | 'published');
        } else {
            reset({ title: '', content: '', status: 'draft' });
        }
    }, [editPost, isModalOpen, reset, setValue]);

    const createMutation = useMutation({
        mutationFn: (data: PostFormData) => api.post('/posts', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Post created');
            setIsModalOpen(false);
        },
        onError: () => toast.error('Failed to create post'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: PostFormData }) => api.put(`/posts/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Post updated');
            setIsModalOpen(false);
            setEditPost(null);
        },
        onError: () => toast.error('Failed to update post'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => postService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Post deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete post');
        }
    });

    const onSubmit = (data: PostFormData) => {
        if (editPost) {
            updateMutation.mutate({ id: editPost.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (post: BlogPost) => {
        setEditPost(post);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure?')) deleteMutation.mutate(id);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditPost(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4 mr-2" /> New Post
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
            ) : (
                <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Author</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {data?.data?.map((post: BlogPost) => (
                                <tr key={post.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-white font-medium">{post.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            post.status === 'published' ? 'bg-green-900/30 text-green-400' : 
                                            post.status === 'draft' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-700 text-gray-400'
                                        }`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{post.author?.full_name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button onClick={() => handleEdit(post)} className="text-indigo-400 hover:text-indigo-300"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editPost ? 'Edit Post' : 'Create Post'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Title</label>
                        <input
                            {...register('title', { required: true })}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Content</label>
                        <textarea
                            {...register('content', { required: true })}
                            rows={5}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Status</label>
                        <select
                            {...register('status')}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            {editPost ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Posts;
