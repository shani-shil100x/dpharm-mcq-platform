'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';

const SubjectIcon = ({ name, className }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.Book;
  return <IconComponent className={className} />;
};

export default function HomePage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await api.get('/subjects');
        setSubjects(data);
      } catch (error) {
        console.error('Failed to load subjects', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
          Master Your <span className="text-emerald-400">D.Pharm</span> Subjects
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Practice subject-wise multiple choice questions, take timed mock tests, and track your performance to ace your 1st-year exams.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LucideIcons.Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
                  <SubjectIcon name={subject.subjectIcon} className="h-40 w-40 text-white" />
                </div>
                
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="p-3 bg-emerald-900/30 text-emerald-400 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                    <SubjectIcon name={subject.subjectIcon} className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{subject.subjectName}</h3>
                </div>
                
                <div className="flex items-center text-sm text-gray-400 mb-6 relative z-10">
                  <LucideIcons.Library className="h-4 w-4 mr-1.5" />
                  <span>{subject.totalQuestions} Questions Available</span>
                </div>
                
                <div className="mt-auto space-y-3 relative z-10">
                  <Link
                    href={`/practice/${subject._id}`}
                    className="block w-full py-3 px-4 bg-slate-700/50 text-white font-semibold text-center rounded-xl hover:bg-slate-700 hover:text-emerald-400 transition-colors"
                  >
                    Practice Mode
                  </Link>
                  <Link
                    href={`/exam/${subject._id}`}
                    className="block w-full py-3 px-4 bg-emerald-600 text-white font-semibold text-center rounded-xl hover:bg-emerald-500 transition-all"
                  >
                    Take Exam
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
