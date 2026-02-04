'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    getPharmacists,
    updateUserVerification,
    getAdminStats
} from '@/lib/dataStore';
import StatusBadge from '@/components/StatusBadge';
import styles from './page.module.css';

export default function AdminDashboard() {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const [pharmacists, setPharmacists] = useState([]);
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, verified, rejected

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }
        if (!loading && !isAdmin) {
            router.push('/');
            return;
        }
        loadData();
    }, [user, loading, isAdmin, router]);

    const loadData = () => {
        setPharmacists(getPharmacists());
        setStats(getAdminStats());
    };

    const handleVerify = (pharmacistId) => {
        updateUserVerification(pharmacistId, 'verified');
        loadData();
    };

    const handleReject = (pharmacistId) => {
        updateUserVerification(pharmacistId, 'rejected');
        loadData();
    };

    const filteredPharmacists = pharmacists.filter(p => {
        if (filter === 'all') return true;
        return p.verificationStatus === filter;
    });

    if (loading || !user) {
        return (
            <div className={styles.loadingContainer}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Admin Dashboard</h1>
                        <p className={styles.subtitle}>Manage pharmacist verifications and platform oversight</p>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats?.totalPharmacists || 0}</span>
                            <span className={styles.statLabel}>Total Pharmacists</span>
                        </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.pending}`}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats?.pendingVerifications || 0}</span>
                            <span className={styles.statLabel}>Pending Verifications</span>
                        </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.verified}`}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats?.verifiedPharmacists || 0}</span>
                            <span className={styles.statLabel}>Verified Pharmacists</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats?.totalOwners || 0}</span>
                            <span className={styles.statLabel}>Pharmacy Owners</span>
                        </div>
                    </div>
                </div>

                {/* Pharmacist Verification Section */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Pharmacist Verification</h2>
                        <div className={styles.filterTabs}>
                            <button
                                className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All ({pharmacists.length})
                            </button>
                            <button
                                className={`${styles.filterTab} ${filter === 'pending' ? styles.active : ''}`}
                                onClick={() => setFilter('pending')}
                            >
                                Pending ({pharmacists.filter(p => p.verificationStatus === 'pending').length})
                            </button>
                            <button
                                className={`${styles.filterTab} ${filter === 'verified' ? styles.active : ''}`}
                                onClick={() => setFilter('verified')}
                            >
                                Verified ({pharmacists.filter(p => p.verificationStatus === 'verified').length})
                            </button>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        {filteredPharmacists.length === 0 ? (
                            <div className={styles.emptyState}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <h3>No pharmacists found</h3>
                                <p>No pharmacists match the selected filter</p>
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>License #</th>
                                        <th>Experience</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPharmacists.map((pharmacist) => (
                                        <tr key={pharmacist.id}>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <div className={styles.avatar}>
                                                        {pharmacist.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className={styles.userName}>{pharmacist.name}</span>
                                                        {pharmacist.specialties && (
                                                            <span className={styles.specialties}>
                                                                {pharmacist.specialties.join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{pharmacist.email}</td>
                                            <td>
                                                <code className={styles.licenseNumber}>{pharmacist.licenseNumber}</code>
                                            </td>
                                            <td>{pharmacist.yearsExperience} years</td>
                                            <td>
                                                <StatusBadge status={pharmacist.verificationStatus} />
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    {pharmacist.verificationStatus === 'pending' && (
                                                        <>
                                                            <button
                                                                className={`${styles.actionBtn} ${styles.verifyBtn}`}
                                                                onClick={() => handleVerify(pharmacist.id)}
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                                </svg>
                                                                Verify
                                                            </button>
                                                            <button
                                                                className={`${styles.actionBtn} ${styles.rejectBtn}`}
                                                                onClick={() => handleReject(pharmacist.id)}
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                                </svg>
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {pharmacist.verificationStatus === 'verified' && (
                                                        <span className={styles.verifiedLabel}>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                            </svg>
                                                            License Verified
                                                        </span>
                                                    )}
                                                    {pharmacist.verificationStatus === 'rejected' && (
                                                        <button
                                                            className={`${styles.actionBtn} ${styles.verifyBtn}`}
                                                            onClick={() => handleVerify(pharmacist.id)}
                                                        >
                                                            Re-verify
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
