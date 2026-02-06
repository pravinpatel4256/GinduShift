'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If NextAuth session exists, use it
        if (status === 'authenticated' && session?.user) {
            setUser({
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role,
                image: session.user.image,
                verificationStatus: session.user.verificationStatus
            });
            setLoading(false);
        } else if (status === 'unauthenticated') {
            // Check for legacy localStorage session (email/password login)
            const savedUser = localStorage.getItem('locum_user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                refreshUser(parsedUser.id);
            } else {
                setUser(null);
                setLoading(false);
            }
        } else if (status === 'loading') {
            setLoading(true);
        }
    }, [session, status]);

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

    const logout = async () => {
        // Clear both NextAuth session and localStorage
        setUser(null);
        localStorage.removeItem('locum_user');
        // Sign out from NextAuth (for Google sessions)
        await nextAuthSignOut({ redirect: false });
    };

    const isAdmin = user?.role === 'admin';
    const isOwner = user?.role === 'owner';
    const isPharmacist = user?.role === 'pharmacist';
    const isVerified = () => user?.verificationStatus === 'verified';

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            status, // Expose NextAuth status for debugging
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
