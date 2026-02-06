'use client';

import { calculateOwnerCost, PLATFORM_FEE_PERCENTAGE } from '@/lib/dataStore';
import StatusBadge from './StatusBadge';
import styles from './ShiftCard.module.css';

export default function ShiftCard({
    shift,
    viewMode = 'pharmacist', // 'pharmacist', 'owner', 'admin'
    onApply,
    onViewApplications,
    isVerified = true,
    hasApplied = false,
    applicationStatus = null
}) {
    const ownerCost = shift.ownerRate || calculateOwnerCost(shift.hourlyRate);
    const totalPharmacistEarnings = shift.hourlyRate * shift.totalHours;
    const totalOwnerCost = ownerCost * shift.totalHours;
    const platformFee = ownerCost - shift.hourlyRate;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDateRange = () => {
        if (shift.startDate === shift.endDate) {
            return formatDate(shift.startDate);
        }
        return `${formatDate(shift.startDate)} - ${formatDate(shift.endDate)}`;
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.pharmacyInfo}>
                    <h3 className={styles.pharmacyName}>{shift.pharmacyName}</h3>
                    <p className={styles.location}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {shift.location}
                    </p>
                </div>
                <StatusBadge status={shift.status} />
            </div>

            <div className={styles.details}>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Date</span>
                    <span className={styles.detailValue}>{getDateRange()}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Time</span>
                    <span className={styles.detailValue}>{shift.startTime} - {shift.endTime}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Total Hours</span>
                    <span className={styles.detailValue}>{shift.totalHours} hrs</span>
                </div>
            </div>

            {shift.description && (
                <p className={styles.description}>{shift.description}</p>
            )}

            {shift.requirements && shift.requirements.length > 0 && (
                <div className={styles.requirements}>
                    {shift.requirements.map((req, index) => (
                        <span key={index} className={styles.requirementTag}>{req}</span>
                    ))}
                </div>
            )}

            <div className={styles.rateSection}>
                {viewMode === 'pharmacist' && (
                    <div className={styles.rateDisplay}>
                        <div className={styles.mainRate}>
                            <span className={styles.rateAmount}>${shift.hourlyRate}</span>
                            <span className={styles.rateLabel}>/hr</span>
                        </div>
                        <div className={styles.totalEarnings}>
                            Total: <strong>${totalPharmacistEarnings.toLocaleString()}</strong>
                        </div>
                    </div>
                )}

                {viewMode === 'owner' && (
                    <div className={styles.ownerRateDisplay}>
                        <div className={styles.rateBreakdown}>
                            <div className={styles.breakdownRow}>
                                <span>Pharmacist Rate:</span>
                                <span>${shift.hourlyRate}/hr</span>
                            </div>
                            <div className={styles.breakdownRow}>
                                <span>Platform Fee:</span>
                                <span>${platformFee.toFixed(2)}/hr</span>
                            </div>
                            <div className={`${styles.breakdownRow} ${styles.totalRow}`}>
                                <span>Your Cost:</span>
                                <span>${ownerCost.toFixed(2)}/hr</span>
                            </div>
                        </div>
                        <div className={styles.grandTotal}>
                            Total Cost: <strong>${totalOwnerCost.toLocaleString()}</strong>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                {viewMode === 'pharmacist' && (
                    <>
                        {applicationStatus ? (
                            <div className={styles.applicationStatus}>
                                <span>Application Status:</span>
                                <StatusBadge status={applicationStatus} />
                            </div>
                        ) : !isVerified ? (
                            <button className={`${styles.button} ${styles.disabled}`} disabled>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                Verification Pending
                            </button>
                        ) : hasApplied ? (
                            <button className={`${styles.button} ${styles.applied}`} disabled>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Applied
                            </button>
                        ) : (
                            <button
                                className={`${styles.button} ${styles.primary}`}
                                onClick={() => onApply?.(shift)}
                            >
                                Apply Now
                            </button>
                        )}
                    </>
                )}

                {viewMode === 'owner' && (
                    <button
                        className={`${styles.button} ${styles.secondary}`}
                        onClick={() => onViewApplications?.(shift)}
                    >
                        View Applications
                    </button>
                )}
            </div>
        </div>
    );
}
