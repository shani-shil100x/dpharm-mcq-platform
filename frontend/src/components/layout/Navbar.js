'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { LogOut, User, LayoutDashboard, BrainCircuit, Upload, Menu, X, Home, TrendingUp, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <BrainCircuit className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                D.Pharm<span className="text-emerald-600 dark:text-emerald-400">MCQ</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-20" />
            ) : user ? (
              <>
                <Link href="/" className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors font-medium text-sm">
                  <Home className="h-4 w-4 mr-1.5" /> Subjects
                </Link>
                <Link href="/progress" className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors font-medium text-sm">
                  <TrendingUp className="h-4 w-4 mr-1.5" /> Progress
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin/bulk-upload" className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors font-medium text-sm">
                    <Upload className="h-4 w-4 mr-1.5" /> Upload MCQs
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors font-medium text-sm"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-1.5" /> Admin Panel
                  </Link>
                )}
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Logout">
                  <LogOut className="h-5 w-5" />
                </button>
                {mounted && (
                  <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors" title="Toggle Theme">
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {mounted && (
                  <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors" title="Toggle Theme">
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>
                )}
                <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm px-3 py-2">Log in</Link>
                <Link href="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          {!loading && (
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-lg transition-colors duration-300">
          <div className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 mb-2">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Link href="/" onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-sm">
                  <Home className="h-5 w-5" /> Practice Subjects
                </Link>
                <Link href="/progress" onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-sm">
                  <TrendingUp className="h-5 w-5" /> Progress History
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin/dashboard" onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-sm">
                    <LayoutDashboard className="h-5 w-5" /> Admin Panel
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin/bulk-upload" onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-sm">
                    <Upload className="h-5 w-5" /> Upload MCQs
                  </Link>
                )}
                <button onClick={() => { logout(); closeMobile(); }} className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium text-sm w-full">
                  <LogOut className="h-5 w-5" /> Logout
                </button>
                {mounted && (
                  <button onClick={() => { toggleTheme(); closeMobile(); }} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-sm w-full">
                    {theme === 'dark' ? <><Sun className="h-5 w-5" /> Light Mode</> : <><Moon className="h-5 w-5" /> Dark Mode</>}
                  </button>
                )}
              </>
            ) : (
              <>
                {mounted && (
                  <button onClick={() => { toggleTheme(); closeMobile(); }} className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-sm border border-gray-200 w-full mb-2">
                    {theme === 'dark' ? <><Sun className="h-4 w-4" /> Light Mode</> : <><Moon className="h-4 w-4" /> Dark Mode</>}
                  </button>
                )}
                <Link href="/login" onClick={closeMobile} className="block px-3 py-3 text-center rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm border border-gray-200">Log in</Link>
                <Link href="/register" onClick={closeMobile} className="block px-3 py-3 text-center rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
