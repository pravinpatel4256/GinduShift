'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const savedUser = localStorage.getItem('locum_user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            // Refresh user data from server
            refreshUser(parsedUser.id);
        } else {
            setLoading(false);
        }
    }, []);

    const refreshUser = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                localStorage.setItem('locum_user', JSON.stringify(userData));
            } else {
                // User not found, clear session
                localStorage.removeItem('locum_user');
                setUser(null);
            }
        } catch (error) {
            console.error('Error refreshing user:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                return { error: data.error || 'Login failed' };
            }

            setUser(data);
            localStorage.setItem('locum_user', JSON.stringify(data));
            return { success: true, user: data };
        } catch (error) {
            console.error('Login error:', error);
            return { error: 'Connection error. Please try again.' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('locum_user');
    };

    const isAdmin = user?.role === 'admin';
    const isOwner = user?.role === 'owner';
    const isPharmacist = user?.role === 'pharmacist';
    const isVerified = () => user?.verificationStatus === 'verified';

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            refreshUser: () => user && refreshUser(user.id),
            isAdmin,
            isOwner,
            isPharmacist,
            isVerified
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
