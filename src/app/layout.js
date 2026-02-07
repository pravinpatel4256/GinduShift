import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navigation from '@/components/Navigation';
import { SessionProvider } from '@/components/SessionProvider';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'GinduApp - Pharmacy Staffing Platform',
    description: 'Connect pharmacy owners with licensed pharmacists for temporary shifts. Find locum tenens opportunities or hire qualified pharmacists today.',
    keywords: 'pharmacy, locum tenens, pharmacist jobs, pharmacy staffing, healthcare staffing, GinduApp',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'GinduShift',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#6366f1',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Script
                    src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
                    strategy="lazyOnload"
                />
                <SessionProvider>
                    <ThemeProvider>
                        <AuthProvider>
                            <Navigation />
                            <main>{children}</main>
                        </AuthProvider>
                    </ThemeProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
