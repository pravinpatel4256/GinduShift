'use client';

import { useState } from 'react';
import styles from './FilterPanel.module.css';

export default function FilterPanel({ onFilter, initialFilters = {} }) {
    const [filters, setFilters] = useState({
        location: initialFilters.location || '',
        minRate: initialFilters.minRate || '',
        maxRate: initialFilters.maxRate || '',
        minDuration: initialFilters.minDuration || '',
        maxDuration: initialFilters.maxDuration || '',
        startDate: initialFilters.startDate || '',
        endDate: initialFilters.endDate || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convert string values to numbers where needed
        const processedFilters = {
            ...filters,
            minRate: filters.minRate ? Number(filters.minRate) : null,
            maxRate: filters.maxRate ? Number(filters.maxRate) : null,
            minDuration: filters.minDuration ? Number(filters.minDuration) : null,
            maxDuration: filters.maxDuration ? Number(filters.maxDuration) : null
        };
        onFilter?.(processedFilters);
    };

    const handleClear = () => {
        const clearedFilters = {
            location: '',
            minRate: '',
            maxRate: '',
            minDuration: '',
            maxDuration: '',
            startDate: '',
            endDate: ''
        };
        setFilters(clearedFilters);
        onFilter?.({});
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Filters
                </h3>
                <button type="button" onClick={handleClear} className={styles.clearBtn}>
                    Clear All
                </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.filterGroup}>
                    <label className={styles.label}>Location</label>
                    <input
                        type="text"
                        name="location"
                        value={filters.location}
                        onChange={handleChange}
                        placeholder="City or address..."
                        className={styles.input}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.label}>Hourly Rate ($)</label>
                    <div className={styles.rangeInputs}>
                        <input
                            type="number"
                            name="minRate"
                            value={filters.minRate}
                            onChange={handleChange}
                            placeholder="Min"
                            min="0"
                            className={styles.input}
                        />
                        <span className={styles.rangeSeparator}>to</span>
                        <input
                            type="number"
                            name="maxRate"
                            value={filters.maxRate}
                            onChange={handleChange}
                            placeholder="Max"
                            min="0"
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.label}>Total Hours</label>
                    <div className={styles.rangeInputs}>
                        <input
                            type="number"
                            name="minDuration"
                            value={filters.minDuration}
                            onChange={handleChange}
                            placeholder="Min"
                            min="0"
                            className={styles.input}
                        />
                        <span className={styles.rangeSeparator}>to</span>
                        <input
                            type="number"
                            name="maxDuration"
                            value={filters.maxDuration}
                            onChange={handleChange}
                            placeholder="Max"
                            min="0"
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.label}>Date Range</label>
                    <div className={styles.rangeInputs}>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleChange}
                            className={styles.input}
                        />
                        <span className={styles.rangeSeparator}>to</span>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                </div>

                <button type="submit" className={styles.searchBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Search Shifts
                </button>
            </form>
        </div>
    );
}
