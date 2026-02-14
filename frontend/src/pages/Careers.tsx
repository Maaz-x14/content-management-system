import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careerService } from '../services/career.service';
import type { Job } from '../services/career.service';
import { Loader2, Plus, Edit2, Trash2, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import api from '../services/api';

interface JobFormData {
    title: string;
    department: string;
    location: string;
    type: 'full-time' | 'part-time' | 'contract' | 'remote';
    description: string;
    is_active: boolean;
}

const Careers: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editJob, setEditJob] = useState<Job | null>(null);

    const { register, handleSubmit, reset, setValue } = useForm<JobFormData>();

    const { data, isLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: () => careerService.getAll(),
    });

    useEffect(() => {
        if (editJob) {
            setValue('title', editJob.title);
            setValue('department', editJob.department);
            setValue('location', editJob.location);
            setValue('type', editJob.type);
            setValue('description', editJob.description);
            setValue('is_active', editJob.is_active);
        } else {
            reset({
                title: '',
                department: '',
                location: '',
                type: 'full-time',
                description: '',
                is_active: true
            });
        }
    }, [editJob, isModalOpen, reset, setValue]);

    const createMutation = useMutation({
        mutationFn: (data: JobFormData) => api.post('/jobs', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            toast.success('Job created');
            setIsModalOpen(false);
        },
        onError: () => toast.error('Failed to create job'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: JobFormData }) => api.put(`/jobs/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            toast.success('Job updated');
            setIsModalOpen(false);
            setEditJob(null);
        },
        onError: () => toast.error('Failed to update job'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => careerService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            toast.success('Job deleted');
        },
        onError: () => toast.error('Failed to delete job'),
    });

    const onSubmit = (data: JobFormData) => {
        if (editJob) {
            updateMutation.mutate({ id: editJob.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (job: Job) => {
        setEditJob(job);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Delete job?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditJob(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Job Listings</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Job
                </button>
            </div>

            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div> : (
                <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {data?.data?.map((job: Job) => (
                                <tr key={job.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <Briefcase className="w-4 h-4 text-indigo-400" />
                                        <span className="text-white font-medium">{job.title}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{job.department}</td>
                                    <td className="px-6 py-4 text-gray-300">{job.location}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded text-xs uppercase tracking-wide font-medium">
                                            {job.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button onClick={() => handleEdit(job)} className="text-indigo-400 hover:text-indigo-300"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(job.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
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
                title={editJob ? 'Edit Job' : 'Add Job'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Job Title</label>
                        <input
                            {...register('title', { required: true })}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Department</label>
                            <input
                                {...register('department', { required: true })}
                                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Location</label>
                            <input
                                {...register('location', { required: true })}
                                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Type</label>
                        <select
                            {...register('type')}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="full-time">Full Time</option>
                            <option value="part-time">Part Time</option>
                            <option value="contract">Contract</option>
                            <option value="remote">Remote</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Description</label>
                        <textarea
                            {...register('description', { required: true })}
                            rows={4}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            {...register('is_active')}
                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label className="ml-2 block text-sm text-gray-400">Active</label>
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
                            {editJob ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Careers;
