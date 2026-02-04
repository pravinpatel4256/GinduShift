'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    getShiftsByOwner,
    getApplicationsForOwner,
    updateApplicationStatus,
    getUserById,
    getEnrichedApplications
} from '@/lib/dataStore';
import ShiftCard from '@/components/ShiftCard';
import StatusBadge from '@/components/StatusBadge';
import styles from './page.module.css';

export default function OwnerDashboard() {
    const { user, loading, isOwner } = useAuth();
    const router = useRouter();
    const [shifts, setShifts] = useState([]);
    const [applications, setApplications] = useState([]);
    const [selectedShift, setSelectedShift] = useState(null);
    const [showApplicationsModal, setShowApplicationsModal] = useState(false);

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

    const loadData = () => {
        const ownerShifts = getShiftsByOwner(user.id);
        setShifts(ownerShifts);

        const ownerApps = getApplicationsForOwner(user.id);
        setApplications(getEnrichedApplications(ownerApps));
    };

    const handleViewApplications = (shift) => {
        setSelectedShift(shift);
        setShowApplicationsModal(true);
    };

    const handleApprove = (applicationId) => {
        updateApplicationStatus(applicationId, 'approved');
        loadData();
    };

    const handleReject = (applicationId) => {
        updateApplicationStatus(applicationId, 'rejected');
        loadData();
    };

    const getShiftApplications = (shiftId) => {
        return applications.filter(app => app.shiftId === shiftId);
    };

    const pendingApplications = applications.filter(app => app.status === 'pending');
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
                        <h1 className={styles.title}>Owner Dashboard</h1>
                        <p className={styles.subtitle}>Manage your shifts and applications for {user.pharmacyName}</p>
                    </div>
                    <Link href="/owner/post-shift" className={styles.postShiftBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                        Post New Shift
                    </Link>
                </header>

                {/* Stats Overview */}
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

                    <div className={`${styles.statCard} ${styles.open}`}>
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

                    <div className={`${styles.statCard} ${styles.pending}`}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <polyline points="17 11 19 13 23 9"></polyline>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{pendingApplications.length}</span>
                            <span className={styles.statLabel}>Pending Applications</span>
                        </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.filled}`}>
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

                {/* Pending Applications Alert */}
                {pendingApplications.length > 0 && (
                    <div className={styles.alertCard}>
                        <div className={styles.alertIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <div className={styles.alertContent}>
                            <h3>You have {pendingApplications.length} pending application{pendingApplications.length > 1 ? 's' : ''}</h3>
                            <p>Review and approve applicants to fill your shifts.</p>
                        </div>
                    </div>
                )}

                {/* My Shifts Section */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>My Posted Shifts</h2>
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
                            <p>Post your first shift to start receiving applications from verified pharmacists.</p>
                            <Link href="/owner/post-shift" className={styles.emptyStateBtn}>
                                Post a Shift
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.shiftsGrid}>
                            {shifts.map((shift) => {
                                const shiftApps = getShiftApplications(shift.id);
                                const pendingCount = shiftApps.filter(a => a.status === 'pending').length;

                                return (
                                    <div key={shift.id} className={styles.shiftWrapper}>
                                        <ShiftCard
                                            shift={shift}
                                            viewMode="owner"
                                            onViewApplications={handleViewApplications}
                                        />
                                        {pendingCount > 0 && (
                                            <div className={styles.applicationsBadge}>
                                                {pendingCount} pending application{pendingCount > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Applications Modal */}
                {showApplicationsModal && selectedShift && (
                    <div className={styles.modal} onClick={() => setShowApplicationsModal(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Applications for Shift</h2>
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setShowApplicationsModal(false)}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>

                            <div className={styles.shiftInfo}>
                                <p><strong>{selectedShift.pharmacyName}</strong></p>
                                <p>{selectedShift.startDate} • {selectedShift.startTime} - {selectedShift.endTime}</p>
                            </div>

                            <div className={styles.applicationsList}>
                                {getShiftApplications(selectedShift.id).length === 0 ? (
                                    <div className={styles.noApplications}>
                                        <p>No applications yet for this shift.</p>
                                    </div>
                                ) : (
                                    getShiftApplications(selectedShift.id).map((app) => (
                                        <div key={app.id} className={styles.applicationCard}>
                                            <div className={styles.applicantInfo}>
                                                <div className={styles.avatar}>
                                                    {app.pharmacist?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <h4>{app.pharmacist?.name || 'Unknown'}</h4>
                                                    <p>{app.pharmacist?.yearsExperience || 0} years experience</p>
                                                    {app.pharmacist?.specialties && (
                                                        <div className={styles.specialties}>
                                                            {app.pharmacist.specialties.map((s, i) => (
                                                                <span key={i} className={styles.specialty}>{s}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {app.message && (
                                                <p className={styles.applicationMessage}>"{app.message}"</p>
                                            )}

                                            <div className={styles.applicationFooter}>
                                                <StatusBadge status={app.status} />
                                                {app.status === 'pending' && (
                                                    <div className={styles.applicationActions}>
                                                        <button
                                                            className={`${styles.actionBtn} ${styles.approveBtn}`}
                                                            onClick={() => handleApprove(app.id)}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                            Approve
                                                        </button>
                                                        <button
                                                            className={`${styles.actionBtn} ${styles.rejectBtn}`}
                                                            onClick={() => handleReject(app.id)}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                                            </svg>
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
