'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { calculateOwnerCost, PLATFORM_FEE_PERCENTAGE } from '@/lib/dataStore';
import styles from './page.module.css';

export default function PostShiftPage() {
    const { user, loading, isOwner } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '17:00',
        hoursPerDay: 8,
        hourlyRate: 60,
        location: '',
        description: '',
        requirements: ''
    });

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
            setFormData(prev => ({
                ...prev,
                location: user.address || ''
            }));
        }
    }, [user, loading, isOwner, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'hourlyRate' || name === 'hoursPerDay' ? Number(value) : value
        }));
    };

    const calculateTotalHours = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return days * formData.hoursPerDay;
    };

    const totalHours = calculateTotalHours();
    const ownerCost = calculateOwnerCost(formData.hourlyRate);
    const totalPharmacistEarnings = formData.hourlyRate * totalHours;
    const totalOwnerCost = ownerCost * totalHours;
    const platformFee = totalOwnerCost - totalPharmacistEarnings;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const requirementsArray = formData.requirements
            .split(',')
            .map(r => r.trim())
            .filter(r => r);

        const shiftData = {
            ownerId: user.id,
            location: formData.location,
            startDate: formData.startDate,
            endDate: formData.endDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            hoursPerDay: formData.hoursPerDay,
            hourlyRate: formData.hourlyRate,
            totalHours: totalHours,
            description: formData.description,
            requirements: requirementsArray
        };

        try {
            const response = await fetch('/api/shifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shiftData)
            });

            if (response.ok) {
                router.push('/owner');
            } else {
                console.error('Failed to create shift');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Error creating shift:', error);
            setIsSubmitting(false);
        }
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
                <Link href="/owner" className={styles.backLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Dashboard
                </Link>

                <div className={styles.formContainer}>
                    <div className={styles.formSection}>
                        <header className={styles.header}>
                            <h1 className={styles.title}>Post a New Shift</h1>
                            <p className={styles.subtitle}>Fill in the details to create a new shift listing</p>
                        </header>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {/* Date Range */}
                            <div className={styles.formGroup}>
                                <h3 className={styles.groupTitle}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    Date Range
                                </h3>
                                <div className={styles.row}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Start Date</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>End Date</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            min={formData.startDate}
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Time & Hours */}
                            <div className={styles.formGroup}>
                                <h3 className={styles.groupTitle}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    Time & Hours
                                </h3>
                                <div className={styles.row}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Start Time</label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>End Time</label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Hours/Day</label>
                                        <input
                                            type="number"
                                            name="hoursPerDay"
                                            value={formData.hoursPerDay}
                                            onChange={handleChange}
                                            min="1"
                                            max="24"
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className={styles.formGroup}>
                                <h3 className={styles.groupTitle}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    Location
                                </h3>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Pharmacy Address</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Enter the full address"
                                        className={styles.input}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Rate */}
                            <div className={styles.formGroup}>
                                <h3 className={styles.groupTitle}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="1" x2="12" y2="23"></line>
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                    Hourly Rate
                                </h3>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Pharmacist Rate ($/hr)</label>
                                    <input
                                        type="number"
                                        name="hourlyRate"
                                        value={formData.hourlyRate}
                                        onChange={handleChange}
                                        min="30"
                                        max="200"
                                        className={styles.input}
                                        required
                                    />
                                    <span className={styles.inputHint}>
                                        This is what the pharmacist will earn per hour
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className={styles.formGroup}>
                                <h3 className={styles.groupTitle}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                    </svg>
                                    Additional Details
                                </h3>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe the shift, expectations, and any special instructions..."
                                        className={`${styles.input} ${styles.textarea}`}
                                        rows="3"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Requirements (comma-separated)</label>
                                    <input
                                        type="text"
                                        name="requirements"
                                        value={formData.requirements}
                                        onChange={handleChange}
                                        placeholder="e.g., State license, Immunization certified, Retail experience"
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={isSubmitting || !formData.startDate || !formData.endDate}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className={styles.spinner}></span>
                                        Posting Shift...
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        Post Shift
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Cost Summary Sidebar */}
                    <div className={styles.summarySection}>
                        <div className={styles.summaryCard}>
                            <h3 className={styles.summaryTitle}>Cost Summary</h3>

                            <div className={styles.summaryDetails}>
                                <div className={styles.summaryRow}>
                                    <span>Pharmacist Rate</span>
                                    <span>${formData.hourlyRate}/hr</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Platform Fee ({PLATFORM_FEE_PERCENTAGE}%)</span>
                                    <span>${(ownerCost - formData.hourlyRate).toFixed(2)}/hr</span>
                                </div>
                                <div className={`${styles.summaryRow} ${styles.highlight}`}>
                                    <span>Your Cost</span>
                                    <span>${ownerCost.toFixed(2)}/hr</span>
                                </div>
                            </div>

                            <div className={styles.divider}></div>

                            <div className={styles.summaryDetails}>
                                <div className={styles.summaryRow}>
                                    <span>Total Hours</span>
                                    <span>{totalHours} hrs</span>
                                </div>
                            </div>

                            <div className={styles.divider}></div>

                            <div className={styles.totalSection}>
                                <div className={styles.totalRow}>
                                    <span>Pharmacist Earnings</span>
                                    <span className={styles.pharmacistTotal}>
                                        ${totalPharmacistEarnings.toLocaleString()}
                                    </span>
                                </div>
                                <div className={styles.totalRow}>
                                    <span>Platform Fee</span>
                                    <span className={styles.feeTotal}>
                                        ${platformFee.toFixed(2)}
                                    </span>
                                </div>
                                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                                    <span>Your Total Cost</span>
                                    <span>${totalOwnerCost.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className={styles.summaryNote}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                <span>Platform fee covers verification, matching, and payment processing.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
