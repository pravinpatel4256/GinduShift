'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function AdminTrackingPage() {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('active'); // 'active', 'upcoming', 'completed', 'all'

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
            fetchAssignments();
        }
    }, [user, loading, isAdmin, router]);

    const fetchAssignments = async () => {
        try {
            // Fetch all approved applications (shifts that have been filled)
            const response = await fetch('/api/applications?status=approved');
            if (response.ok) {
                const data = await response.json();
                setAssignments(data);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredAssignments = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return assignments.filter(assignment => {
            const startDate = new Date(assignment.shift.startDate);
            const endDate = new Date(assignment.shift.endDate);

            switch (filter) {
                case 'active':
                    return startDate <= today && endDate >= today;
                case 'upcoming':
                    return startDate > today;
                case 'completed':
                    return endDate < today;
                default:
                    return true;
            }
        });
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusBadge = (assignment) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(assignment.shift.startDate);
        const endDate = new Date(assignment.shift.endDate);

        if (startDate <= today && endDate >= today) {
            return <span className={`${styles.badge} ${styles.badgeActive}`}>🔴 Active Now</span>;
        } else if (startDate > today) {
            const daysUntil = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
            return <span className={`${styles.badge} ${styles.badgeUpcoming}`}>📅 In {daysUntil} days</span>;
        } else {
            return <span className={`${styles.badge} ${styles.badgeCompleted}`}>✅ Completed</span>;
        }
    };

    if (loading || !user) {
        return (
            <div className={styles.loadingContainer}>
                <div className="spinner"></div>
            </div>
        );
    }

    const filteredAssignments = getFilteredAssignments();

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Link href="/admin" className={styles.backLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Dashboard
                </Link>

                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            Pharmacist Tracking
                        </h1>
                        <p className={styles.subtitle}>Monitor active and upcoming pharmacist assignments</p>
                    </div>
                </header>

                {/* Filter Tabs */}
                <div className={styles.filterTabs}>
                    {[
                        { value: 'active', label: 'Active Now', icon: '🔴' },
                        { value: 'upcoming', label: 'Upcoming', icon: '📅' },
                        { value: 'completed', label: 'Completed', icon: '✅' },
                        { value: 'all', label: 'All', icon: '📋' }
                    ].map(tab => (
                        <button
                            key={tab.value}
                            className={`${styles.filterTab} ${filter === tab.value ? styles.active : ''}`}
                            onClick={() => setFilter(tab.value)}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Stats Row */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>
                            {assignments.filter(a => {
                                const today = new Date();
                                const start = new Date(a.shift.startDate);
                                const end = new Date(a.shift.endDate);
                                return start <= today && end >= today;
                            }).length}
                        </div>
                        <div className={styles.statLabel}>Active Today</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>
                            {assignments.filter(a => new Date(a.shift.startDate) > new Date()).length}
                        </div>
                        <div className={styles.statLabel}>Upcoming</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{assignments.length}</div>
                        <div className={styles.statLabel}>Total Assignments</div>
                    </div>
                </div>

                {/* Assignments List */}
                {isLoading ? (
                    <div className={styles.loading}>
                        <div className="spinner"></div>
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className={styles.emptyState}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <h3>No {filter !== 'all' ? filter : ''} assignments found</h3>
                        <p>Assignments will appear here when pharmacists are approved for shifts.</p>
                    </div>
                ) : (
                    <div className={styles.assignmentsList}>
                        {filteredAssignments.map(assignment => (
                            <div key={assignment.id} className={styles.assignmentCard}>
                                <div className={styles.cardHeader}>
                                    {getStatusBadge(assignment)}
                                    <span className={styles.assignmentDate}>
                                        Assigned {formatDate(assignment.appliedAt)}
                                    </span>
                                </div>

                                <div className={styles.cardBody}>
                                    <div className={styles.pharmacistInfo}>
                                        <div className={styles.avatar}>
                                            {assignment.pharmacist?.image ? (
                                                <img src={assignment.pharmacist.image} alt="" />
                                            ) : (
                                                <span>{assignment.pharmacist?.name?.charAt(0) || '?'}</span>
                                            )}
                                        </div>
                                        <div className={styles.pharmacistDetails}>
                                            <h3>{assignment.pharmacist?.name}</h3>
                                            <p>{assignment.pharmacist?.email}</p>
                                            {assignment.pharmacist?.phone && (
                                                <p className={styles.phone}>📞 {assignment.pharmacist.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.divider}></div>

                                    <div className={styles.shiftInfo}>
                                        <div className={styles.shiftHeader}>
                                            <h4>{assignment.shift.pharmacyName}</h4>
                                        </div>
                                        <div className={styles.shiftDetails}>
                                            <div className={styles.detailItem}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                    <circle cx="12" cy="10" r="3"></circle>
                                                </svg>
                                                <span>{assignment.shift.location}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                                <span>{formatDate(assignment.shift.startDate)} - {formatDate(assignment.shift.endDate)}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <polyline points="12 6 12 12 16 14"></polyline>
                                                </svg>
                                                <span>{assignment.shift.startTime} - {assignment.shift.endTime}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                                </svg>
                                                <span>${assignment.shift.hourlyRate}/hr • {assignment.shift.totalHours} total hours</span>
                                            </div>
                                        </div>

                                        {/* Benefits */}
                                        {(assignment.shift.accommodationProvided || assignment.shift.mileageAllowance) && (
                                            <div className={styles.benefits}>
                                                {assignment.shift.accommodationProvided && (
                                                    <span className={styles.benefitBadge}>
                                                        🏨 Accommodation
                                                    </span>
                                                )}
                                                {assignment.shift.mileageAllowance && (
                                                    <span className={styles.benefitBadge}>
                                                        🚗 Mileage: ${assignment.shift.mileageRate}/mi
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
