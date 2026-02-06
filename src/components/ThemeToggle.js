'use client';

import { useTheme } from '@/context/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const { theme, resolvedTheme, setTheme } = useTheme();

    // Cycle through: system -> light -> dark -> system
    const cycleTheme = () => {
        const order = ['system', 'light', 'dark'];
        const currentIndex = order.indexOf(theme);
        const nextIndex = (currentIndex + 1) % order.length;
        setTheme(order[nextIndex]);
    };

    // Get icon based on current theme
    const getIcon = () => {
        if (theme === 'system') return '💻';
        if (theme === 'light') return '☀️';
        return '🌙';
    };

    const getLabel = () => {
        if (theme === 'system') return `System (${resolvedTheme})`;
        if (theme === 'light') return 'Light';
        return 'Dark';
    };

    return (
        <div className={styles.themeToggle}>
            {/* Single toggle button that cycles */}
            <button
                className={styles.toggleButton}
                onClick={cycleTheme}
                title={`Theme: ${getLabel()} - Click to change`}
                aria-label={`Current theme: ${getLabel()}. Click to cycle theme.`}
            >
                <span className={styles.icon}>{getIcon()}</span>
                <span className={styles.label}>{theme === 'system' ? 'Auto' : theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
            </button>

            {/* Alternative: Three button toggle */}
            <div className={styles.buttonGroup}>
                {[
                    { value: 'light', icon: '☀️' },
                    { value: 'system', icon: '💻' },
                    { value: 'dark', icon: '🌙' }
                ].map(({ value, icon }) => (
                    <button
                        key={value}
                        className={`${styles.themeBtn} ${theme === value ? styles.active : ''}`}
                        onClick={() => setTheme(value)}
                        title={value.charAt(0).toUpperCase() + value.slice(1)}
                    >
                        {icon}
                    </button>
                ))}
            </div>
        </div>
    );
}
