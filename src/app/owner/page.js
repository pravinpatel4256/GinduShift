'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { PLATFORM_FEE_PERCENTAGE, calculateOwnerCost } from '@/lib/dataStore';
import ShiftCard from '@/components/ShiftCard';
import StatusBadge from '@/components/StatusBadge';
import styles from './page.module.css';

export default function OwnerDashboard() {
    const { user, loading, isOwner } = useAuth();
    const router = useRouter();
    const [shifts, setShifts] = useState([]);
    const [applications, setApplications] = useState([]);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }
        if (!loading && !isOwner) {
            router.push('/');
            return;
        }
        if (user) {
            loadData();
        }
    }, [user, loading, isOwner, router]);

    const loadData = async () => {
        try {
            const [shiftsRes, applicationsRes] = await Promise.all([
                fetch(`/api/shifts?ownerId=${user.id}`),
                fetch(`/api/applications?ownerId=${user.id}`)
            ]);

            if (shiftsRes.ok) {
                setShifts(await shiftsRes.json());
            }
            if (applicationsRes.ok) {
                setApplications(await applicationsRes.json());
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleApplicationAction = async (applicationId, status) => {
        setUpdating(applicationId);
        try {
            const response = await fetch(`/api/applications/${applicationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                await loadData();
            }
        } catch (error) {
            console.error('Error updating application:', error);
        } finally {
            setUpdating(null);
        }
    };

    const pendingApplications = applications.filter(a => a.status === 'pending');
    const openShifts = shifts.filter(s => s.status === 'open');
    const filledShifts = shifts.filter(s => s.status === 'filled');

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
                        <h1 className={styles.title}>Welcome, {user.pharmacyName || user.name}</h1>
                        <p className={styles.subtitle}>Manage your shifts and review applications</p>
                    </div>
                    <Link href="/owner/post-shift" className={styles.postBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Post New Shift
                    </Link>
                </header>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{shifts.length}</span>
                            <span className={styles.statLabel}>Total Shifts</span>
                        </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.primary}`}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{openShifts.length}</span>
                            <span className={styles.statLabel}>Open Shifts</span>
                        </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.warning}`}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{pendingApplications.length}</span>
                            <span className={styles.statLabel}>Pending Applications</span>
                        </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.success}`}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{filledShifts.length}</span>
                            <span className={styles.statLabel}>Filled Shifts</span>
                        </div>
                    </div>
                </div>

                {/* Pending Applications Section */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            Pending Applications
                            {pendingApplications.length > 0 && (
                                <span className={styles.badge}>{pendingApplications.length}</span>
                            )}
                        </h2>
                    </div>

                    {pendingApplications.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <p>No pending applications</p>
                        </div>
                    ) : (
                        <div className={styles.applicationsList}>
                            {pendingApplications.map((app) => (
                                <div key={app.id} className={styles.applicationCard}>
                                    <div className={styles.applicationInfo}>
                                        <div className={styles.applicantInfo}>
                                            <div className={styles.avatar}>
                                                {app.pharmacist?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <h4>{app.pharmacist?.name || 'Unknown'}</h4>
                                                <p>{app.pharmacist?.email}</p>
                                                <div className={styles.applicantMeta}>
                                                    <span>{app.pharmacist?.yearsExperience || 0} years exp.</span>
                                                    <span>License: {app.pharmacist?.licenseNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.shiftInfo}>
                                            <span className={styles.shiftLabel}>Applied for:</span>
                                            <span className={styles.shiftDate}>
                                                {app.shift?.startDate} • ${app.shift?.hourlyRate}/hr
                                            </span>
                                            <span className={styles.shiftLocation}>{app.shift?.location}</span>
                                        </div>
                                    </div>
                                    <div className={styles.applicationActions}>
                                        <button
                                            className={`${styles.btn} ${styles.btnSuccess}`}
                                            onClick={() => handleApplicationAction(app.id, 'approved')}
                                            disabled={updating === app.id}
                                        >
                                            {updating === app.id ? 'Processing...' : 'Approve'}
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.btnDanger}`}
                                            onClick={() => handleApplicationAction(app.id, 'rejected')}
                                            disabled={updating === app.id}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Your Shifts Section */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Your Shifts</h2>
                    </div>

                    {shifts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <h3>No shifts posted yet</h3>
                            <p>Post your first shift to start receiving applications.</p>
                            <Link href="/owner/post-shift" className={styles.emptyStateBtn}>
                                Post a Shift
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.shiftsGrid}>
                            {shifts.map((shift) => (
                                <ShiftCard
                                    key={shift.id}
                                    shift={shift}
                                    viewMode="owner"
                                    applicationCount={applications.filter(a => a.shiftId === shift.id).length}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
