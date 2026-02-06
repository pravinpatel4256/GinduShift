import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navigation from '@/components/Navigation';
import { SessionProvider } from '@/components/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'LocumConnect - Pharmacy Staffing Platform',
    description: 'Connect pharmacy owners with licensed pharmacists for temporary shifts. Find locum tenens opportunities or hire qualified pharmacists today.',
    keywords: 'pharmacy, locum tenens, pharmacist jobs, pharmacy staffing, healthcare staffing',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
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
