'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Loader2, Target, CheckCircle, XCircle, Trophy, Clock, ArrowRight, Trash2 } from 'lucide-react';

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
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
          const [statsRes, examsRes] = await Promise.all([
            api.get('/user/stats'),
            api.get('/exam/results'),
          ]);
          setStats(Array.isArray(statsRes.data) ? statsRes.data : []);
          setExamHistory(Array.isArray(examsRes.data) ? examsRes.data : []);
        } catch (error) {
              setStats([]);
          setExamHistory([]);
        } finally {
          setLoadingStats(false);
        }
      } else {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading || loadingStats) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const totalAttempted = stats.reduce((acc, s) => acc + s.attempted, 0);
  const totalCorrect = stats.reduce((acc, s) => acc + s.correct, 0);
  const totalWrong = stats.reduce((acc, s) => acc + s.wrong, 0);
  const overallAccuracy = totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : 0;

  const pieData = [
    { name: 'Correct', value: totalCorrect, color: '#10b981' },
    { name: 'Wrong', value: totalWrong, color: '#ef4444' },
  ];

  const barData = stats.map(s => ({
    subject: s.subjectId?.subjectName || 'Unknown',
    accuracy: s.accuracy,
    attempted: s.attempted,
  }));

    if (totalAttempted === 0 && examHistory.length === 0) {
      return (
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white transition-colors">Welcome, {user?.name}</h1>
            <p className="text-gray-400 mt-2 transition-colors">Here is an overview of your practice performance.</p>
          </div>
          <div className="text-center py-20 bg-slate-800 rounded-2xl shadow-sm border border-slate-700 transition-colors duration-300">
            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4 transition-colors" />
            <h2 className="text-2xl font-bold text-gray-200 mb-2 transition-colors">No attempts yet!</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto transition-colors">Start practicing MCQs or take a mock exam to see your performance stats here.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all">
              Start Practicing <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      );
    }

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white transition-colors">Welcome, {user?.name}</h1>
          <p className="text-gray-400 mt-2 transition-colors">Here is an overview of your practice performance.</p>
        </div>
        <button
          onClick={handleResetProgress}
          disabled={isResetting || (stats.length === 0 && examHistory.length === 0)}
          className="text-sm font-medium text-red-400 hover:text-red-300 bg-red-900/10 hover:bg-red-900/20 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Reset Progress
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700 flex items-center transition-colors duration-300">
          <div className="p-4 bg-blue-900/30 rounded-xl mr-4 transition-colors">
            <Target className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Attempted</p>
            <p className="text-2xl font-bold text-white">{totalAttempted}</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700 flex items-center transition-colors duration-300">
          <div className="p-4 bg-emerald-900/30 rounded-xl mr-4 transition-colors">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Correct</p>
            <p className="text-2xl font-bold text-white">{totalCorrect}</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700 flex items-center transition-colors duration-300">
          <div className="p-4 bg-red-900/30 rounded-xl mr-4 transition-colors">
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Wrong</p>
            <p className="text-2xl font-bold text-white">{totalWrong}</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700 flex items-center transition-colors duration-300">
          <div className="p-4 bg-purple-900/30 rounded-xl mr-4 transition-colors">
            <span className="text-xl font-bold text-purple-400">%</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Overall Accuracy</p>
            <p className="text-2xl font-bold text-white">{overallAccuracy}%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700 transition-colors duration-300">
          <h3 className="text-lg font-bold text-white mb-6">Correct vs Wrong Ratio</h3>
          {totalAttempted > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-20">Not enough data to display chart.</p>
          )}
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700 transition-colors duration-300">
          <h3 className="text-lg font-bold text-white mb-6">Subject Accuracy (%)</h3>
          {stats.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                  <XAxis dataKey="subject" tick={{fontSize: 12}} interval={0} angle={-25} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                  <Bar dataKey="accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <p className="text-center text-gray-400 py-20">No subject data available to chart.</p>
          )}
        </div>
      </div>

      {/* Exam History */}
      {examHistory.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-bold text-white">Recent Attempts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700/50">
                <tr>
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
                {examHistory.slice(0, 20).map((exam) => (
                  <tr key={exam._id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-200">{exam.subjectId?.subjectName || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-center">{exam.totalQuestions}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-center">{exam.attempted}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="text-emerald-500 font-bold">{exam.correct}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="text-red-400 font-bold">{exam.wrong}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${exam.accuracy >= 70 ? 'bg-emerald-900/40 text-emerald-400' : exam.accuracy >= 40 ? 'bg-amber-900/40 text-amber-400' : 'bg-red-900/40 text-red-400'}`}>
                        {exam.accuracy?.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{new Date(exam.completedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
