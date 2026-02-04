'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            // Redirect logged-in users to their dashboard
            switch (user.role) {
                case 'admin':
                    router.push('/admin');
                    break;
                case 'owner':
                    router.push('/owner');
                    break;
                case 'pharmacist':
                    router.push('/pharmacist');
                    break;
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (user) {
        return (
            <div className={styles.loadingContainer}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.badge}>
                        <span className={styles.badgeDot}></span>
                        Trusted by 500+ Pharmacies
                    </div>
                    <h1 className={styles.heroTitle}>
                        Connect with Top Pharmacy
                        <span className={styles.gradientText}> Talent Instantly</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        LocumConnect bridges the gap between pharmacy owners seeking reliable coverage
                        and licensed pharmacists looking for flexible opportunities.
                    </p>
                    <div className={styles.heroCTA}>
                        <Link href="/login" className={styles.primaryBtn}>
                            Get Started
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </Link>
                        <Link href="/login" className={styles.secondaryBtn}>
                            View Demo Accounts
                        </Link>
                    </div>
                </div>
                <div className={styles.heroVisual}>
                    <div className={styles.floatingCard} style={{ top: '10%', left: '10%' }}>
                        <div className={styles.cardIcon}>💊</div>
                        <div className={styles.cardLabel}>Pharmacy Shifts</div>
                        <div className={styles.cardValue}>2,400+</div>
                    </div>
                    <div className={styles.floatingCard} style={{ top: '30%', right: '5%' }}>
                        <div className={styles.cardIcon}>👨‍⚕️</div>
                        <div className={styles.cardLabel}>Verified Pharmacists</div>
                        <div className={styles.cardValue}>850+</div>
                    </div>
                    <div className={styles.floatingCard} style={{ bottom: '20%', left: '20%' }}>
                        <div className={styles.cardIcon}>🏥</div>
                        <div className={styles.cardLabel}>Partner Pharmacies</div>
                        <div className={styles.cardValue}>500+</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>How It Works</h2>
                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="8.5" cy="7" r="4"></circle>
                                    <line x1="20" y1="8" x2="20" y2="14"></line>
                                    <line x1="23" y1="11" x2="17" y2="11"></line>
                                </svg>
                            </div>
                            <h3>For Pharmacy Owners</h3>
                            <p>Post shifts with detailed requirements. Review applicant profiles and approve the best fit for your pharmacy.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </div>
                            <h3>For Pharmacists</h3>
                            <p>Search available shifts by location, rate, and schedule. Apply with one click after admin verification.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    <polyline points="9 12 12 15 16 10"></polyline>
                                </svg>
                            </div>
                            <h3>Verified & Secure</h3>
                            <p>All pharmacists undergo license verification. Platform admin ensures quality and compliance.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className={styles.pricing}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Transparent Pricing</h2>
                    <p className={styles.pricingSubtitle}>
                        Simple fee structure with no hidden costs
                    </p>
                    <div className={styles.pricingCard}>
                        <div className={styles.pricingExample}>
                            <div className={styles.pricingRow}>
                                <span>Pharmacist Rate</span>
                                <span className={styles.pricingValue}>$60/hr</span>
                            </div>
                            <div className={styles.pricingRow}>
                                <span>Platform Fee (8.33%)</span>
                                <span className={styles.pricingValue}>+$5/hr</span>
                            </div>
                            <div className={`${styles.pricingRow} ${styles.pricingTotal}`}>
                                <span>Owner Pays</span>
                                <span className={styles.pricingValue}>$65/hr</span>
                            </div>
                        </div>
                        <p className={styles.pricingNote}>
                            Pharmacists receive the full listed rate. Owners see the total cost including platform fee upfront.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.container}>
                    <div className={styles.footerContent}>
                        <div className={styles.footerBrand}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                            </svg>
                            <span>LocumConnect</span>
                        </div>
                        <p className={styles.footerText}>
                            © 2026 LocumConnect. Connecting pharmacies with pharmacists.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
