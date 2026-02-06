'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('dark'); // 'light' or 'dark'
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            setTheme(savedTheme);
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            // Apply theme to document
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }, [theme, mounted]);

    const setThemeMode = (newTheme) => {
        if (newTheme === 'light' || newTheme === 'dark') {
            setTheme(newTheme);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
