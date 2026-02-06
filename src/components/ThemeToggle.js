'use client';

import { useTheme } from '@/context/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    // Simple toggle between light and dark
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const isLight = theme === 'light';

    return (
        <button
            className={styles.toggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
            title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
        >
            <span className={`${styles.slider} ${isLight ? styles.light : styles.dark}`}>
                <span className={styles.icon}>
                    {isLight ? '☀️' : '🌙'}
                </span>
            </span>
        </button>
    );
}
