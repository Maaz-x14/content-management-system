import React, { useState } from 'react';
import api from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '../services/service.service';
import type { Service } from '../services/service.service';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';

interface ServiceFormData {
    title: string;
    description: string;
    status: 'completed' | 'ongoing' | 'archived';
}

const Services: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editService, setEditService] = useState<Service | null>(null);

    const { register, handleSubmit, reset, setValue } = useForm<ServiceFormData>();

    const { data, isLoading } = useQuery({
        queryKey: ['services'],
        queryFn: () => serviceService.getAll(),
    });

    // Reset form when modal opens/closes or editService changes
    React.useEffect(() => {
        if (editService) {
            setValue('title', editService.title);
            setValue('description', editService.description);
            setValue('status', editService.status);
        } else {
            reset({ title: '', description: '', status: 'ongoing' });
        }
    }, [editService, isModalOpen, reset, setValue]);

    const createMutation = useMutation({
        mutationFn: (data: ServiceFormData) => api.post('/services', data), // Using api direct or add to service
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast.success('Service created');
            setIsModalOpen(false);
        },
        onError: () => toast.error('Failed to create service'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ServiceFormData }) => api.put(`/services/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast.success('Service updated');
            setIsModalOpen(false);
            setEditService(null);
        },
        onError: () => toast.error('Failed to update service'),
    });

    const onSubmit = (data: ServiceFormData) => {
        if (editService) {
            updateMutation.mutate({ id: editService.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (service: Service) => {
        setEditService(service);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditService(null);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Delete service?')) {
            serviceService.delete(id).then(() => {
                queryClient.invalidateQueries({ queryKey: ['services'] });
                toast.success('Service deleted');
            }).catch(() => toast.error('Failed to delete'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Services</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Service
                </button>
            </div>

            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div> : (
                <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {data?.data?.map((service: Service) => (
                                <tr key={service.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-white font-medium">{service.title}</td>
                                    <td className="px-6 py-4 text-gray-400 text-sm truncate max-w-xs">{service.short_description || service.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            service.status === 'completed' ? 'bg-green-900/30 text-green-400' : 
                                            service.status === 'ongoing' ? 'bg-blue-900/30 text-blue-400' : 
                                            'bg-gray-700 text-gray-400'
                                        }`}>
                                            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button onClick={() => handleEdit(service)} className="text-indigo-400 hover:text-indigo-300"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(service.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
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
                title={editService ? 'Edit Service' : 'Add Service'}
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
                        <label className="block text-sm font-medium text-gray-400">Description</label>
                        <textarea
                            {...register('description', { required: true })}
                            rows={3}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Status</label>
                        <select
                            {...register('status')}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="completed">Completed</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="archived">Archived</option>
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
                            {editService ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Services;
