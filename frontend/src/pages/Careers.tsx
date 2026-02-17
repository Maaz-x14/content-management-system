import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careerService } from '../services/career.service';
import type { Job } from '../services/career.service';
import { Loader2, Plus, Edit2, Trash2, Briefcase, Eye, Send, FileText as FileIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import api from '../services/api';

interface JobFormData {
    title: string;
    department: string;
    location_city: string;
    location_type: 'onsite' | 'remote' | 'hybrid';
    employment_type: 'full-time' | 'part-time' | 'contract' | 'internship';
    description: string;
    status: 'draft' | 'active' | 'closed';
}

const Careers: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editJob, setEditJob] = useState<Job | null>(null);
    const [previewJob, setPreviewJob] = useState<Job | null>(null);
    const [isApplying, setIsApplying] = useState(false);

    const { register, handleSubmit, reset, setValue } = useForm<JobFormData>();
    const { register: registerApp, handleSubmit: handleSubmitApp, reset: resetApp } = useForm<{
        applicantName: string;
        applicantEmail: string;
        applicantPhone: string;
        resumeUrl: string;
        coverLetter: string;
    }>();

    const { data, isLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: () => careerService.getAll(),
    });

    useEffect(() => {
        if (editJob) {
            setValue('title', editJob.title);
            setValue('department', editJob.department);
            setValue('location_city', editJob.location_city || '');
            setValue('location_type', editJob.location_type as any || 'onsite');
            setValue('employment_type', editJob.employment_type as any);
            setValue('description', editJob.description);
            setValue('status', editJob.status as any);
        } else {
            reset({
                title: '',
                department: '',
                location_city: '',
                location_type: 'onsite',
                employment_type: 'full-time',
                description: '',
                status: 'draft'
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

    const applyMutation = useMutation({
        mutationFn: (data: any) => api.post(`/jobs/${previewJob?.id}/apply`, data),
        onSuccess: () => {
            toast.success('Application submitted successfully!');
            setIsApplying(false);
            setPreviewJob(null);
            resetApp();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit application'),
    });

    const onApplySubmit = (data: any) => {
        applyMutation.mutate(data);
    };

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
                                    <td className="px-6 py-4 text-gray-300">
                                        {job.location_city} ({job.location_type?.charAt(0).toUpperCase() + job.location_type?.slice(1)})
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded text-xs uppercase tracking-wide font-medium">
                                            {job.employment_type?.replace('-', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button 
                                            onClick={() => setPreviewJob(job)} 
                                            className="text-gray-400 hover:text-white"
                                            title="View Public Link"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
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
                            <label className="block text-sm font-medium text-gray-400">City</label>
                            <input
                                {...register('location_city', { required: true })}
                                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Employment Type</label>
                            <select
                                {...register('employment_type')}
                                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="full-time">Full Time</option>
                                <option value="part-time">Part Time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Location Type</label>
                            <select
                                {...register('location_type')}
                                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="onsite">Onsite</option>
                                <option value="remote">Remote</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Description</label>
                        <textarea
                            {...register('description', { required: true })}
                            rows={4}
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
                            <option value="active">Active</option>
                            <option value="closed">Closed</option>
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
                            {editJob ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Public Preview & Apply Modal */}
            <Modal
                isOpen={!!previewJob}
                onClose={() => { setPreviewJob(null); setIsApplying(false); }}
                title={isApplying ? "Submit Application" : "Job Preview"}
            >
                {previewJob && (
                    <div className="space-y-6">
                        {!isApplying ? (
                            <>
                                <div className="border-b border-gray-700 pb-4">
                                    <h2 className="text-2xl font-bold text-white mb-2">{previewJob.title}</h2>
                                    <div className="flex gap-4 text-sm text-gray-400">
                                        <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1" /> {previewJob.department}</span>
                                        <span className="flex items-center capitalize"><Eye className="w-4 h-4 mr-1" /> {previewJob.employment_type?.replace('-', ' ')}</span>
                                        <span className="flex items-center capitalize"><Plus className="w-4 h-4 mr-1" /> {previewJob.location_type}</span>
                                    </div>
                                </div>
                                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wider">Job Description</h3>
                                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{previewJob.description}</p>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <span className="text-xs text-gray-500">Public Link: morphelabs.io/careers/{previewJob.slug}</span>
                                    <button 
                                        onClick={() => setIsApplying(true)}
                                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleSubmitApp(onApplySubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                                        <input {...registerApp('applicantName', { required: true })} className="w-full bg-gray-900 border-gray-700 rounded-lg text-white px-4 py-2" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email Address</label>
                                        <input {...registerApp('applicantEmail', { required: true })} type="email" className="w-full bg-gray-900 border-gray-700 rounded-lg text-white px-4 py-2" placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Resume Link (PDF/DOC)</label>
                                    <div className="relative">
                                        <FileIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <input {...registerApp('resumeUrl', { required: true })} className="w-full bg-gray-900 border-gray-700 rounded-lg text-white pl-10 pr-4 py-2" placeholder="https://dropbox.com/my-resume.pdf" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cover Letter</label>
                                    <textarea {...registerApp('coverLetter')} rows={4} className="w-full bg-gray-900 border-gray-700 rounded-lg text-white px-4 py-2" placeholder="Why should we hire you?" />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsApplying(false)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all">Back</button>
                                    <button type="submit" disabled={applyMutation.isPending} className="flex-2 px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                                        {applyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Submit Application
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Careers;
