import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'D.Pharm MCQ Practice',
  description: 'Practice MCQs for D.Pharm 1st Year. Subject-wise tests, timer, and automated results.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-900 text-slate-50 min-h-screen flex flex-col`} suppressHydrationWarning>
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
