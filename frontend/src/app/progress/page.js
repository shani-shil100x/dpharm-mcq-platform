'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { Loader2, Trophy, Clock, ArrowRight, TrendingUp, ChevronLeft, CheckCircle, XCircle, Target, Trash2 } from 'lucide-react';

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [examHistory, setExamHistory] = useState([]);
  const [stats, setStats] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetProgress = async () => {
    if (confirm('Are you sure you want to permanently reset all your progress and track record? This action cannot be undone.')) {
      setIsResetting(true);
      try {
        await api.delete('/user/stats/reset');
        setExamHistory([]);
        setStats([]);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reset progress.');
      } finally {
        setIsResetting(false);
      }
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [examsRes, statsRes] = await Promise.all([
            api.get('/exam/results'),
            api.get('/user/stats'),
          ]);
          setExamHistory(Array.isArray(examsRes.data) ? examsRes.data : []);
          setStats(Array.isArray(statsRes.data) ? statsRes.data : []);
        } catch (error) {
              setExamHistory([]);
          setStats([]);
        } finally {
          setLoadingData(false);
        }
      } else {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading || loadingData) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const totalAttempted = stats.reduce((acc, s) => acc + s.attempted, 0);
  const totalCorrect = stats.reduce((acc, s) => acc + s.correct, 0);
  const totalWrong = stats.reduce((acc, s) => acc + s.wrong, 0);
  const overallAccuracy = totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : 0;

  return (
    <div className="container mx-auto px-4 max-w-6xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 transition-colors">
            <TrendingUp className="h-8 w-8 text-emerald-400" />
            Progress History
          </h1>
          <p className="text-gray-400 mt-1 transition-colors">Track your complete learning journey across all subjects.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleResetProgress}
            disabled={isResetting || (stats.length === 0 && examHistory.length === 0)}
            className="text-sm font-medium text-red-400 hover:text-red-300 bg-red-900/10 hover:bg-red-900/20 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Reset Progress
          </button>
          <Link href="/dashboard" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1 transition-colors px-4 py-2 border border-emerald-900/30 rounded-lg hover:bg-emerald-900/10">
            Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Overall Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 transition-colors">
          <Target className="h-6 w-6 text-blue-400 mb-2" />
          <p className="text-2xl font-extrabold text-white">{totalAttempted}</p>
          <p className="text-xs font-medium text-blue-400 mt-1">Total Attempted</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 transition-colors">
          <CheckCircle className="h-6 w-6 text-emerald-400 mb-2" />
          <p className="text-2xl font-extrabold text-white">{totalCorrect}</p>
          <p className="text-xs font-medium text-emerald-400 mt-1">Correct Answers</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 transition-colors">
          <XCircle className="h-6 w-6 text-red-400 mb-2" />
          <p className="text-2xl font-extrabold text-white">{totalWrong}</p>
          <p className="text-xs font-medium text-red-400 mt-1">Wrong Answers</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 transition-colors">
          <Trophy className="h-6 w-6 text-purple-400 mb-2" />
          <p className="text-2xl font-extrabold text-white">{overallAccuracy}%</p>
          <p className="text-xs font-medium text-purple-400 mt-1">Overall Accuracy</p>
        </div>
      </div>

      {/* Subject-wise Breakdown */}
      {stats.length > 0 && (
        <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6 mb-8 transition-colors duration-300">
          <h2 className="text-lg font-bold text-white mb-4">Subject-wise Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((s) => {
              const subName = s.subjectId?.subjectName || 'Unknown';
              const accColor = s.accuracy >= 70 ? 'emerald' : s.accuracy >= 40 ? 'amber' : 'red';
              return (
                <div key={s._id} className="border border-slate-600 rounded-xl p-4 hover:border-emerald-500 transition-colors">
                  <h3 className="font-bold text-white text-sm mb-3">{subName}</h3>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-700/50 rounded-full h-2.5 mb-3 transition-colors">
                    <div
                      className={`h-2.5 rounded-full ${accColor === 'emerald' ? 'bg-emerald-500' : accColor === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(s.accuracy, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{s.attempted} attempted</span>
                    <span className="font-bold">{s.accuracy?.toFixed(1)}%</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-emerald-400 font-medium">✓ {s.correct}</span>
                    <span className="text-red-400 font-medium">✗ {s.wrong}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Attempt History Table */}
      <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-bold text-white">All Attempts ({examHistory.length})</h2>
        </div>

        {examHistory.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-14 w-14 text-gray-600 mx-auto mb-3 transition-colors" />
            <h3 className="text-lg font-bold text-gray-300 mb-2">No attempts yet</h3>
            <p className="text-gray-400 mb-6">Start practicing or take a mock exam to see your progress here.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all">
              Start Practicing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Subject</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Attempted</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Correct</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Wrong</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Accuracy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {examHistory.map((exam, idx) => (
                  <tr key={exam._id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-200">{exam.subjectId?.subjectName || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-center">{exam.totalQuestions}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-center">{exam.attempted}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="text-emerald-400 font-bold">{exam.correct}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="text-red-400 font-bold">{exam.wrong}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${exam.accuracy >= 70 ? 'text-emerald-400 bg-emerald-900/40' : exam.accuracy >= 40 ? 'text-amber-400 bg-amber-900/40' : 'text-red-400 bg-red-900/40'}`}>
                        {exam.accuracy?.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{new Date(exam.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
