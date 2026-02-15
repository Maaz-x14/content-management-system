import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type { CreateUserDto, UpdateUserDto } from '../services/user.service';
import type { User, Role } from '../types/auth.types';
import { Loader2, Plus, Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod'; // Unused
// import { z } from 'zod'; // Unused
import Modal from '../components/Modal';
// import { clsx } from 'clsx'; // Unused

// Schema for create/edit user
// const userSchema = ...

// const userSchema = z.object({...}); // Removed unused
// type UserFormData = object; // Placeholder or remove

const Users: React.FC = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);

    const { data: usersData, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users', page, search],
        queryFn: () => userService.getAll({ page, limit: 10, search }),
    });

    const { data: rolesData } = useQuery({
        queryKey: ['roles'],
        queryFn: userService.getRoles,
    });

    const roles = (Array.isArray(rolesData?.data) ? rolesData.data : []) as Role[];
    // Sometimes response shape: { success: true, data: [...] } or just array if service handles it. 
    // userService.getRoles returns response.data which is { success: true, data: [...] }
    
    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateUserDto) => userService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User created successfully');
            setIsCreateOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) => userService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User updated successfully');
            setEditUser(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => userService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    });

    const handleCreateSubmit = (data: any) => {
        // Validation handled by form, ensure password provided
        if (!data.password) {
            toast.error('Password is required for new users');
            return;
        }
        createMutation.mutate(data);
    };

    const handleUpdateSubmit = (data: any) => {
        if (!editUser) return;
        // Only include fields that changed? Or all fields.
        // For update, password is not required.
        const updateData: UpdateUserDto = {
            email: data.email,
            fullName: data.fullName,
            roleId: Number(data.roleId),
        };
        updateMutation.mutate({ id: editUser.id, data: updateData });
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Users</h1>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                    </button>
                </div>
            </div>

            {isLoadingUsers ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {usersData?.data?.map((user: User) => (
                                    <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                        {user.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-white">{user.fullName}</div>
                                                    <div className="text-sm text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900/30 text-blue-300 border border-blue-800">
                                                {user.role?.name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.isActive ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-800">
                                                    <XCircle className="w-3 h-3 mr-1" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => setEditUser(user)}
                                                className="text-indigo-400 hover:text-indigo-300 mr-4 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            {usersData?.pagination && (
                <div className="flex justify-center mt-4 gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-gray-400">
                        Page {page} of {usersData.pagination.pages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(usersData.pagination.pages, p + 1))}
                        disabled={page === usersData.pagination.pages}
                        className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Create Modal */}
            <UserFormModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateSubmit}
                title="Create User"
                roles={roles}
            />

            {/* Edit Modal */}
            {editUser && (
                <UserFormModal
                    isOpen={!!editUser}
                    onClose={() => setEditUser(null)}
                    onSubmit={handleUpdateSubmit}
                    title="Edit User"
                    roles={roles}
                    defaultValues={{
                        fullName: editUser.fullName,
                        email: editUser.email,
                        roleId: editUser.roleId || editUser.role?.id,
                        // No password for edit default
                    }}
                    isEdit
                />
            )}
        </div>
    );
};

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    title: string;
    roles: Role[];
    defaultValues?: any;
    isEdit?: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, title, roles, defaultValues, isEdit }) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: defaultValues || { roleId: roles[0]?.id },
    });

    useEffect(() => {
        if (isOpen) {
            reset(defaultValues || { 
                fullName: '', 
                email: '', 
                roleId: roles[0]?.id,
                password: '' 
            });
        }
    }, [isOpen, defaultValues, reset, roles]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Full Name</label>
                    <input
                        {...register('fullName', { required: 'Full name is required' })}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message as string}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400">Email</label>
                    <input
                        {...register('email', { required: 'Email is required' })}
                        type="email"
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400">Role</label>
                    <select
                        {...register('roleId', { required: 'Role is required' })}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                </div>

                {!isEdit && (
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Password</label>
                        <input
                            {...register('password', { required: 'Password is required' })}
                            type="password"
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEdit ? 'Update' : 'Create')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default Users;
