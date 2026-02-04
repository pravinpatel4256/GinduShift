'use client';

import styles from './StatusBadge.module.css';

const statusConfig = {
    // Verification statuses
    verified: { label: 'Verified', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    rejected: { label: 'Rejected', variant: 'danger' },

    // Application statuses
    applied: { label: 'Applied', variant: 'info' },
    approved: { label: 'Approved', variant: 'success' },
    withdrawn: { label: 'Withdrawn', variant: 'neutral' },

    // Shift statuses
    open: { label: 'Open', variant: 'success' },
    filled: { label: 'Filled', variant: 'info' },
    cancelled: { label: 'Cancelled', variant: 'danger' }
};

export default function StatusBadge({ status, customLabel }) {
    const config = statusConfig[status] || { label: status, variant: 'neutral' };

    return (
        <span className={`${styles.badge} ${styles[config.variant]}`}>
            {customLabel || config.label}
        </span>
    );
}
