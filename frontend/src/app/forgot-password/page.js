'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await axios.post(`${apiUrl}/auth/forgotpassword`, { email });
      setStatus('success');
      setMessage('A password reset link has been sent to your email address.');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700 transition-colors duration-300 relative">
        
        {/* Back Button */}
        <Link 
          href="/login" 
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium z-10"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="p-8 pt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Forgot Password</h2>
            <p className="text-gray-400 mt-2">Enter your email to receive a reset link</p>
          </div>

          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-900/30 text-red-400 rounded-lg flex items-start text-sm border border-red-800 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {status === 'success' ? (
            <div className="mb-6 p-6 bg-emerald-900/20 rounded-xl border border-emerald-800/50 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-100 mb-2">Check your inbox</h3>
              <p className="text-emerald-200/80 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 block w-full bg-slate-900 text-white border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Sending Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
