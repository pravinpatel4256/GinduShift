'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    searchShifts,
    createApplication,
    getApplicationsByPharmacist
} from '@/lib/dataStore';
import ShiftCard from '@/components/ShiftCard';
import FilterPanel from '@/components/FilterPanel';
import styles from './page.module.css';

export default function ShiftSearchPage() {
    const { user, loading, isPharmacist, isVerified } = useAuth();
    const router = useRouter();
    const [shifts, setShifts] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [isApplying, setIsApplying] = useState(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

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

    const loadData = (filters = {}) => {
        setShifts(searchShifts(filters));
        setMyApplications(getApplicationsByPharmacist(user.id));
    };

    const handleFilter = (filters) => {
        loadData(filters);
    };

    const handleApply = async (shift) => {
        if (!isVerified()) {
            showToast('You must be verified to apply for shifts.');
            return;
        }

        setIsApplying(shift.id);

        const result = createApplication({
            shiftId: shift.id,
            pharmacistId: user.id,
            message: 'I am interested in this position and available for the specified dates.'
        });

        setTimeout(() => {
            setIsApplying(null);

            if (result.error) {
                showToast(result.error);
            } else {
                showToast('Application submitted successfully!');
                loadData();
            }
        }, 500);
    };

    const showToast = (message) => {
        setToastMessage(message);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    };

    const hasApplied = (shiftId) => {
        return myApplications.some(app => app.shiftId === shiftId);
    };

    const getApplicationStatus = (shiftId) => {
        const app = myApplications.find(a => a.shiftId === shiftId);
        return app?.status || null;
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
                <Link href="/pharmacist" className={styles.backLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Dashboard
                </Link>

                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Find Shifts</h1>
                        <p className={styles.subtitle}>
                            Browse and apply for available pharmacy shifts
                        </p>
                    </div>
                    <div className={styles.headerStats}>
                        <div className={styles.statBadge}>
                            <span className={styles.statNumber}>{shifts.length}</span>
                            <span>shifts available</span>
                        </div>
                    </div>
                </header>

                {/* Verification Warning */}
                {!isVerified() && (
                    <div className={styles.warningBanner}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <div>
                            <strong>Verification Required</strong>
                            <span>Your license is pending verification. You cannot apply for shifts until approved by admin.</span>
                        </div>
                    </div>
                )}

                <div className={styles.content}>
                    {/* Filter Sidebar */}
                    <aside className={styles.sidebar}>
                        <FilterPanel onFilter={handleFilter} />
                    </aside>

                    {/* Results Grid */}
                    <main className={styles.results}>
                        {shifts.length === 0 ? (
                            <div className={styles.emptyState}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <h3>No shifts found</h3>
                                <p>Try adjusting your filters or check back later for new opportunities.</p>
                            </div>
                        ) : (
                            <div className={styles.shiftsGrid}>
                                {shifts.map((shift) => (
                                    <div key={shift.id} className={styles.shiftWrapper}>
                                        <ShiftCard
                                            shift={shift}
                                            viewMode="pharmacist"
                                            isVerified={isVerified()}
                                            hasApplied={hasApplied(shift.id)}
                                            applicationStatus={getApplicationStatus(shift.id)}
                                            onApply={handleApply}
                                        />
                                        {isApplying === shift.id && (
                                            <div className={styles.applyingOverlay}>
                                                <div className="spinner"></div>
                                                <span>Submitting...</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Toast Notification */}
            {showSuccessToast && (
                <div className={styles.toast}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
