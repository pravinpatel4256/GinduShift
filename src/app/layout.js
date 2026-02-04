import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'LocumConnect - Pharmacy Staffing Platform',
    description: 'Connect pharmacy owners with licensed pharmacists for temporary shifts. Find locum tenens opportunities or hire qualified pharmacists today.',
    keywords: 'pharmacy, locum tenens, pharmacist jobs, pharmacy staffing, healthcare staffing',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <Navigation />
                    <main>{children}</main>
                </AuthProvider>
            </body>
        </html>
    );
}
