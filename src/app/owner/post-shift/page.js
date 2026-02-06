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
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '17:00',
        hoursPerDay: 8,
        hourlyRate: 60,
        location: '',
        description: '',
        requirements: '',
        // Accommodation & Travel
        accommodationProvided: false,
        accommodationDetails: '',
        mileageAllowance: false,
        mileageRate: ''
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
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                (name === 'hourlyRate' || name === 'hoursPerDay' || name === 'mileageRate') ? Number(value) : value
        }));
    };

    useEffect(() => {
        if (formData.startTime && formData.endTime) {
            const [startH, startM] = formData.startTime.split(':').map(Number);
            const [endH, endM] = formData.endTime.split(':').map(Number);
            let hours = (endH - startH) + (endM - startM) / 60;
            if (hours <= 0) hours += 24; // Handle overnight or invalid

            // Round to 2 decimal places
            hours = Math.round(hours * 100) / 100;

            setFormData(prev => ({ ...prev, hoursPerDay: hours }));
        }
    }, [formData.startTime, formData.endTime]);

    const calculateTotalHours = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return days * formData.hoursPerDay;
    };

    const totalHours = calculateTotalHours();

    // Rate Logic: Input is Owner Rate. Pharmacist Rate = Owner Rate - 20.
    const ownerRate = Number(formData.hourlyRate) || 0;
    const pharmacistRate = Math.max(0, ownerRate - 20); // Default rule
    const platformFeePerHr = 20;

    const totalPharmacistEarnings = pharmacistRate * totalHours;
    const totalOwnerCost = ownerRate * totalHours;
    const totalPlatformFee = platformFeePerHr * totalHours;

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
            ownerRate: ownerRate,           // Save Owner Rate
            hourlyRate: pharmacistRate,     // Save Pharmacist Rate (calculated)
            totalHours: totalHours,
            description: formData.description,
            requirements: requirementsArray,
            // Accommodation & Travel
            accommodationProvided: formData.accommodationProvided,
            accommodationDetails: formData.accommodationDetails || null,
            mileageAllowance: formData.mileageAllowance,
            mileageRate: formData.mileageRate ? Number(formData.mileageRate) : null
        };

        try {
            const response = await fetch('/api/shifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shiftData)
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/owner');
            } else {
                console.error('Failed to create shift:', data);
                setError(data.error || 'Failed to create shift. Please try again.');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Error creating shift:', error);
            setError('Network error. Please check your connection and try again.');
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
                            {/* Error Display */}
                            {error && (
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '10px',
                                    color: '#ef4444',
                                    marginBottom: '1rem'
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}
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
                                    <label className={styles.label}>Your Offer Rate ($/hr)</label>
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
                                        Total rate you will pay per hour
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

                            {/* Accommodation & Travel Benefits */}
                            <div className={styles.formGroup}>
                                <h3 className={styles.groupTitle}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                    Travel & Accommodation Benefits
                                </h3>

                                {/* Accommodation Toggle */}
                                <div className={styles.toggleGroup}>
                                    <label className={styles.toggleLabel}>
                                        <input
                                            type="checkbox"
                                            name="accommodationProvided"
                                            checked={formData.accommodationProvided}
                                            onChange={handleChange}
                                            className={styles.checkbox}
                                        />
                                        <span className={styles.toggleText}>
                                            <strong>Accommodation Provided</strong>
                                            <span>Will you provide lodging or cover accommodation expenses?</span>
                                        </span>
                                    </label>
                                    {formData.accommodationProvided && (
                                        <div className={styles.conditionalInput}>
                                            <input
                                                type="text"
                                                name="accommodationDetails"
                                                value={formData.accommodationDetails}
                                                onChange={handleChange}
                                                placeholder="e.g., Hotel provided, $150/night allowance, Staff housing available"
                                                className={styles.input}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Mileage Toggle */}
                                <div className={styles.toggleGroup}>
                                    <label className={styles.toggleLabel}>
                                        <input
                                            type="checkbox"
                                            name="mileageAllowance"
                                            checked={formData.mileageAllowance}
                                            onChange={handleChange}
                                            className={styles.checkbox}
                                        />
                                        <span className={styles.toggleText}>
                                            <strong>Mileage/Travel Allowance</strong>
                                            <span>Will you reimburse travel expenses?</span>
                                        </span>
                                    </label>
                                    {formData.mileageAllowance && (
                                        <div className={styles.conditionalInput}>
                                            <div className={styles.rateInput}>
                                                <span className={styles.ratePrefix}>$</span>
                                                <input
                                                    type="number"
                                                    name="mileageRate"
                                                    value={formData.mileageRate}
                                                    onChange={handleChange}
                                                    placeholder="0.67"
                                                    step="0.01"
                                                    min="0"
                                                    className={styles.input}
                                                />
                                                <span className={styles.rateSuffix}>per mile</span>
                                            </div>
                                        </div>
                                    )}
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
                                <div className={`${styles.summaryRow} ${styles.highlight}`}>
                                    <span>Your Offer Rate</span>
                                    <span>${ownerRate.toFixed(2)}/hr</span>
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
                                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                                    <span>Your Total Cost</span>
                                    <span>${totalOwnerCost.toLocaleString()}</span>
                                </div>
                            </div>



                            <div className={styles.approvalNote}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <span>All shifts require admin approval before becoming visible to pharmacists.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
