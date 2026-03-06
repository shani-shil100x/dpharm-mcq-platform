'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UploadCloud, Loader2 } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Bulk Upload MCQ', href: '/admin/bulk-upload', icon: UploadCloud },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="w-full md:w-64 shrink-0">
        <nav className="space-y-2 bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
            Admin Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-900/30 text-emerald-400'
                    : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : 'text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
