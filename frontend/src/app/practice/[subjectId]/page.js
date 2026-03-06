'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Loader2, ArrowLeft, ArrowRight, ChevronLeft, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function PracticePage() {
  const params = useParams();
  const subjectId = params.subjectId;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQs, setTotalQs] = useState(0);

  // States to track user interaction
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOptionContent }
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/questions?subjectId=${subjectId}&page=${page}&limit=10`);
        setQuestions(data.questions);
        setTotalPages(data.pages);
        setTotalQs(data.total);
      } catch (error) {
        console.error('Failed to load questions', error);
      } finally {
        setLoading(false);
      }
    };
    if (subjectId && user) fetchQuestions();
  }, [subjectId, page, user]);

  const handleOptionSelect = (qId, option, correctAnswer) => {
    if (selectedAnswers[qId]) return; // Disable if already answered

    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));

    if (option === correctAnswer) {
      setCorrectCount(c => c + 1);
    } else {
      setWrongCount(c => c + 1);
    }
  };

  // Save practice stats when user leaves the page or finishes all questions
  const savePracticeStats = useCallback(async () => {
    const attempted = Object.keys(selectedAnswers).length;
    if (attempted === 0 || !user) return;

    try {
      await api.post('/exam/submit', {
        subjectId,
        totalQuestions: totalQs,
        attempted,
        correct: correctCount,
        wrong: wrongCount,
      });
    } catch (err) {
      console.error('Failed to save practice stats', err);
    }
  }, [selectedAnswers, correctCount, wrongCount, subjectId, totalQs, user]);

  // Save stats when navigating away
  useEffect(() => {
    return () => {
      savePracticeStats();
    };
  }, [savePracticeStats]);

  const getOptionStyles = (qId, option, correctAnswer) => {
    const selected = selectedAnswers[qId];

    if (!selected) {
      return 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-300 cursor-pointer';
    }

    if (option === correctAnswer) {
      return 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-500 dark:border-emerald-600 text-emerald-900 dark:text-emerald-300 scale-[1.02] shadow-sm z-10';
    }

    if (selected === option && option !== correctAnswer) {
      return 'bg-red-100 dark:bg-red-900/40 border-red-500 dark:border-red-600 text-red-900 dark:text-red-300';
    }

    return 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed';
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (loading && questions.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">No questions available.</h2>
        <Link href="/" className="text-emerald-600 dark:text-emerald-400 mt-4 inline-block hover:underline hover:text-emerald-700 dark:hover:text-emerald-300 font-medium">
          <ChevronLeft className="inline w-4 h-4 mr-1" />
          Back to Home
        </Link>
      </div>
    );
  }

  const totalAnswered = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Link>
        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-3 py-1 text-xs font-bold rounded-full">
          Total: {totalQs} Questions
        </div>
      </div>

      {/* Live Score Bar */}
      {totalAnswered > 0 && (
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-4">
            <BarChart3 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Score:</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{correctCount} Correct</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
              <span className="text-sm font-bold text-red-600 dark:text-red-400">{wrongCount} Wrong</span>
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {totalAnswered > 0 ? ((correctCount / totalAnswered) * 100).toFixed(0) : 0}% Accuracy
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {questions.map((q, index) => {
          const globalIndex = (page - 1) * 10 + index + 1;
          const isAnswered = !!selectedAnswers[q._id];
          const isCorrect = selectedAnswers[q._id] === q.correctAnswer;

          return (
            <div key={q._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
              <div className="p-6 border-b border-gray-50 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800 flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-serif leading-relaxed">
                  <span className="text-emerald-600 dark:text-emerald-400 mr-2">Q{globalIndex}.</span>
                  {q.questionText}
                </h3>
                {isAnswered && (
                  <div className="ml-4 shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {q.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(q._id, option, q.correctAnswer)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 mcq-option font-medium text-sm ${getOptionStyles(q._id, option, q.correctAnswer)}`}
                    >
                      <span className="inline-block w-6 font-bold opacity-70">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {option.replace(/^[A-Z]\.\s*/, '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-12 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}

      {/* Save & Go to Dashboard */}
      {totalAnswered > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={async () => { await savePracticeStats(); router.push('/dashboard'); }}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all"
          >
            <BarChart3 className="h-5 w-5" />
            Save Progress & View Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

