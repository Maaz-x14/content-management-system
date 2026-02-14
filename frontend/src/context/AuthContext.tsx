import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import type { AuthState, AuthUser } from '../types/auth.types';

interface AuthContextType extends AuthState {
    login: (maxAttempts?: number) => void; // Placeholder
    logout: () => void;
    checkAuth: () => Promise<void>;
    setAuthInfo: (token: string, refreshToken: string, user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: localStorage.getItem('token'),
        isAuthenticated: false,
        isLoading: true,
    });

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, user: null }));
            return;
        }

        try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
                // Determine role string from response which might be object or string
                const userData = response.data.data;
                const role = typeof userData.role === 'object' ? userData.role.slug : userData.role;
                
                setState({
                    user: { ...userData, role },
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                logout();
            }
        } catch (error) {
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
        window.location.href = '/login';
    };

    // We expose a setAuth method or handle login in the Login component and just update state here?
    // Better to have login function here but it takes credentials.
    // For now, let's expose a method to manually update state after login call in component.
    // Actually, let's just make checkAuth available, and component calls api.login() then checkAuth().
    // Or providing a `setAuthInfo` method.
    
    // Let's implement full login here? No, keep it simple. Components call API.
    
    // But we need a way to update state after login.
    const setAuthInfo = (token: string, refreshToken: string, user: AuthUser) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        const role = typeof user.role === 'object' ? (user.role as any).slug : user.role;
        setState({
            user: { ...user, role },
            token,
            isAuthenticated: true,
            isLoading: false,
        });
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login: () => {}, logout, checkAuth, setAuthInfo } as any}>
            {children}
        </AuthContext.Provider>
    );
};
