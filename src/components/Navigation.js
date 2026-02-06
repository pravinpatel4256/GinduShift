'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import styles from './Navigation.module.css';

export default function Navigation() {
    const { user, logout, isVerified } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const getNavLinks = () => {
        switch (user.role) {
            case 'admin':
                return [
                    { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
                    { href: '/admin/tracking', label: 'Tracking', icon: 'location' }
                ];
            case 'owner':
                return [
                    { href: '/owner', label: 'Dashboard', icon: 'dashboard' },
                    { href: '/owner/post-shift', label: 'Post Shift', icon: 'add' }
                ];
            case 'pharmacist':
                return [
                    { href: '/pharmacist', label: 'Dashboard', icon: 'dashboard' },
                    { href: '/pharmacist/search', label: 'Find Shifts', icon: 'search' }
                ];
            default:
                return [];
        }
    };

    const getRoleLabel = () => {
        switch (user.role) {
            case 'admin': return 'Administrator';
            case 'owner': return 'Pharmacy Owner';
            case 'pharmacist': return 'Pharmacist';
            default: return 'User';
        }
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'dashboard':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="9"></rect>
                        <rect x="14" y="3" width="7" height="5"></rect>
                        <rect x="14" y="12" width="7" height="9"></rect>
                        <rect x="3" y="16" width="7" height="5"></rect>
                    </svg>
                );
            case 'add':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                );
            case 'search':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                );
            case 'location':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                    </svg>
                    <span>LocumConnect</span>
                </Link>

                <div className={styles.links}>
                    {getNavLinks().map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.link} ${pathname === link.href ? styles.active : ''}`}
                        >
                            {getIcon(link.icon)}
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className={styles.userSection}>
                    <ThemeToggle />
                    {user.role === 'pharmacist' && !isVerified() && (
                        <span className={styles.verificationBadge}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            Verification Pending
                        </span>
                    )}
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userRole}>{getRoleLabel()}</span>
                    </div>
                    <button onClick={logout} className={styles.logoutBtn}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
