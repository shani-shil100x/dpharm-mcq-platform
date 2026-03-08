'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Loader2, ArrowLeft, ArrowRight, ChevronLeft, CheckCircle2, XCircle, BarChart3, ListTree } from 'lucide-react';
import Link from 'next/link';

// Helper for highly robust answer checking (handles "A. Option" vs "Option" mismatches)
const checkIsCorrect = (option, correctAnswer) => {
  if (!option || !correctAnswer) return false;
  const normalize = (str) => str.toString().trim().toLowerCase();
  
  // Exact match
  if (normalize(option) === normalize(correctAnswer)) return true;
  
  // Match ignoring the "A. " or "B. " prefixes
  const optBody = normalize(option.replace(/^[A-Z]\.\s*/i, ''));
  const ansBody = normalize(correctAnswer.replace(/^[A-Z]\.\s*/i, ''));
  
  return optBody === ansBody;
};

const PracticeQuestionCard = memo(({ q, globalIndex, selectedOption, onSelect }) => {
  const isAnswered = !!selectedOption;
  const isCorrect = isAnswered && checkIsCorrect(selectedOption, q.correctAnswer);

  const getOptionStyles = (option) => {
    if (!selectedOption) {
      return 'bg-slate-800 border-slate-700 hover:border-emerald-500 hover:bg-slate-700/50 text-gray-300 cursor-pointer';
    }

    const isThisOptionCorrect = checkIsCorrect(option, q.correctAnswer);

    if (isThisOptionCorrect) {
      return 'bg-emerald-900/40 border-emerald-600 text-emerald-300 scale-[1.02] shadow-sm z-10';
    }

    if (selectedOption === option && !isThisOptionCorrect) {
      return 'bg-red-900/40 border-red-600 text-red-300';
    }

    return 'bg-slate-800 border-slate-700 text-gray-600 opacity-60 cursor-not-allowed';
  };

  return (
    <div id={`q-${globalIndex}`} className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 overflow-hidden transition-colors duration-300">
      <div className="p-4 sm:p-6 border-b border-slate-700/50 bg-slate-800 flex justify-between items-start gap-2">
        <h3 className="text-base sm:text-lg font-bold text-white font-serif leading-relaxed">
          <span className="text-emerald-400 mr-2">Q{globalIndex}.</span>
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
      <div className="p-4 sm:p-6">
        <div className="space-y-3">
          {q.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(q._id, option, q.correctAnswer)}
              disabled={isAnswered}
              className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 mcq-option font-medium text-sm ${getOptionStyles(option)}`}
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
});

export default function PracticePage() {
  const params = useParams();
  const subjectId = params.subjectId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const chapterId = searchParams.get('chapterId');
  const { user, loading: authLoading } = useAuth();

  const [chapters, setChapters] = useState([]);
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
    const fetchChaptersOrQuestions = async () => {
      setLoading(true);
      try {
        if (!chapterId && subjectId) {
          // Fetch chapters for chapter selection screen
          setQuestions([]);
          setSelectedAnswers({});
          setCorrectCount(0);
          setWrongCount(0);
          const { data } = await api.get(`/chapters?subjectId=${subjectId}`);
          setChapters(data);
        } else if (chapterId && subjectId) {
          // Fetch questions for practice mode
          const { data } = await api.get(`/questions?subjectId=${subjectId}&chapterId=${chapterId}&page=${page}&limit=10`);
          setQuestions(data.questions);
          setTotalPages(data.pages);
          setTotalQs(data.total);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    if (subjectId && user) fetchChaptersOrQuestions();
  }, [subjectId, chapterId, page, user]);

  const handleOptionSelect = useCallback((qId, option, correctAnswer) => {
    setSelectedAnswers((prev) => {
      if (prev[qId]) return prev; // Disable if already answered

      // Calculate correctness ONLY if not previously answered
      const normalize = (str) => (str || '').toString().trim().toLowerCase();
      const optBody = normalize(option.replace(/^[A-Z]\.\s*/i, ''));
      const ansBody = normalize((correctAnswer || '').replace(/^[A-Z]\.\s*/i, ''));
      const isCorrect = normalize(option) === normalize(correctAnswer) || optBody === ansBody;

      if (isCorrect) {
        setCorrectCount(c => c + 1);
      } else {
        setWrongCount(c => c + 1);
      }

      return {
        ...prev,
        [qId]: option,
      };
    });
  }, []);

  // Save practice stats when user clicks "Save Progress"
  // Fixed a massive bug where this was in a useEffect cleanup, causing an API call on EVERY single click!
  const savePracticeStats = async () => {
    const attempted = Object.keys(selectedAnswers).length;
    if (attempted === 0 || !user) return;

    try {
      await api.post('/exam/submit', {
        subjectId,
        chapterId,
        answers: selectedAnswers, // Backend expects 'answers', not generic counts
      });
    } catch (err) {
      console.error('Failed to save practice stats', err);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (loading && (chapters.length === 0 || questions.length === 0)) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // --- CHAPTER SELECTION SCREEN ---
  if (!chapterId) {
    return (
      <div className="max-w-4xl mx-auto pb-20 px-4">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-gray-400 hover:text-gray-100 transition-colors flex items-center text-sm font-medium">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Subjects
          </Link>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">Select a <span className="text-emerald-400">Chapter</span></h1>
          <p className="text-gray-400">Choose a chapter to begin your practice session.</p>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-20 bg-slate-800 rounded-xl border border-slate-700">
            <ListTree className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-300">No chapters found.</h2>
            <p className="text-gray-500 mt-2">This subject doesn't have any chapters yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.map((chapter) => (
              <Link 
                key={chapter._id} 
                href={`/practice/${subjectId}?chapterId=${chapter._id}`}
                className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-emerald-500 hover:bg-slate-700/50 transition-all duration-300 flex justify-between items-center group"
              >
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{chapter.chapterName}</h3>
                  <p className="text-sm text-gray-400 mt-1">{chapter.totalQuestions} Questions</p>
                </div>
                <ArrowRight className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }
  // --------------------------------

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-300">No questions available.</h2>
        <Link href="/" className="text-emerald-400 mt-4 inline-block hover:underline hover:text-emerald-300 font-medium">
          <ChevronLeft className="inline w-4 h-4 mr-1" />
          Back to Home
        </Link>
      </div>
    );
  }

  const totalAnswered = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4">
      <div className="mb-8 flex items-center justify-between">
        <Link href={`/practice/${subjectId}`} className="text-gray-400 hover:text-gray-100 transition-colors flex items-center text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Chapters
        </Link>
        <div className="bg-emerald-900/30 text-emerald-400 px-3 py-1 text-xs font-bold rounded-full">
          Total: {totalQs} Questions
        </div>
      </div>

      {/* Live Score Bar */}
      {totalAnswered > 0 && (
        <div className="mb-6 bg-slate-800 rounded-xl border border-slate-700 shadow-sm p-3 sm:p-4 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-3 sm:mb-0 sm:gap-4">
            <BarChart3 className="h-5 w-5 text-gray-500 shrink-0" />
            <span className="text-sm font-medium text-gray-300">Score:</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-end sm:gap-6 mt-2">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs sm:text-sm font-bold text-emerald-400">{correctCount} Correct</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-xs sm:text-sm font-bold text-red-400">{wrongCount} Wrong</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white text-center">
              {totalAnswered > 0 ? ((correctCount / totalAnswered) * 100).toFixed(0) : 0}% Accuracy
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {questions.map((q, index) => {
          const globalIndex = (page - 1) * 10 + index + 1;
          const selectedOption = selectedAnswers[q._id];
          
          return (
            <PracticeQuestionCard 
              key={q._id}
              q={q}
              globalIndex={globalIndex}
              selectedOption={selectedOption}
              onSelect={handleOptionSelect}
            />
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-12 bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700 transition-colors duration-300">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>
          <span className="text-sm font-medium text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

