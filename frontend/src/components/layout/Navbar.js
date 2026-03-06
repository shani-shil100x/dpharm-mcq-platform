'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, LayoutDashboard, BrainCircuit, Upload, Menu, X, Home, TrendingUp, Youtube } from 'lucide-react';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-slate-900 shadow-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-emerald-900/30 rounded-lg group-hover:bg-emerald-900/50 transition-colors">
                <BrainCircuit className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                D.Pharm<span className="text-emerald-400">MCQ</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-20" />
            ) : user ? (
              <>
                <Link href="/" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors font-medium text-sm">
                  <Home className="h-4 w-4 mr-1.5" /> Subjects
                </Link>
                <Link href="/progress" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors font-medium text-sm">
                  <TrendingUp className="h-4 w-4 mr-1.5" /> Progress
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin/bulk-upload" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors font-medium text-sm">
                    <Upload className="h-4 w-4 mr-1.5" /> Upload MCQs
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors font-medium text-sm"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-1.5" /> Admin Panel
                  </Link>
                )}
                <a href="https://www.youtube.com/@user-rb8dk1xe3y" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-300 hover:text-red-500 transition-colors font-medium text-sm">
                  <Youtube className="h-4 w-4 mr-1.5" /> YouTube
                </a>
                <div className="h-6 w-px bg-slate-700"></div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-900/40 flex items-center justify-center">
                    <User className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-200">{user.name}</span>
                </div>
                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-full" title="Logout">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-gray-300 hover:text-white font-medium text-sm px-3 py-2">Log in</Link>
                <Link href="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          {!loading && (
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-400 hover:bg-slate-800 rounded-lg">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-800 mb-2">
                  <div className="h-10 w-10 rounded-full bg-emerald-900/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <Link href="/" onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-emerald-900/20 hover:text-emerald-400 font-medium text-sm">
                  <Home className="h-5 w-5" /> Practice Subjects
                </Link>
                <Link href="/progress" onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-emerald-900/20 hover:text-emerald-400 font-medium text-sm">
                  <TrendingUp className="h-5 w-5" /> Progress History
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin/dashboard" onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-emerald-900/20 hover:text-emerald-400 font-medium text-sm">
                    <LayoutDashboard className="h-5 w-5" /> Admin Panel
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin/bulk-upload" onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-emerald-900/20 hover:text-emerald-400 font-medium text-sm">
                    <Upload className="h-5 w-5" /> Upload MCQs
                  </Link>
                )}
                <a href="https://www.youtube.com/@user-rb8dk1xe3y" target="_blank" rel="noopener noreferrer" onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-red-900/20 hover:text-red-500 font-medium text-sm">
                  <Youtube className="h-5 w-5" /> YouTube Playlist
                </a>
                <button onClick={() => { logout(); closeMobile(); }} className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-500 hover:bg-red-900/20 font-medium text-sm w-full">
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMobile} className="flex items-center w-full px-3 py-3 text-center justify-center rounded-lg text-gray-300 hover:bg-slate-800 font-medium text-sm mb-2">
                  Log in
                </Link>
                <Link href="/register" onClick={closeMobile} className="flex items-center w-full px-3 py-3 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 font-medium text-sm justify-center shadow-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
