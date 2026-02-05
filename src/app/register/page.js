'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import styles from './page.module.css';

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Check for Google OAuth data in URL
    const isGoogleSignup = searchParams.get('google') === 'true';
    const googleEmail = searchParams.get('email') || '';
    const googleName = searchParams.get('name') || '';
    const googleId = searchParams.get('googleId') || '';
    const googleImage = searchParams.get('image') || '';

    const [formData, setFormData] = useState({
        email: googleEmail,
        password: '',
        confirmPassword: '',
        name: googleName,
        role: '',
        // Pharmacist fields
        licenseNumber: '',
        yearsExperience: '',
        specialties: '',
        bio: '',
        // Owner fields
        pharmacyName: '',
        address: '',
        phone: ''
    });

    useEffect(() => {
        if (isGoogleSignup) {
            setFormData(prev => ({
                ...prev,
                email: googleEmail,
                name: googleName
            }));
        }
    }, [isGoogleSignup, googleEmail, googleName]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate
        if (!formData.role) {
            setError('Please select your account type');
            return;
        }

        if (!isGoogleSignup && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!isGoogleSignup && formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const userData = {
                email: formData.email,
                name: formData.name,
                role: formData.role,
                password: isGoogleSignup ? null : formData.password,
                googleId: isGoogleSignup ? googleId : null,
                image: isGoogleSignup ? googleImage : null
            };

            // Add role-specific fields
            if (formData.role === 'pharmacist') {
                userData.licenseNumber = formData.licenseNumber;
                userData.yearsExperience = parseInt(formData.yearsExperience) || 0;
                userData.specialties = formData.specialties.split(',').map(s => s.trim()).filter(s => s);
                userData.bio = formData.bio;
            } else if (formData.role === 'owner') {
                userData.pharmacyName = formData.pharmacyName;
                userData.address = formData.address;
                userData.phone = formData.phone;
            }

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Registration failed');
                setIsLoading(false);
                return;
            }

            setSuccess('Account created successfully! Redirecting...');

            // For Google signup, sign in automatically
            if (isGoogleSignup) {
                await signIn('google', { callbackUrl: formData.role === 'owner' ? '/owner' : '/pharmacist' });
            } else {
                // Redirect to login
                setTimeout(() => {
                    router.push('/login');
                }, 1500);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setIsGoogleLoading(true);
        try {
            await signIn('google', { callbackUrl: '/register' });
        } catch (err) {
            console.error('Google sign-up error:', err);
            setError('Failed to sign up with Google');
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Link href="/login" className={styles.backLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Login
                </Link>

                <div className={styles.formHeader}>
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>
                        {isGoogleSignup
                            ? 'Complete your profile to get started'
                            : 'Join GinduShift to find or post pharmacy shifts'}
                    </p>
                </div>

                {!isGoogleSignup && (
                    <>
                        <button
                            onClick={handleGoogleSignUp}
                            className={styles.googleBtn}
                            disabled={isGoogleLoading}
                        >
                            {isGoogleLoading ? (
                                <span className={styles.spinner}></span>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            {isGoogleLoading ? 'Connecting...' : 'Sign up with Google'}
                        </button>

                        <div className={styles.divider}>
                            <span>or register with email</span>
                        </div>
                    </>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className={styles.success}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            {success}
                        </div>
                    )}

                    {/* Role Selection */}
                    <div className={styles.roleSection}>
                        <label className={styles.label}>I am a...</label>
                        <div className={styles.roleGrid}>
                            <button
                                type="button"
                                className={`${styles.roleCard} ${formData.role === 'pharmacist' ? styles.roleActive : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, role: 'pharmacist' }))}
                            >
                                <span className={styles.roleIcon}>💊</span>
                                <span className={styles.roleTitle}>Pharmacist</span>
                                <span className={styles.roleDesc}>Looking for shifts</span>
                            </button>
                            <button
                                type="button"
                                className={`${styles.roleCard} ${formData.role === 'owner' ? styles.roleActive : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, role: 'owner' }))}
                            >
                                <span className={styles.roleIcon}>🏥</span>
                                <span className={styles.roleTitle}>Pharmacy Owner</span>
                                <span className={styles.roleDesc}>Hiring pharmacists</span>
                            </button>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className={styles.fieldGroup}>
                        <h3 className={styles.groupTitle}>Account Information</h3>

                        <div className={styles.inputGroup}>
                            <label htmlFor="name" className={styles.label}>Full Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className={styles.input}
                                required
                                disabled={isGoogleSignup}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>Email Address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className={styles.input}
                                required
                                disabled={isGoogleSignup}
                            />
                        </div>

                        {!isGoogleSignup && (
                            <>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="password" className={styles.label}>Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a password (min 6 characters)"
                                        className={styles.input}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm your password"
                                        className={styles.input}
                                        required
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pharmacist-specific fields */}
                    {formData.role === 'pharmacist' && (
                        <div className={styles.fieldGroup}>
                            <h3 className={styles.groupTitle}>Professional Information</h3>

                            <div className={styles.inputGroup}>
                                <label htmlFor="licenseNumber" className={styles.label}>License Number</label>
                                <input
                                    id="licenseNumber"
                                    type="text"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleChange}
                                    placeholder="e.g., MA-RPH-12345"
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="yearsExperience" className={styles.label}>Years of Experience</label>
                                <input
                                    id="yearsExperience"
                                    type="number"
                                    name="yearsExperience"
                                    value={formData.yearsExperience}
                                    onChange={handleChange}
                                    placeholder="e.g., 5"
                                    className={styles.input}
                                    min="0"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="specialties" className={styles.label}>Specialties (comma-separated)</label>
                                <input
                                    id="specialties"
                                    type="text"
                                    name="specialties"
                                    value={formData.specialties}
                                    onChange={handleChange}
                                    placeholder="e.g., Retail, Compounding, Hospital"
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="bio" className={styles.label}>Short Bio</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us about your experience..."
                                    className={`${styles.input} ${styles.textarea}`}
                                    rows="3"
                                />
                            </div>

                            <div className={styles.infoNote}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                <span>Your license will be verified by our admin team before you can apply for shifts.</span>
                            </div>
                        </div>
                    )}

                    {/* Owner-specific fields */}
                    {formData.role === 'owner' && (
                        <div className={styles.fieldGroup}>
                            <h3 className={styles.groupTitle}>Pharmacy Information</h3>

                            <div className={styles.inputGroup}>
                                <label htmlFor="pharmacyName" className={styles.label}>Pharmacy Name</label>
                                <input
                                    id="pharmacyName"
                                    type="text"
                                    name="pharmacyName"
                                    value={formData.pharmacyName}
                                    onChange={handleChange}
                                    placeholder="e.g., Main Street Pharmacy"
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="address" className={styles.label}>Address</label>
                                <input
                                    id="address"
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="e.g., 123 Main St, Boston, MA 02101"
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="phone" className={styles.label}>Phone Number</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="e.g., (617) 555-0123"
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading || !formData.role}
                    >
                        {isLoading ? (
                            <>
                                <span className={styles.spinner}></span>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Create Account
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                <p className={styles.loginLink}>
                    Already have an account? <Link href="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className={styles.loadingContainer}><div className={styles.spinner}></div></div>}>
            <RegisterContent />
        </Suspense>
    );
}
