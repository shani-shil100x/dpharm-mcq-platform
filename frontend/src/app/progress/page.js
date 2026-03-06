'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { Loader2, Trophy, Clock, ArrowRight, TrendingUp, ChevronLeft, CheckCircle, XCircle, Target } from 'lucide-react';

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [examHistory, setExamHistory] = useState([]);
  const [stats, setStats] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

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
          console.error('Failed to load progress data:', error);
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
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-emerald-600" />
            Progress History
          </h1>
          <p className="text-gray-500 mt-1">Track your complete learning journey across all subjects.</p>
        </div>
        <Link href="/dashboard" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
          Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Overall Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
          <Target className="h-6 w-6 text-blue-600 mb-2" />
          <p className="text-2xl font-extrabold text-blue-900">{totalAttempted}</p>
          <p className="text-xs font-medium text-blue-600 mt-1">Total Attempted</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
          <CheckCircle className="h-6 w-6 text-emerald-600 mb-2" />
          <p className="text-2xl font-extrabold text-emerald-900">{totalCorrect}</p>
          <p className="text-xs font-medium text-emerald-600 mt-1">Correct Answers</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200">
          <XCircle className="h-6 w-6 text-red-500 mb-2" />
          <p className="text-2xl font-extrabold text-red-900">{totalWrong}</p>
          <p className="text-xs font-medium text-red-500 mt-1">Wrong Answers</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
          <Trophy className="h-6 w-6 text-purple-600 mb-2" />
          <p className="text-2xl font-extrabold text-purple-900">{overallAccuracy}%</p>
          <p className="text-xs font-medium text-purple-600 mt-1">Overall Accuracy</p>
        </div>
      </div>

      {/* Subject-wise Breakdown */}
      {stats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Subject-wise Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((s) => {
              const subName = s.subjectId?.subjectName || 'Unknown';
              const accColor = s.accuracy >= 70 ? 'emerald' : s.accuracy >= 40 ? 'amber' : 'red';
              return (
                <div key={s._id} className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">{subName}</h3>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                    <div
                      className={`h-2.5 rounded-full ${accColor === 'emerald' ? 'bg-emerald-500' : accColor === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(s.accuracy, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{s.attempted} attempted</span>
                    <span className="font-bold">{s.accuracy?.toFixed(1)}%</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-emerald-600 font-medium">✓ {s.correct}</span>
                    <span className="text-red-500 font-medium">✗ {s.wrong}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Attempt History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900">All Attempts ({examHistory.length})</h2>
        </div>

        {examHistory.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-14 w-14 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-600 mb-2">No attempts yet</h3>
            <p className="text-gray-400 mb-6">Start practicing or take a mock exam to see your progress here.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all">
              Start Practicing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attempted</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Correct</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Wrong</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {examHistory.map((exam, idx) => (
                  <tr key={exam._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{exam.subjectId?.subjectName || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-center">{exam.totalQuestions}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-center">{exam.attempted}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="text-emerald-700 font-bold">{exam.correct}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="text-red-600 font-bold">{exam.wrong}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${exam.accuracy >= 70 ? 'bg-emerald-100 text-emerald-700' : exam.accuracy >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {exam.accuracy?.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(exam.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
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
