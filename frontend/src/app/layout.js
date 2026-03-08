import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f172a',
};

export const metadata = {
  title: 'D.Pharm MCQ Practice',
  description: 'Practice MCQs for D.Pharm 1st Year. Subject-wise tests, timer, and automated results.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DPharmMCQ',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.className} bg-slate-900 text-slate-50 min-h-screen flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow w-full">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
