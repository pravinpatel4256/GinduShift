'use client';

import { useTheme } from '@/context/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const themes = [
        { value: 'light', icon: '☀️', label: 'Light' },
        { value: 'dark', icon: '🌙', label: 'Dark' },
        { value: 'system', icon: '💻', label: 'System' }
    ];

    return (
        <div className={styles.themeToggle}>
            {themes.map(({ value, icon, label }) => (
                <button
                    key={value}
                    className={`${styles.themeBtn} ${theme === value ? styles.active : ''}`}
                    onClick={() => setTheme(value)}
                    title={label}
                    aria-label={`Switch to ${label} mode`}
                >
                    <span className={styles.icon}>{icon}</span>
                </button>
            ))}
        </div>
    );
}
