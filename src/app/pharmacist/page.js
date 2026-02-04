'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    getApplicationsByPharmacist,
    getEnrichedApplications
} from '@/lib/dataStore';
import StatusBadge from '@/components/StatusBadge';
import styles from './page.module.css';

export default function PharmacistDashboard() {
    const { user, loading, isPharmacist, isVerified } = useAuth();
    const router = useRouter();
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }
        if (!loading && !isPharmacist) {
            router.push('/');
            return;
        }
        if (user) {
            loadData();
        }
    }, [user, loading, isPharmacist, router]);

    const loadData = () => {
        const apps = getApplicationsByPharmacist(user.id);
        setApplications(getEnrichedApplications(apps));
    };

    const pendingApplications = applications.filter(a => a.status === 'pending');
    const approvedApplications = applications.filter(a => a.status === 'approved');
    const rejectedApplications = applications.filter(a => a.status === 'rejected');

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

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
                        <h1 className={styles.title}>Welcome, {user.name}</h1>
                        <p className={styles.subtitle}>Track your shift applications and manage your profile</p>
                    </div>
                    <Link href="/pharmacist/search" className={styles.searchBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        Find Shifts
                    </Link>
                </header>

                {/* Verification Banner */}
                {!isVerified() && (
                    <div className={styles.verificationBanner}>
                        <div className={styles.bannerIcon}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <div className={styles.bannerContent}>
                            <h3>License Verification Pending</h3>
                            <p>Your license is currently under review. You'll be able to apply for shifts once verified by our admin team.</p>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{applications.length}</span>
                            <span className={styles.statLabel}>Total Applications</span>
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
                            <span className={styles.statValue}>{pendingApplications.length}</span>
                            <span className={styles.statLabel}>Pending</span>
                        </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.approved}`}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{approvedApplications.length}</span>
                            <span className={styles.statLabel}>Approved</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>
                                {user.verificationStatus === 'verified' ? '✓' : '○'}
                            </span>
                            <span className={styles.statLabel}>
                                {user.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Profile Card */}
                <div className={styles.profileCard}>
                    <div className={styles.profileHeader}>
                        <div className={styles.avatar}>
                            {user.name.charAt(0)}
                        </div>
                        <div className={styles.profileInfo}>
                            <h3>{user.name}</h3>
                            <p>{user.email}</p>
                        </div>
                        <StatusBadge status={user.verificationStatus} />
                    </div>
                    <div className={styles.profileDetails}>
                        <div className={styles.profileItem}>
                            <span className={styles.profileLabel}>License #</span>
                            <span className={styles.profileValue}>{user.licenseNumber}</span>
                        </div>
                        <div className={styles.profileItem}>
                            <span className={styles.profileLabel}>Experience</span>
                            <span className={styles.profileValue}>{user.yearsExperience} years</span>
                        </div>
                        <div className={styles.profileItem}>
                            <span className={styles.profileLabel}>Specialties</span>
                            <div className={styles.specialties}>
                                {user.specialties?.map((s, i) => (
                                    <span key={i} className={styles.specialty}>{s}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applications Section */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>My Applications</h2>
                    </div>

                    {applications.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <h3>No applications yet</h3>
                            <p>Start applying to shifts to see your applications here.</p>
                            <Link href="/pharmacist/search" className={styles.emptyStateBtn}>
                                Find Shifts
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.applicationsList}>
                            {applications.map((app) => (
                                <div key={app.id} className={styles.applicationCard}>
                                    <div className={styles.applicationMain}>
                                        <div className={styles.shiftInfo}>
                                            <h4>{app.shift?.pharmacyName || 'Unknown Pharmacy'}</h4>
                                            <p className={styles.shiftLocation}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                    <circle cx="12" cy="10" r="3"></circle>
                                                </svg>
                                                {app.shift?.location || 'Location not specified'}
                                            </p>
                                        </div>
                                        <div className={styles.shiftDetails}>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Date</span>
                                                <span className={styles.detailValue}>
                                                    {app.shift?.startDate === app.shift?.endDate
                                                        ? formatDate(app.shift?.startDate)
                                                        : `${formatDate(app.shift?.startDate)} - ${formatDate(app.shift?.endDate)}`
                                                    }
                                                </span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Rate</span>
                                                <span className={styles.detailValue}>${app.shift?.hourlyRate}/hr</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Hours</span>
                                                <span className={styles.detailValue}>{app.shift?.totalHours} hrs</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.applicationFooter}>
                                        <span className={styles.applicationDate}>
                                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                                        </span>
                                        <StatusBadge status={app.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
