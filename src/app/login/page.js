'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

// Demo accounts for easy testing
const demoAccounts = [
    {
        email: 'admin@locumtenens.com',
        password: 'admin123',
        role: 'Admin',
        description: 'Verify pharmacist licenses',
        icon: '🛡️'
    },
    {
        email: 'owner1@pharmacy.com',
        password: 'owner123',
        role: 'Pharmacy Owner',
        description: 'Post shifts & approve applicants',
        icon: '🏥'
    },
    {
        email: 'pharmacist1@email.com',
        password: 'pharm123',
        role: 'Pharmacist (Verified)',
        description: 'Search & apply for shifts',
        icon: '✅'
    },
    {
        email: 'pharmacist2@email.com',
        password: 'pharm123',
        role: 'Pharmacist (Pending)',
        description: 'Cannot apply until verified',
        icon: '⏳'
    }
];

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = login(email, password);

        setTimeout(() => {
            setIsLoading(false);
            if (result.success) {
                switch (result.user.role) {
                    case 'admin':
                        router.push('/admin');
                        break;
                    case 'owner':
                        router.push('/owner');
                        break;
                    case 'pharmacist':
                        router.push('/pharmacist');
                        break;
                    default:
                        router.push('/');
                }
            } else {
                setError(result.error);
            }
        }, 500);
    };

    const handleDemoLogin = (account) => {
        setEmail(account.email);
        setPassword(account.password);
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.formSection}>
                    <Link href="/" className={styles.backLink}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back to Home
                    </Link>

                    <div className={styles.formHeader}>
                        <h1 className={styles.title}>Welcome Back</h1>
                        <p className={styles.subtitle}>Sign in to access your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.error}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className={styles.input}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className={styles.demoSection}>
                    <h2 className={styles.demoTitle}>Demo Accounts</h2>
                    <p className={styles.demoSubtitle}>Click any account to auto-fill credentials</p>

                    <div className={styles.demoGrid}>
                        {demoAccounts.map((account, index) => (
                            <button
                                key={index}
                                onClick={() => handleDemoLogin(account)}
                                className={styles.demoCard}
                            >
                                <span className={styles.demoIcon}>{account.icon}</span>
                                <div className={styles.demoInfo}>
                                    <span className={styles.demoRole}>{account.role}</span>
                                    <span className={styles.demoDesc}>{account.description}</span>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.demoArrow}>
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        ))}
                    </div>

                    <div className={styles.demoNote}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <span>This is a demo with in-memory data. Changes reset on page refresh.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
