'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Loader2, Clock, CheckCircle2, XCircle, ChevronRight, AlertTriangle, ListTree, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// OPTIMIZATION: Memoized QuestionCard prevents all 50 questions from re-rendering
// every time the user selects an answer for just one of them.
const QuestionCard = React.memo(({ q, index, selectedOption, onSelect }) => {
  return (
    <div id={`q-${index}`} className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 overflow-hidden transition-colors duration-300">
      <div className="p-4 sm:p-6 border-b border-slate-700/50 bg-slate-800 flex items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-bold text-white font-serif leading-relaxed">
          <span className="text-emerald-400 mr-2">Q{index + 1}.</span>
          {q.questionText}
        </h3>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-3">
          {q.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            return (
              <button
                key={idx}
                onClick={() => onSelect(q._id, option)}
                className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 font-medium text-sm mcq-option
                  ${isSelected ? 'bg-emerald-900/30 border-emerald-600 text-emerald-300 shadow-sm' : 'bg-slate-800 border-slate-700 hover:border-emerald-500 hover:bg-slate-700/50 text-gray-300'}
                `}
              >
                <span className="inline-block w-6 font-bold opacity-70">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {option.replace(/^[A-Z]\.\s*/, '')}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
});

export default function ExamPage() {
  const params = useParams();
  const subjectId = params.subjectId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const chapterId = searchParams.get('chapterId');
  const { user, loading: authLoading } = useAuth();

  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Exam State
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { qId: option }
  const [examFinished, setExamFinished] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchExamData = async () => {
      setLoading(true);
      try {
        const subRes = await api.get('/subjects');
        const currentSub = subRes.data.find(s => s._id === subjectId);
        setSubject(currentSub);

        if (!chapterId && subjectId) {
          setQuestions([]);
          setSelectedAnswers({});
          setIsExamStarted(false);
          setExamFinished(false);
          setResultData(null);
          const { data } = await api.get(`/chapters?subjectId=${subjectId}`);
          setChapters(data);
        } else if (chapterId && subjectId) {
          const { data } = await api.get(`/questions?subjectId=${subjectId}&chapterId=${chapterId}&limit=50`);
          setQuestions(data.questions);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    if (subjectId && user) fetchExamData();
  }, [subjectId, chapterId, user]);

  useEffect(() => {
    if (isExamStarted && timeLeft > 0 && !examFinished) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isExamStarted && !examFinished) {
      handleAutoSubmit();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, isExamStarted, examFinished]);

  const startExam = () => {
    // 1 minute per question
    setTimeLeft(questions.length * 60);
    setIsExamStarted(true);
  };

  const handleOptionSelect = useCallback((qId, option) => {
    if (examFinished) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  }, [examFinished]);

  const submitExam = async (isAuto = false) => {
    if (examFinished || isSubmitting) return;

    if (!isAuto) {
      const unanswered = questions.length - Object.keys(selectedAnswers).length;
      if (unanswered > 0) {
        if (!confirm(`You have ${unanswered} unanswered questions. submitting anyway?`)) {
          return;
        }
      }
    }

    setIsSubmitting(true);
    setExamFinished(true);

    try {
      // Send answers to server for server-side scoring
      const { data } = await api.post('/exam/submit', {
        subjectId,
        chapterId,
        answers: selectedAnswers,
      });
      setResultData(data);
    } catch (error) {
      alert('Failed to save your exam results. But you can still view them.');
      
      // Local fallback if saving fails
      let correct = 0;
      let wrong = 0;
      let attempted = Object.keys(selectedAnswers).length;
      questions.forEach((q) => {
        const ans = selectedAnswers[q._id];
        if (ans) {
          if (ans === q.correctAnswer) correct++;
          else wrong++;
        }
      });
      setResultData({
        totalQuestions: questions.length,
        attempted,
        correct,
        wrong,
        accuracy: questions.length > 0 ? (correct / questions.length) * 100 : 0
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    submitExam(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
  if (!chapterId && subject) {
    return (
      <div className="max-w-4xl mx-auto pb-20 px-4">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-gray-400 hover:text-gray-100 transition-colors flex items-center text-sm font-medium">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Subjects
          </Link>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">Select a <span className="text-emerald-400">Chapter</span> for Exam</h1>
          <p className="text-gray-400">Choose a chapter to begin your mock exam.</p>
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
                href={`/exam/${subjectId}?chapterId=${chapter._id}`}
                className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-emerald-500 hover:bg-slate-700/50 transition-all duration-300 flex justify-between items-center group"
              >
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{chapter.chapterName}</h3>
                  <p className="text-sm text-gray-400 mt-1">{chapter.totalQuestions} Questions</p>
                </div>
                <ChevronRight className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
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
        <h2 className="text-2xl font-bold text-gray-300">Not enough questions for an exam.</h2>
        <Link href="/" className="text-emerald-400 mt-4 inline-block hover:underline hover:text-emerald-300 font-medium">
          Back to Home
        </Link>
      </div>
    );
  }

  if (examFinished && resultData) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700 transition-colors duration-300">
          <div className="bg-emerald-700 p-8 text-center transition-colors">
             <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Exam Completed!</h2>
             <p className="text-emerald-100">{subject?.subjectName} - Final Result</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8">
              <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 text-center transition-colors">
                <p className="text-sm font-medium text-gray-400 mb-1">Total Questions</p>
                <p className="text-2xl font-bold text-white">{resultData.totalQuestions}</p>
              </div>
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 text-center transition-colors">
                <p className="text-sm font-medium text-blue-400 mb-1">Attempted</p>
                <p className="text-2xl font-bold text-blue-100">{resultData.attempted}</p>
              </div>
              <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-4 text-center transition-colors">
                <p className="text-sm font-medium text-emerald-400 mb-1">Correct</p>
                <p className="text-2xl font-bold text-emerald-100">{resultData.correct}</p>
              </div>
              <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 text-center transition-colors">
                <p className="text-sm font-medium text-red-400 mb-1">Wrong</p>
                <p className="text-2xl font-bold text-red-100">{resultData.wrong}</p>
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <div className="relative inline-flex items-center justify-center">
                 <svg className="w-32 h-32 transform -rotate-90">
                    <circle className="text-gray-200 opacity-10" strokeWidth="12" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64" />
                    <circle className="text-emerald-500" strokeWidth="12" strokeDasharray={50 * 2 * Math.PI} strokeDashoffset={50 * 2 * Math.PI - (resultData.accuracy / 100) * 50 * 2 * Math.PI} strokeLinecap="round" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64" />
                 </svg>
                 <span className="absolute text-2xl font-extrabold text-emerald-500">{resultData.accuracy.toFixed(0)}%</span>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <Link href={`/exam/${subjectId}`} className="px-4 sm:px-6 py-3 font-semibold text-gray-300 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-sm sm:text-base text-center">
                Other Chapters
              </Link>
              <Link href="/dashboard" className="px-4 sm:px-6 py-3 font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-colors text-sm sm:text-base text-center">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isExamStarted) {
    return (
      <div className="max-w-xl mx-auto py-10 sm:py-20 text-center px-4">
        <div className="bg-slate-800 p-6 sm:p-10 rounded-3xl shadow-lg border border-slate-700 transition-colors duration-300">
          <div className="w-20 h-20 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
             <Clock className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">{subject?.subjectName} Mock Exam</h1>
          
          <ul className="text-left space-y-4 mb-10 text-gray-300 max-w-sm mx-auto">
            <li className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-3 text-emerald-400" /> <span className="text-gray-300">Total Questions:</span> <strong className="ml-1 text-white">{questions.length}</strong></li>
            <li className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-3 text-emerald-400" /> <span className="text-gray-300">Time Limit:</span> <strong className="ml-1 text-white">{questions.length} Minutes</strong></li>
            <li className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-3 text-emerald-400" /> <span className="text-gray-300">Auto-submission when time ends</span></li>
            <li className="flex items-center"><AlertTriangle className="w-5 h-5 mr-3 text-amber-400" /> <span className="text-gray-300">Answers cannot be changed after submission</span></li>
          </ul>

          <button onClick={startExam} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">
            Start Exam Now
          </button>
        </div>
      </div>
    );
  }

  // Active Exam View
  const isWarning = timeLeft <= 300; // 5 mins
  return (
    <div className="max-w-4xl mx-auto pb-24 relative px-4">
      <div className={`sticky top-16 z-40 p-3 sm:p-4 border-b shadow-sm rounded-b-2xl mb-6 sm:mb-8 flex items-center justify-between gap-2 transition-colors duration-300 ${isWarning ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-slate-800 text-gray-200 border-slate-700'}`}>
        <div className="font-bold text-sm sm:text-lg flex items-center text-white shrink-0">
          <Clock className={`w-5 h-5 mr-2 text-emerald-400 ${isWarning ? 'animate-pulse text-red-400' : ''}`} />
          {formatTime(timeLeft)}
        </div>
        <div className="text-sm font-medium opacity-80">
          Attempted: {Object.keys(selectedAnswers).length} / {questions.length}
        </div>
        <button 
          onClick={() => submitExam()} 
          disabled={isSubmitting}
          className="bg-gray-900 hover:bg-gray-800 text-white px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-md transition-all flex items-center disabled:opacity-50 shrink-0"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Submit Exam
        </button>
      </div>

      <div className="space-y-8">
        {questions.map((q, index) => (
          <QuestionCard
            key={q._id}
            q={q}
            index={index}
            selectedOption={selectedAnswers[q._id]}
            onSelect={handleOptionSelect}
          />
        ))}
      </div>
      
      <div className="mt-12 text-center">
         <button 
          onClick={() => submitExam()} 
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 inline-flex items-center disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 mr-3 animate-spin"/>}
          Finish Exam & Get Results
        </button>
      </div>
    </div>
  );
}
