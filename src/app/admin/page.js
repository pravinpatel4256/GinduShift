'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PLATFORM_FEE_PERCENTAGE, calculateOwnerCost } from '@/lib/dataStore';
import StatusBadge from '@/components/StatusBadge';
import styles from './page.module.css';

export default function AdminDashboard() {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const [pharmacists, setPharmacists] = useState([]);
    const [pendingShifts, setPendingShifts] = useState([]);
    const [stats, setStats] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [activeTab, setActiveTab] = useState('pharmacists');
    const [rejectNotes, setRejectNotes] = useState({});
    const [modifiedRates, setModifiedRates] = useState({});

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }
        if (!loading && !isAdmin) {
            router.push('/');
            return;
        }
        if (user) {
            loadData();
        }
    }, [user, loading, isAdmin, router]);

    const loadData = async () => {
        try {
            const [pharmacistsRes, statsRes, shiftsRes] = await Promise.all([
                fetch('/api/users?role=pharmacist'),
                fetch('/api/users?stats=admin'),
                fetch('/api/shifts?status=pending_review')
            ]);

            if (pharmacistsRes.ok) {
                setPharmacists(await pharmacistsRes.json());
            }
            if (statsRes.ok) {
                setStats(await statsRes.json());
            }
            if (shiftsRes.ok) {
                setPendingShifts(await shiftsRes.json());
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleVerification = async (pharmacistId, status) => {
        setUpdating(pharmacistId);
        try {
            const response = await fetch(`/api/users/${pharmacistId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verificationStatus: status })
            });

            if (response.ok) {
                await loadData();
            }
        } catch (error) {
            console.error('Error updating verification:', error);
        } finally {
            setUpdating(null);
        }
    };

    const handleShiftAction = async (shiftId, action) => {
        if (action === 'reject' && !rejectNotes[shiftId]) {
            alert('Please provide a reason for rejection');
            return;
        }

        setUpdating(shiftId);
        try {
            const response = await fetch(`/api/shifts/${shiftId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    adminNotes: rejectNotes[shiftId] || null,
                    hourlyRate: action === 'approve' ? (modifiedRates[shiftId] || undefined) : undefined
                })
            });

            if (response.ok) {
                await loadData();
                setRejectNotes(prev => ({ ...prev, [shiftId]: '' }));
            }
        } catch (error) {
            console.error('Error updating shift:', error);
        } finally {
            setUpdating(null);
        }
    };

    const pendingPharmacists = pharmacists.filter(p => p.verificationStatus === 'pending');
    const verifiedPharmacists = pharmacists.filter(p => p.verificationStatus === 'verified');

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
                        <p className={styles.subtitle}>Manage pharmacist verifications and shift approvals</p>
                    </div>
                </header>

                {/* Stats Grid */}
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

                    <div className={`${styles.statCard} ${styles.warning}`}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats?.pendingVerifications || 0}</span>
                            <span className={styles.statLabel}>Pending Verification</span>
                        </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.info}`}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats?.pendingReviewShifts || 0}</span>
                            <span className={styles.statLabel}>Shifts To Review</span>
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
                            <span className={styles.statValue}>{stats?.openShifts || 0}</span>
                            <span className={styles.statLabel}>Active Shifts</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'pharmacists' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('pharmacists')}
                    >
                        Pharmacist Verifications
                        {pendingPharmacists.length > 0 && (
                            <span className={styles.tabBadge}>{pendingPharmacists.length}</span>
                        )}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'shifts' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('shifts')}
                    >
                        Shift Approvals
                        {pendingShifts.length > 0 && (
                            <span className={styles.tabBadge}>{pendingShifts.length}</span>
                        )}
                    </button>
                </div>

                {/* Pharmacist Verifications Tab */}
                {activeTab === 'pharmacists' && (
                    <>
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    Pending Verifications
                                </h2>
                            </div>

                            {pendingPharmacists.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <p>All pharmacists are verified!</p>
                                </div>
                            ) : (
                                <div className={styles.pharmacistList}>
                                    {pendingPharmacists.map((pharmacist) => (
                                        <div key={pharmacist.id} className={styles.pharmacistCard}>
                                            <div className={styles.pharmacistInfo}>
                                                <div className={styles.avatar}>
                                                    {pharmacist.name.charAt(0)}
                                                </div>
                                                <div className={styles.details}>
                                                    <h3>{pharmacist.name}</h3>
                                                    <p>{pharmacist.email}</p>
                                                    <div className={styles.meta}>
                                                        <span>License: {pharmacist.licenseNumber}</span>
                                                        <span>{pharmacist.yearsExperience} years exp.</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.actions}>
                                                <button
                                                    className={`${styles.btn} ${styles.btnSuccess}`}
                                                    onClick={() => handleVerification(pharmacist.id, 'verified')}
                                                    disabled={updating === pharmacist.id}
                                                >
                                                    {updating === pharmacist.id ? 'Verifying...' : 'Verify'}
                                                </button>
                                                <button
                                                    className={`${styles.btn} ${styles.btnDanger}`}
                                                    onClick={() => handleVerification(pharmacist.id, 'rejected')}
                                                    disabled={updating === pharmacist.id}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Verified Pharmacists</h2>
                            </div>

                            {verifiedPharmacists.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>No verified pharmacists yet</p>
                                </div>
                            ) : (
                                <div className={styles.pharmacistList}>
                                    {verifiedPharmacists.map((pharmacist) => (
                                        <div key={pharmacist.id} className={styles.pharmacistCard}>
                                            <div className={styles.pharmacistInfo}>
                                                <div className={`${styles.avatar} ${styles.verified}`}>
                                                    {pharmacist.name.charAt(0)}
                                                </div>
                                                <div className={styles.details}>
                                                    <h3>{pharmacist.name}</h3>
                                                    <p>{pharmacist.email}</p>
                                                    <div className={styles.meta}>
                                                        <span>License: {pharmacist.licenseNumber}</span>
                                                        <span>{pharmacist.yearsExperience} years exp.</span>
                                                        {pharmacist.specialties?.map((s, i) => (
                                                            <span key={i} className={styles.specialty}>{s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <StatusBadge status="verified" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}

                {/* Shift Approvals Tab */}
                {activeTab === 'shifts' && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                Shifts Pending Review
                            </h2>
                        </div>

                        {pendingShifts.length === 0 ? (
                            <div className={styles.emptyState}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <p>All shifts have been reviewed!</p>
                            </div>
                        ) : (
                            <div className={styles.shiftsList}>
                                {pendingShifts.map((shift) => (
                                    <div key={shift.id} className={styles.shiftCard}>
                                        <div className={styles.shiftHeader}>
                                            <div>
                                                <h3>{shift.pharmacyName}</h3>
                                                <p className={styles.shiftLocation}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                        <circle cx="12" cy="10" r="3"></circle>
                                                    </svg>
                                                    {shift.location}
                                                </p>
                                            </div>
                                            <StatusBadge status="pending" />
                                        </div>

                                        <div className={styles.shiftDetails}>
                                            <div className={styles.shiftDetail}>
                                                <span className={styles.shiftLabel}>Date</span>
                                                <span>{shift.startDate} to {shift.endDate}</span>
                                            </div>
                                            <div className={styles.shiftDetail}>
                                                <span className={styles.shiftLabel}>Time</span>
                                                <span>{shift.startTime} - {shift.endTime}</span>
                                            </div>
                                            <div className={styles.shiftDetail}>
                                                <span className={styles.shiftLabel}>Owner Pay</span>
                                                <span>${shift.ownerRate ? shift.ownerRate : (shift.hourlyRate + 20)}/hr</span>
                                            </div>
                                            <div className={styles.shiftDetail}>
                                                <span className={styles.shiftLabel}>Pharm Rate</span>
                                                <div className={styles.inputWrapper}>
                                                    <input
                                                        type="number"
                                                        value={modifiedRates[shift.id] ?? shift.hourlyRate}
                                                        onChange={(e) => setModifiedRates(prev => ({ ...prev, [shift.id]: Number(e.target.value) }))}
                                                        className={styles.rateInput}
                                                    />
                                                    <svg
                                                        className={styles.editIcon}
                                                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                                    >
                                                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className={styles.shiftDetail}>
                                                <span className={styles.shiftLabel}>Total Hours</span>
                                                <span>{shift.totalHours} hrs</span>
                                            </div>
                                        </div>

                                        {shift.description && (
                                            <p className={styles.shiftDescription}>{shift.description}</p>
                                        )}

                                        {shift.requirements?.length > 0 && (
                                            <div className={styles.shiftRequirements}>
                                                {shift.requirements.map((req, i) => (
                                                    <span key={i} className={styles.requirement}>{req}</span>
                                                ))}
                                            </div>
                                        )}

                                        <div className={styles.shiftOwner}>
                                            Posted by: <strong>{shift.owner?.name || 'Unknown'}</strong>
                                        </div>

                                        <div className={styles.shiftActions}>
                                            <button
                                                className={`${styles.btn} ${styles.btnSuccess}`}
                                                onClick={() => handleShiftAction(shift.id, 'approve')}
                                                disabled={updating === shift.id}
                                            >
                                                {updating === shift.id ? 'Processing...' : '✓ Approve'}
                                            </button>
                                            <div className={styles.rejectSection}>
                                                <input
                                                    type="text"
                                                    placeholder="Rejection reason..."
                                                    value={rejectNotes[shift.id] || ''}
                                                    onChange={(e) => setRejectNotes(prev => ({ ...prev, [shift.id]: e.target.value }))}
                                                    className={styles.rejectInput}
                                                />
                                                <button
                                                    className={`${styles.btn} ${styles.btnDanger}`}
                                                    onClick={() => handleShiftAction(shift.id, 'reject')}
                                                    disabled={updating === shift.id}
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}
