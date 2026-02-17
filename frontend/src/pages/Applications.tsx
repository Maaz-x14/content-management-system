import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careerService } from '../services/career.service';
import { Loader2, Mail, Phone, FileText, ExternalLink, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface Application {
    id: number;
    job_id: number;
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string | null;
    resume_url: string;
    resume_filename: string;
    cover_letter: string | null;
    status: string;
    notes: string | null;
    applied_at: string;
    job?: {
        title: string;
        department: string;
    };
}

const statusColors: Record<string, string> = {
    new: 'bg-blue-900/30 text-blue-400 border-blue-800',
    reviewing: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
    shortlisted: 'bg-purple-900/30 text-purple-400 border-purple-800',
    interviewing: 'bg-indigo-900/30 text-indigo-400 border-indigo-800',
    offered: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
    rejected: 'bg-red-900/30 text-red-400 border-red-800',
    withdrawn: 'bg-gray-800 text-gray-500 border-gray-700',
};

const Applications: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [updateNotes, setUpdateNotes] = useState('');

    const { data: applications, isLoading } = useQuery({
        queryKey: ['applications'],
        queryFn: () => careerService.getApplications(),
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) => 
            careerService.updateApplicationStatus(id, status, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            toast.success('Application status updated');
            setSelectedApp(null);
            setUpdateNotes('');
        },
        onError: () => toast.error('Failed to update status'),
    });

    const handleStatusUpdate = (status: string) => {
        if (!selectedApp) return;
        statusMutation.mutate({ id: selectedApp.id, status, notes: updateNotes || undefined });
    };

    const API_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5001';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Job Applications</h1>
                <div className="text-sm text-gray-400">
                    Total {applications?.data?.length || 0} applications received
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Applicant</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Job Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Applied Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700 bg-gray-800">
                                {applications?.data?.map((app: Application) => (
                                    <tr key={app.id} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white">{app.applicant_name}</span>
                                                <span className="text-xs text-gray-400">{app.applicant_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {app.job?.title || 'Unknown Position'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {format(new Date(app.applied_at), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
                                                statusColors[app.status] || statusColors.new
                                            )}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => {
                                                    setSelectedApp(app);
                                                    setUpdateNotes(app.notes || '');
                                                }}
                                                className="text-primary hover:text-indigo-400 text-sm font-medium"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!applications?.data || applications.data.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No applications found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Application Detail Modal */}
            <Modal
                isOpen={!!selectedApp}
                onClose={() => setSelectedApp(null)}
                title="Application Details"
                // size="lg"
            >
                {selectedApp && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Applicant Info</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center text-white">
                                            <Mail className="w-4 h-4 mr-3 text-indigo-400" />
                                            <span className="text-sm">{selectedApp.applicant_email}</span>
                                        </div>
                                        {selectedApp.applicant_phone && (
                                            <div className="flex items-center text-white">
                                                <Phone className="w-4 h-4 mr-3 text-indigo-400" />
                                                <span className="text-sm">{selectedApp.applicant_phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center text-white">
                                            <Clock className="w-4 h-4 mr-3 text-indigo-400" />
                                            <span className="text-sm">Applied on {format(new Date(selectedApp.applied_at), 'PPP')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Resume</h3>
                                    <a 
                                        href={selectedApp.resume_url.startsWith('http') ? selectedApp.resume_url : `${API_URL}${selectedApp.resume_url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors border border-gray-600"
                                    >
                                        <FileText className="w-4 h-4 mr-2 text-primary-cyan" />
                                        <span className="text-sm truncate max-w-[200px]">{selectedApp.resume_filename}</span>
                                        <ExternalLink className="w-3 h-3 ml-2" />
                                    </a>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Position</h3>
                                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                        <p className="text-sm font-bold text-white">{selectedApp.job?.title}</p>
                                        <p className="text-xs text-gray-400 mt-1">{selectedApp.job?.department}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Internal Notes</h3>
                                    <textarea
                                        value={updateNotes}
                                        onChange={(e) => setUpdateNotes(e.target.value)}
                                        placeholder="Add private notes about this candidate..."
                                        rows={3}
                                        className="w-full bg-gray-900 border-gray-700 text-white text-sm rounded-lg focus:ring-primary focus:border-primary p-3"
                                    />
                                </div>
                            </div>
                        </div>

                        {selectedApp.cover_letter && (
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Cover Letter</h3>
                                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 text-sm text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                                    {selectedApp.cover_letter}
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-gray-700">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-4 text-center">Update Application Status</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <button 
                                    onClick={() => handleStatusUpdate('reviewing')}
                                    className="flex items-center justify-center px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-white rounded-lg border border-yellow-500/50 transition-all text-xs font-bold"
                                >
                                    Reviewing
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('shortlisted')}
                                    className="flex items-center justify-center px-4 py-2 bg-purple-500/10 hover:bg-purple-500 text-purple-500 hover:text-white rounded-lg border border-purple-500/50 transition-all text-xs font-bold"
                                >
                                    Shortlist
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('interviewing')}
                                    className="flex items-center justify-center px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white rounded-lg border border-indigo-500/50 transition-all text-xs font-bold"
                                >
                                    Interview
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('offered')}
                                    className="flex items-center justify-center px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg border border-emerald-500/50 transition-all text-xs font-bold"
                                >
                                    Offer
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('rejected')}
                                    className="flex items-center justify-center px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg border border-red-500/50 transition-all text-xs font-bold sm:col-span-2"
                                >
                                    Reject Application
                                </button>
                                <button 
                                    onClick={() => setSelectedApp(null)}
                                    className="flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 transition-all text-xs font-bold sm:col-span-2"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Applications;
