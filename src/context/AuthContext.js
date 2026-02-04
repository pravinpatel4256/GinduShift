'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getUserByEmail, getUserById } from '@/lib/dataStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved session
        const savedUserId = localStorage.getItem('locum_user_id');
        if (savedUserId) {
            const userData = getUserById(savedUserId);
            if (userData) {
                setUser(userData);
            }
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        const userData = getUserByEmail(email);
        if (userData && userData.password === password) {
            setUser(userData);
            localStorage.setItem('locum_user_id', userData.id);
            return { success: true, user: userData };
        }
        return { success: false, error: 'Invalid email or password' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('locum_user_id');
    };

    const refreshUser = () => {
        if (user) {
            const updatedUser = getUserById(user.id);
            if (updatedUser) {
                setUser(updatedUser);
            }
        }
    };

    const isVerified = () => {
        if (user?.role !== 'pharmacist') return true;
        return user?.verificationStatus === 'verified';
    };

    const value = {
        user,
        loading,
        login,
        logout,
        refreshUser,
        isVerified,
        isAdmin: user?.role === 'admin',
        isOwner: user?.role === 'owner',
        isPharmacist: user?.role === 'pharmacist'
    };

    return (
        <AuthContext.Provider value={value}>
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
