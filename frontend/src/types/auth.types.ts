export interface Role {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    permissions: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
}

export interface User {
    id: number;
    email: string;
    fullName: string;
    roleId: number;
    isActive: boolean;
    lastLogin: string | null;
    role?: Role;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthUser {
    id: number;
    email: string;
    fullName: string;
    role: string | { slug: string; name?: string; id?: number };
}

export interface LoginResponse {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
    };
}

export interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
