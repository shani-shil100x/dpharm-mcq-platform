'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Edit2, Trash2, Plus, Loader2, Users, BookOpen, FileQuestion, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('subjects');
  const [loading, setLoading] = useState(true);

  // Auth guard: redirect non-admins
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  // Don't render until auth is confirmed
  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // Data
  const [subjects, setSubjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMcqModalOpen, setIsMcqModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subject Form
  const [subjectId, setSubjectId] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectIcon, setSubjectIcon] = useState('Book');

  // MCQ Edit Form
  const [mcqId, setMcqId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  // Bulk Upload
  const [uploadSubjectId, setUploadSubjectId] = useState('');
  const [rawText, setRawText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Quick-navigate to upload tab with a specific subject pre-selected
  const goToUploadForSubject = (subjectId) => {
    setUploadSubjectId(subjectId);
    setActiveTab('upload');
  };
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

  // Fetch data based on active tab
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'subjects' || activeTab === 'upload') {
        const { data } = await api.get('/subjects');
        setSubjects(data);
      } else if (activeTab === 'users') {
        const { data } = await api.get('/auth/users');
        setUsers(data);
      } else if (activeTab === 'mcqs') {
        const { data: subData } = await api.get('/subjects');
        setSubjects(subData);
        if (selectedSubjectId) {
          const { data } = await api.get(`/questions?subjectId=${selectedSubjectId}&limit=500`);
          setMcqs(data.questions || []);
        } else {
          setMcqs([]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab, selectedSubjectId]);

  // ========== Subject Handlers ==========
  const handleOpenSubjectModal = (subject = null) => {
    if (subject) {
      setSubjectId(subject._id);
      setSubjectName(subject.subjectName);
      setSubjectIcon(subject.subjectIcon);
    } else {
      setSubjectId(null);
      setSubjectName('');
      setSubjectIcon('Book');
    }
    setIsModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (subjectId) {
        await api.put(`/subjects/${subjectId}`, { subjectName, subjectIcon });
      } else {
        await api.post('/subjects', { subjectName, subjectIcon });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (confirm('Delete this subject and ALL its questions permanently?')) {
      try {
        await api.delete(`/subjects/${id}`);
        fetchData();
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  // ========== MCQ Edit/Delete ==========
  const handleOpenMcqModal = (mcq) => {
    setMcqId(mcq._id);
    setQuestionText(mcq.questionText);
    setOptions([...mcq.options]);
    setCorrectAnswer(mcq.correctAnswer);
    setIsMcqModalOpen(true);
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const handleSaveMcq = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/questions/${mcqId}`, { questionText, options, correctAnswer });
      setIsMcqModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMcq = async (id) => {
    if (confirm('Delete this question permanently?')) {
      try {
        await api.delete(`/questions/${id}`);
        fetchData();
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  // ========== Bulk Upload ==========
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!uploadSubjectId) {
      setUploadStatus({ type: 'error', message: 'Please select a subject first.' });
      return;
    }
    if (!rawText.trim()) {
      setUploadStatus({ type: 'error', message: 'Please paste MCQ data.' });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: '', message: '' });

    try {
      const { data } = await api.post('/questions/bulk-upload', {
        subjectId: uploadSubjectId,
        rawText,
      });
      setUploadStatus({ type: 'success', message: data.message });
      setRawText('');
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.message || 'Upload failed. Check your formatting.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const tabs = [
    { key: 'subjects', label: 'Manage Subjects', icon: BookOpen },
    { key: 'upload', label: 'Upload MCQs', icon: Upload },
    { key: 'mcqs', label: 'Manage MCQs', icon: FileQuestion },
    { key: 'users', label: 'View Users', icon: Users },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 transition-colors">Admin Dashboard</h1>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-slate-700 transition-colors">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 min-w-[140px] py-4 text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap transition-colors ${activeTab === key ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ========== TAB: Subjects ========== */}
          {activeTab === 'subjects' && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Subjects</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Add, rename, change icon, or delete D.Pharm subjects.</p>
                </div>
                <button onClick={() => handleOpenSubjectModal()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Plus className="h-4 w-4" /> Add Subject
                </button>
              </div>

              {loading ? <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto my-10" /> : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 transition-colors">
                    <thead className="bg-gray-50 dark:bg-slate-700/50 transition-colors">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subject Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Icon</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Qs</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700 transition-colors">
                      {subjects.map((s) => (
                        <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">{s.subjectName}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{s.subjectIcon}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{s.totalQuestions}</td>
                          <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                            <button onClick={() => goToUploadForSubject(s._id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors" title="Upload MCQs for this subject"><Upload className="h-3.5 w-3.5" /> Upload MCQs</button>
                            <button onClick={() => handleOpenSubjectModal(s)} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300" title="Edit subject"><Edit2 className="h-4 w-4 inline" /></button>
                            <button onClick={() => handleDeleteSubject(s._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" title="Delete subject"><Trash2 className="h-4 w-4 inline" /></button>
                          </td>
                        </tr>
                      ))}
                      {subjects.length === 0 && <tr><td colSpan={4} className="text-center text-gray-400 dark:text-gray-500 py-10">No subjects found. Add one above.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ========== TAB: Upload MCQs ========== */}
          {activeTab === 'upload' && (
            <>
              <div className="max-w-4xl">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Bulk Upload MCQs</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Paste 30-40 questions at once using the specific format below.</p>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg p-4 mb-8 transition-colors">
                  <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Required Format Example:</h3>
                  <pre className="text-xs text-emerald-700 dark:text-emerald-400 font-mono bg-white dark:bg-slate-800/50 p-3 rounded border border-emerald-100 dark:border-emerald-800/50 overflow-x-auto whitespace-pre-wrap transition-colors">
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

                {uploadStatus.message && (
                  <div className={`mb-6 p-4 rounded-lg flex items-start text-sm transition-colors ${uploadStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                    {uploadStatus.type === 'success' ? <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />}
                    <p>{uploadStatus.message}</p>
                  </div>
                )}

                <form onSubmit={handleBulkUpload} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Select Subject</label>
                    <select
                      value={uploadSubjectId}
                      onChange={(e) => setUploadSubjectId(e.target.value)}
                      className="block w-full md:w-1/2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      required
                    >
                      <option value="">-- Choose a Subject --</option>
                      {subjects.map((s) => (
                        <option key={s._id} value={s._id}>{s.subjectName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Paste Questions</label>
                    <textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      rows={14}
                      required
                      className="block w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm transition-colors"
                      placeholder="Paste your questions here following the format above..."
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
            </>
          )}

          {/* ========== TAB: Manage MCQs ========== */}
          {activeTab === 'mcqs' && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Manage Questions</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Select a subject to view, edit, or delete its MCQs.</p>
                </div>
                <select
                  className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-w-[220px] transition-colors"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  <option value="">-- Select a Subject --</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                </select>
              </div>

              {loading ? <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto my-10" /> : selectedSubjectId ? (
                <div className="space-y-4">
                  {mcqs.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-10">No questions found for this subject. Use the <strong>Upload MCQs</strong> tab to add some.</p>
                  ) : null}
                  {mcqs.map((q, idx) => (
                    <div key={q._id} className="border border-gray-200 dark:border-slate-700 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4 group hover:border-emerald-200 dark:hover:border-emerald-600/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-200 text-sm mb-2 transition-colors"><span className="text-emerald-600 dark:text-emerald-400 mr-1">Q{idx + 1}.</span>{q.questionText}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`p-2 rounded transition-colors ${opt === q.correctAnswer ? 'bg-emerald-100 dark:bg-emerald-900/40 font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50' : 'bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600'}`}>
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 justify-start items-center">
                        <button onClick={() => handleOpenMcqModal(q)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteMcq(q._id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 transition-colors">
                  <FileQuestion className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 transition-colors" />
                  <p className="text-gray-500 dark:text-gray-400 transition-colors">Select a subject from the dropdown to view its questions.</p>
                </div>
              )}
            </>
          )}

          {/* ========== TAB: Users ========== */}
          {activeTab === 'users' && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Registered Users</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Total platform users: <span className="font-bold text-emerald-600 dark:text-emerald-400">{users.length}</span></p>
              </div>

              {loading ? <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto my-10" /> : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 transition-colors">
                    <thead className="bg-gray-50 dark:bg-slate-700/50 transition-colors">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Joined</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700 transition-colors">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">{u.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm text-right">
                            {u.role === 'admin' ? (
                              <span className="text-xs text-purple-500 dark:text-purple-400 font-medium">Protected</span>
                            ) : (
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete user "${u.name}" (${u.email})? This will remove all their data permanently.`)) {
                                    try {
                                      await api.delete(`/auth/users/${u._id}`);
                                      fetchData();
                                    } catch (err) {
                                      alert(err.response?.data?.message || 'Delete failed');
                                    }
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 dark:text-gray-500 py-10">No users found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Subject Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-colors">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl transition-colors">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{subjectId ? 'Edit Subject' : 'Add Subject'}</h3>
              <form onSubmit={handleSaveSubject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name</label>
                  <input type="text" required value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="block w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lucide Icon Name</label>
                  <input type="text" required value={subjectIcon} onChange={(e) => setSubjectIcon(e.target.value)} className="block w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" />
                  <p className="text-xs text-gray-400 mt-1">e.g. Pill, TestTubes, Leaf, HeartPulse, Users</p>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center">{isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MCQ Edit Modal */}
        {isMcqModalOpen && (
          <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-colors">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto transition-colors">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Question</h3>
              <form onSubmit={handleSaveMcq} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Text</label>
                  <textarea required value={questionText} onChange={(e) => setQuestionText(e.target.value)} className="block w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-emerald-500 min-h-[80px] transition-colors" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {options.map((opt, idx) => (
                    <div key={idx}>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Option {String.fromCharCode(65 + idx)}</label>
                      <input type="text" required value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} className="block w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-emerald-500 text-sm transition-colors" />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correct Answer (exact match)</label>
                  <input type="text" required value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} className="block w-full border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-emerald-500 font-medium transition-colors" />
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">This must perfectly match one of the 4 options above.</p>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <button type="button" onClick={() => setIsMcqModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center">{isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Update Question</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
