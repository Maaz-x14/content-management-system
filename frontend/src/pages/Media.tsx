import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '../services/media.service';
import type { MediaFile } from '../services/media.service';
import { Upload, Trash2, File, Film, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import Modal from '../components/Modal';
// import { useAuth } from '../context/AuthContext';

const Media: React.FC = () => {
    // const { user } = useAuth(); // Not used
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['media', page],
        queryFn: () => mediaService.getAll({ page, limit: 20 }),
    });

    const uploadMutation = useMutation({
        mutationFn: (file: File) => mediaService.upload(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
            toast.success('File uploaded successfully');
            setUploading(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Upload failed');
            setUploading(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => mediaService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
            toast.success('File deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Delete failed');
        },
    });

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploading(true);
            uploadMutation.mutate(file);
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            deleteMutation.mutate(id);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('URL copied to clipboard');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'image': return ImageIcon;
            case 'video': return Film;
            case 'document': return FileText;
            default: return File;
        }
    };

    const API_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5001';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Media Library</h1>
                <div className="relative">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <label
                        htmlFor="file-upload"
                        className={clsx(
                            "flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors",
                            uploading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {uploading ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Upload className="w-5 h-5 mr-2" />
                        )}
                        Upload File
                    </label>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {data?.data?.map((file: MediaFile) => {
                            const Icon = getIcon(file.file_type);
                            return (
                                <div key={file.id} className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-500 transition-all">
                                    <div className="aspect-square w-full bg-gray-900 flex items-center justify-center overflow-hidden">
                                        {file.file_type === 'image' ? (
                                            <img
                                                src={`${API_URL}${file.thumbnail_url || file.file_url}`}
                                                alt={file.alt_text || file.original_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Icon className="w-12 h-12 text-gray-500" />
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium text-white truncate" title={file.original_name}>
                                            {file.original_name}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {(file.file_size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    
                                    {/* Delete overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => handleDelete(file.id)}
                                            className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => copyToClipboard(`${API_URL}${file.file_url}`)}
                                            className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-colors"
                                            title="Copy Link"
                                        >
                                            <Upload className="w-4 h-4 rotate-180" />
                                        </button>
                                        <button 
                                            onClick={() => setSelectedFile(file)}
                                            className="p-2 bg-gray-600 rounded-full text-white hover:bg-gray-700 transition-colors"
                                            title="Preview"
                                        >
                                           <Icon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {data?.pagination && (
                        <div className="flex justify-center mt-8 space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-gray-400">
                                Page {page} of {data.pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                                disabled={page === data.pagination.totalPages}
                                className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Preview Modal */}
            <Modal
                isOpen={!!selectedFile}
                onClose={() => setSelectedFile(null)}
                title={selectedFile?.original_name || 'File Preview'}
            >
                <div className="space-y-4">
                    <div className="w-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
                        {selectedFile?.file_type === 'image' ? (
                            <img
                                src={`${API_URL}${selectedFile.file_url}`}
                                alt={selectedFile.alt_text || 'Preview'}
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center">
                                {selectedFile && React.createElement(getIcon(selectedFile.file_type), { className: "w-20 h-20 text-gray-500 mb-4" })}
                                <p className="text-gray-400">Preview not available for this file type</p>
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">File Type:</span>
                            <span className="text-white uppercase">{selectedFile?.file_type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Size:</span>
                            <span className="text-white">{(selectedFile?.file_size || 0) / 1024 > 1024 ? `${((selectedFile?.file_size || 0) / (1024 * 1024)).toFixed(2)} MB` : `${((selectedFile?.file_size || 0) / 1024).toFixed(1)} KB`}</span>
                        </div>
                        {selectedFile?.image_width && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Dimensions:</span>
                                <span className="text-white">{selectedFile.image_width} x {selectedFile.image_height}</span>
                            </div>
                        )}
                        <div className="pt-2">
                             <label className="block text-xs font-medium text-gray-500 mb-1">File URL</label>
                             <div className="flex gap-2">
                                 <input 
                                    readOnly 
                                    value={`${API_URL}${selectedFile?.file_url}`}
                                    className="flex-1 bg-gray-800 border-gray-700 rounded text-xs text-gray-300 px-2 py-1"
                                 />
                                 <button 
                                    onClick={() => copyToClipboard(`${API_URL}${selectedFile?.file_url}`)}
                                    className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                                 >
                                    Copy
                                 </button>
                             </div>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <a 
                            href={`${API_URL}${selectedFile?.file_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center"
                        >
                            Open in new tab
                        </a>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Media;
