import { useState, useEffect } from 'react';
import { Loader2, Trash2, Edit2, Upload, Plus, X } from 'lucide-react';
import api from '@/lib/axios';

export default function ChaptersModal({ subjectId, subjectName, onClose, onUploadMCQs }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Chapter Form State
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [chapterName, setChapterName] = useState('');

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/chapters?subjectId=${subjectId}`);
      setChapters(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) {
      fetchChapters();
    }
  }, [subjectId]);

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    if (!chapterName.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (editingChapterId) {
        await api.put(`/chapters/${editingChapterId}`, { chapterName });
      } else {
        await api.post('/chapters', { subjectId, chapterName });
      }
      setChapterName('');
      setEditingChapterId(null);
      fetchChapters();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save chapter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (chapter) => {
    setEditingChapterId(chapter._id);
    setChapterName(chapter.chapterName);
  };

  const handleCancelEdit = () => {
    setEditingChapterId(null);
    setChapterName('');
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Delete the chapter "${name}" and ALL its MCQs permanently?`)) {
      try {
        await api.delete(`/chapters/${id}`);
        setChapters((prev) => prev.filter((c) => c._id !== id));
      } catch (error) {
        alert('Failed to delete chapter');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-colors">
      <div className="bg-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] transition-colors overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-700 bg-slate-900/50">
          <div>
            <h3 className="text-xl font-bold text-white">Manage Chapters</h3>
            <p className="text-sm text-emerald-400 mt-1">{subjectName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Create/Edit Form */}
          <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700 mb-6">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              {editingChapterId ? 'Edit Chapter' : 'Add New Chapter'}
            </h4>
            <form onSubmit={handleSaveChapter} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                placeholder="Enter chapter name..."
                required
                className="flex-1 border border-slate-600 bg-slate-700 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                autoFocus
              />
              <div className="flex gap-2">
                {editingChapterId && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm text-gray-300 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={isSubmitting || !chapterName.trim()}
                  className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px] transition-colors"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingChapterId ? 'Save Edit' : <><Plus className="h-4 w-4 mr-1" /> Add</>}
                </button>
              </div>
            </form>
          </div>

          {/* Chapters List */}
          <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Existing Chapters</h4>
          
          {loading ? (
             <div className="py-12 flex justify-center">
               <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
             </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-8 bg-slate-900/30 rounded-lg border border-dashed border-slate-700">
              <p className="text-gray-400">No chapters found for this subject. Create one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter) => (
                <div key={chapter._id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-600/50 transition-colors group">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-200 text-lg">{chapter.chapterName}</h5>
                    <p className="text-sm text-gray-400 mt-1">Questions: <span className="font-bold text-emerald-400">{chapter.totalQuestions}</span></p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <button 
                      onClick={() => onUploadMCQs(chapter)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-900/40 text-emerald-400 rounded-lg hover:bg-emerald-900/60 transition-colors text-sm font-medium"
                    >
                      <Upload className="h-4 w-4" /> <span className="hidden sm:inline">Upload MCQs</span><span className="sm:hidden">Upload</span>
                    </button>
                    <button 
                      onClick={() => handleEdit(chapter)}
                      className="p-2 text-blue-400 bg-blue-900/20 hover:bg-blue-900/40 rounded-lg transition-colors"
                      title="Edit Chapter"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(chapter._id, chapter.chapterName)}
                      className="p-2 text-red-400 bg-red-900/20 hover:bg-red-900/40 rounded-lg transition-colors"
                      title="Delete Chapter"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
