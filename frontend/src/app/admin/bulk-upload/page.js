'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Loader2, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BulkUploadPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [rawText, setRawText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await api.get('/subjects');
        setSubjects(data);
      } catch (error) {
        console.error('Failed to fetch subjects', error);
      }
    };
    fetchSubjects();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      setStatus({ type: 'error', message: 'Please select a subject first.' });
      return;
    }
    if (!rawText.trim()) {
      setStatus({ type: 'error', message: 'Please paste MCQ data.' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: '', message: '' });

    try {
      const { data } = await api.post('/questions/bulk-upload', {
        subjectId: selectedSubject,
        rawText,
      });

      setStatus({ type: 'success', message: data.message });
      setRawText('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Upload failed. Check your formatting.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Upload MCQs</h1>
        <p className="text-sm text-gray-500 mt-1">Paste 30-40 questions at once using the specific format.</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-emerald-800 mb-2">Required Format Example:</h3>
        <pre className="text-xs text-emerald-700 font-mono bg-white p-3 rounded border border-emerald-100 overflow-x-auto">
{`Q1: What is the capital of India?
A. Mumbai
B. Kolkata
C. New Delhi
D. Chennai
Answer: C. New Delhi

Q2: Which gas do plants absorb?
A. Oxygen
B. Carbon Dioxide
C. Nitrogen
D. Hydrogen
Answer: B. Carbon Dioxide`}
        </pre>
      </div>

      {status.message && (
        <div className={`mb-6 p-4 rounded-lg flex items-start text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {status.type === 'success' ? <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />}
          <p>{status.message}</p>
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="block w-full md:w-1/2 border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">-- Choose a Subject --</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>{s.subjectName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pasted Questions</label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={12}
            required
            className="block w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
            placeholder="Paste your questions here following the format..."
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 shadow-sm"
        >
          {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          Upload Questions
        </button>
      </form>
    </div>
  );
}
