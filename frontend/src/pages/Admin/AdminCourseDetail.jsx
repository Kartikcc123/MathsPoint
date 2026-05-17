import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Video,
  FolderOpen,
  Trash2,
  Link as LinkIcon,
  X,
  UploadCloud,
  Loader2,
  FileText,
  ClipboardList,
  BookMarked,
  Tag,
  Clock,
  IndianRupee,
  Plus,
} from 'lucide-react';
import api from '../../services/api';

const TYPE_OPTIONS = [
  { value: 'Notes', label: 'Notes', icon: FileText },
  { value: 'PYQ', label: 'PYQ', icon: BookMarked },
  { value: 'Assignment', label: 'Assignment / DPP', icon: ClipboardList },
];

const TYPE_COLORS = {
  Notes: 'bg-sky-50 text-sky-700',
  Assignment: 'bg-amber-50 text-amber-700',
  'Practice Set': 'bg-purple-50 text-purple-700',
  Video: 'bg-red-50 text-red-700',
  PYQ: 'bg-violet-50 text-violet-700',
};

const initialForm = {
  subject: '',
  title: '',
  description: '',
  type: 'Notes',
  moduleName: '',
};

const normalizeCourseData = (courseData) => {
  if (!courseData) return null;

  const normalizedChapters =
    courseData.chapters instanceof Map
      ? Object.fromEntries(courseData.chapters)
      : (courseData.chapters || {});

  return {
    ...courseData,
    chapters: normalizedChapters,
  };
};

const AdminCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);
  const [activeCurriculumSubject, setActiveCurriculumSubject] = useState(null);
  const [newChapterName, setNewChapterName] = useState('');
  const [addingChapter, setAddingChapter] = useState(false);

  // ─── Fetch course + materials ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [coursesRes, materialsRes, lessonsRes] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/materials'),
        api.get(`/admin/lessons/${courseId}`).catch(() => ({ data: [] })),
      ]);
      const found = (coursesRes.data || []).find((c) => c._id === courseId);
      setCourse(normalizeCourseData(found));
      const filtered = (materialsRes.data || []).filter(
        (m) => (m.course?._id || m.course) === courseId
      );
      setMaterials(filtered);
      setLessons(lessonsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course data.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const openModal = () => {
    setError('');
    setSuccess('');
    setForm(initialForm);
    setSelectedFile(null);
    setDragOver(false);
    setUploadProgress(0);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setSelectedFile(null);
    setDragOver(false);
    setUploadProgress(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'subject' ? { moduleName: '' } : {}),
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const payload = new FormData();
      payload.append('course', courseId);
      payload.append('subject', form.subject);
      payload.append('title', form.title);
      payload.append('description', form.description);
      payload.append('type', form.type);
      payload.append('moduleName', form.moduleName);
      payload.append('file', selectedFile);

      const res = await api.post('/admin/material', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        },
      });

      setMaterials((prev) => [res.data, ...prev]);
      setSuccess('Material published successfully.');
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to publish material.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (material) => {
    if (!window.confirm(`Delete "${material.title}"? This cannot be undone.`)) return;
    setDeletingId(material._id);
    setError('');
    try {
      await api.delete(`/admin/material/${material._id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== material._id));
      setSuccess('Material deleted.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete material.');
    } finally {
      setDeletingId('');
    }
  };

  // ─── Add/Delete Subject & Chapter ──────────────────────────────────────────────
  const handleAddSubject = async (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!newSubjectName.trim()) {
      setError('Please enter a subject name.');
      setSuccess('');
      return;
    }

    if (!course) {
      setError('Course data is not loaded yet.');
      setSuccess('');
      return;
    }

    const subjectName = newSubjectName.trim();
    setAddingSubject(true);
    setError('');
    setSuccess('');
    
    try {
      const currentSubjects = course.subjects || [];
      if (currentSubjects.includes(subjectName)) {
        setError('Subject already exists in this course.');
        setAddingSubject(false);
        return;
      }
      const currentChaptersObj = course.chapters || {};
      const updatedSubjects = [...currentSubjects, subjectName];
      const updatedChapters = {
        ...currentChaptersObj,
        [subjectName]: currentChaptersObj[subjectName] || [],
      };
      
      const optimisticCourse = {
        ...course,
        subjects: updatedSubjects,
        chapters: updatedChapters,
      };
      setCourse(optimisticCourse);

      const res = await api.put(`/admin/course/${courseId}`, {
        subjects: updatedSubjects,
        chapters: updatedChapters,
      });
      setCourse(normalizeCourseData(res.data));
      await loadData();
      setNewSubjectName('');
      setSuccess('Subject added successfully.');
    } catch (err) {
      setCourse(normalizeCourseData(course));
      const errMsg = err.response?.data?.message || 'Failed to add subject.';
      setError(errMsg);
    } finally {
      setAddingSubject(false);
    }
  };

  const handleAddChapter = async (subjectName, event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!newChapterName.trim()) {
      setError('Please enter a chapter name.');
      setSuccess('');
      return;
    }

    if (!course) {
      setError('Course data is not loaded yet.');
      setSuccess('');
      return;
    }

    const chapterName = newChapterName.trim();
    setAddingChapter(true);
    setError('');
    setSuccess('');
    
    try {
      const currentChaptersObj = course.chapters || {};
      const subjectChapters = currentChaptersObj[subjectName] || [];
      if (subjectChapters.includes(chapterName)) {
        setError('Chapter already exists in this subject.');
        setAddingChapter(false);
        return;
      }
      
      const newChaptersMap = {
        ...currentChaptersObj,
        [subjectName]: [...subjectChapters, chapterName],
      };
      const optimisticCourse = {
        ...course,
        chapters: newChaptersMap,
      };
      setCourse(optimisticCourse);
      
      const res = await api.put(`/admin/course/${courseId}`, {
        subjects: course.subjects || [],
        chapters: newChaptersMap,
      });
      setCourse(normalizeCourseData(res.data));
      await loadData();
      setNewChapterName('');
      setSuccess('Chapter added successfully.');
    } catch (err) {
      setCourse(normalizeCourseData(course));
      const errMsg = err.response?.data?.message || 'Failed to add chapter.';
      setError(errMsg);
    } finally {
      setAddingChapter(false);
    }
  };

  const handleDeleteSubject = async (subjectName) => {
    if (!window.confirm(`Are you sure you want to delete "${subjectName}"? All its videos and materials will be moved to Uncategorized.`)) return;
    try {
      const res = await api.patch(`/admin/course/${courseId}/delete-subject`, { subject: subjectName });
      setCourse(res.data);
      // Reload materials to reflect uncategorized status
      loadData();
      setSuccess(`Subject "${subjectName}" deleted.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete subject.');
    }
  };

  const handleDeleteChapter = async (subjectName, chapterName) => {
    if (!window.confirm(`Are you sure you want to delete "${chapterName}"? All its videos and materials will be moved to Uncategorized.`)) return;
    try {
      const res = await api.patch(`/admin/course/${courseId}/delete-chapter`, { subject: subjectName, chapter: chapterName });
      setCourse(res.data);
      // Reload materials to reflect uncategorized status
      loadData();
      setSuccess(`Chapter "${chapterName}" deleted.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete chapter.');
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-500">
        <BookOpen className="h-12 w-12 text-slate-300" />
        <p className="font-semibold">Course not found.</p>
        <button
          onClick={() => navigate('/admin/courses')}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </button>
      </div>
    );
  }

  const availableChapters = Array.from(new Set([
    ...(course.chapters?.[form.subject] || []),
    ...materials.filter((m) => !form.subject || m.subject === form.subject).map((m) => m.moduleName),
    ...lessons.filter((l) => !form.subject || l.subject === form.subject).map((l) => l.moduleTitle),
  ])).filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">

      {/* ── Back ───────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/admin/courses')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </button>

      {/* ── Course Hero Card ────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
        {/* Banner */}
        <div className="relative h-44 bg-gradient-to-br from-slate-900 via-sky-900 to-cyan-500 px-8 flex items-end pb-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.18),transparent_50%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-100/70">{course.duration || 'Open Batch'}</p>
            <h1 className="mt-1 text-3xl font-bold text-white">{course.title}</h1>
          </div>
          <div className="absolute right-6 top-5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            Active
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-6 border-b border-slate-100 px-8 py-5">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <IndianRupee className="h-4 w-4 text-slate-400" />
            <span className="font-semibold">{course.feeAmount === 0 ? 'Free' : `₹${course.feeAmount}`}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>{course.duration || 'Flexible duration'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(course.subjects || []).map((s) => (
              <span key={s} className="rounded-full bg-cyan-50 px-3 py-0.5 text-xs font-semibold text-cyan-700">
                <Tag className="mr-1 inline h-3 w-3" />{s}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        {course.description && (
          <p className="px-8 py-5 text-sm leading-relaxed text-slate-600">{course.description}</p>
        )}
      </div>

      {/* ── Action Buttons ──────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Publish Video */}
        <button
          onClick={() => navigate('/admin/lessons', { state: { courseId } })}
          className="group flex flex-col items-center justify-center gap-4 rounded-[28px] border-2 border-dashed border-sky-200 bg-sky-50/60 p-10 text-sky-600 transition hover:border-sky-400 hover:bg-sky-100/70 hover:shadow-lg"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
            <Video className="h-8 w-8" />
          </span>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">Publish Video</p>
            <p className="mt-1 text-sm text-slate-500">Add encrypted YouTube video lessons</p>
          </div>
        </button>

        {/* Publish Material */}
        <button
          onClick={openModal}
          className="group flex flex-col items-center justify-center gap-4 rounded-[28px] border-2 border-dashed border-cyan-200 bg-cyan-50/60 p-10 text-cyan-600 transition hover:border-cyan-400 hover:bg-cyan-100/70 hover:shadow-lg"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            <FolderOpen className="h-8 w-8" />
          </span>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">Publish Material</p>
            <p className="mt-1 text-sm text-slate-500">Upload Notes, Assessments &amp; PYQs</p>
          </div>
        </button>
      </div>

      {/* ── Alerts ──────────────────────────────────────────────── */}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ── Curriculum Management (Subjects & Chapters) ───────────────────────── */}
      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">Curriculum Structure</h3>
        </div>
        
        <div className="p-6 md:p-8 space-y-8">
          {/* Add Subject Form */}
          <form onSubmit={handleAddSubject} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Add New Subject</label>
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={addingSubject}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Plus className="h-4 w-4" />
              {addingSubject ? 'Adding...' : 'Add Subject'}
            </button>
          </form>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(course.subjects || []).map(subject => {
              const subjectLessons = lessons.filter(l => l.subject === subject);
              const subjectMaterials = materials.filter(m => m.subject === subject);
              const uniqueChapters = [...new Set([
                ...(course.chapters?.[subject] || []),
                ...subjectLessons.map(l => l.moduleTitle),
                ...subjectMaterials.map(m => m.moduleName)
              ])].filter(Boolean);

              const isActive = activeCurriculumSubject === subject;

              return (
                <div key={subject} className={`border rounded-2xl transition-all duration-300 ${isActive ? 'border-sky-500 shadow-md ring-1 ring-sky-500' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}`}>
                  <div 
                    onClick={() => setActiveCurriculumSubject(isActive ? null : subject)}
                    className="p-5 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-sky-600 font-bold text-lg border border-slate-100">
                        {subject.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
                          {uniqueChapters.length} Chapters
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">{subject}</h4>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                      <span>{subjectLessons.length} Videos</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{subjectMaterials.length} Materials</span>
                    </p>
                  </div>
                  
                  {/* Expanded Chapters View */}
                  {isActive && (
                    <div className="border-t border-slate-200 bg-white p-4 rounded-b-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                      
                      <form
                        onSubmit={(event) => handleAddChapter(subject, event)}
                        className="flex items-center gap-2 mb-4"
                      >
                        <input
                          type="text"
                          value={newChapterName}
                          onChange={(e) => setNewChapterName(e.target.value)}
                          placeholder="Add new chapter..."
                          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <button
                           type="submit"
                           disabled={addingChapter}
                           className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-70"
                         >
                          <Plus className="h-4 w-4" />
                          <span>{addingChapter ? 'Adding...' : 'Add'}</span>
                        </button>
                      </form>

                      <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                        {uniqueChapters.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4 italic border border-dashed border-slate-200 rounded-xl">No chapters created yet</p>
                        ) : (
                          uniqueChapters.map(chapter => {
                            const chVids = subjectLessons.filter(l => l.moduleTitle === chapter).length;
                            const chMats = subjectMaterials.filter(m => m.moduleName === chapter).length;
                            return (
                              <div key={chapter} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-slate-200 transition">
                                <span className="font-semibold text-slate-700 text-sm">{chapter}</span>
                                <div className="flex items-center gap-3">
                                  <div className="flex gap-2 text-xs font-medium text-slate-500">
                                    {chVids > 0 && <span className="flex items-center gap-1"><Video className="h-3 w-3" /> {chVids}</span>}
                                    {chMats > 0 && <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {chMats}</span>}
                                  </div>
                                  <button onClick={() => handleDeleteChapter(subject, chapter)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {(course.subjects || []).length === 0 && (
            <div className="text-center py-8 text-slate-500 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              No subjects added to this course yet.
            </div>
          )}
        </div>
      </div>

      {/* ── Published Materials Table ────────────────────────────── */}
      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">Published Materials</h3>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            {materials.length} item{materials.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-100 bg-white text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Module</th>
                <th className="px-6 py-4 font-semibold">Link</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.length > 0 ? (
                materials.map((m) => (
                  <tr key={m._id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{m.title}</p>
                      {m.description && (
                        <p className="text-xs text-slate-500">{m.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TYPE_COLORS[m.type] || 'bg-slate-100 text-slate-600'}`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{m.moduleName || 'General'}</td>
                    <td className="px-6 py-4">
                      {m.fileUrl?.startsWith('local:') ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                          <FileText className="h-4 w-4" /> Native Upload
                        </span>
                      ) : (
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-800"
                        >
                          <LinkIcon className="h-4 w-4" /> Open
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(m)}
                        disabled={deletingId === m._id}
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === m._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        {deletingId === m._id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-slate-400">
                    No materials published for this course yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Publish Material Modal ───────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">

            {/* Modal header */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Publish Material</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Uploading to&nbsp;
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-bold text-cyan-700">
                    <BookOpen className="h-3 w-3" /> {course.title}
                  </span>
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Type selector */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Material Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-4 transition ${
                        form.type === value
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={value}
                        checked={form.type === value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <Icon className={`h-6 w-6 ${form.type === value ? 'text-sky-600' : 'text-slate-400'}`} />
                      <span className={`text-sm font-semibold ${form.type === value ? 'text-sky-700' : 'text-slate-600'}`}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subject + Module */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Subject Dropdown */}
                <div className="flex flex-col">
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
                  >
                    <option value="" disabled>Select Subject *</option>
                    {(course?.subjects || []).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Chapter Dropdown */}
                <div className="flex flex-col">
                  <select
                    name="moduleName"
                    value={form.moduleName}
                    onChange={handleChange}
                    required
                    disabled={!form.subject || availableChapters.length === 0}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="" disabled>
                      {!form.subject
                        ? 'Select Subject First *'
                        : availableChapters.length === 0
                          ? 'No Chapters Available *'
                          : 'Select Chapter *'}
                    </option>
                    {availableChapters.map((chapter) => (
                      <option key={chapter} value={chapter}>{chapter}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Material Title *"
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              {/* Drag & Drop File Upload */}
              <div
                className={`rounded-[24px] border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                  dragOver
                    ? 'border-sky-400 bg-sky-50'
                    : selectedFile
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) setSelectedFile(file);
                }}
                onClick={() => document.getElementById('material-file-input').click()}
              >
                <input
                  id="material-file-input"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                />
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                      <FileText className="h-7 w-7 text-emerald-600" />
                    </div>
                    <p className="font-semibold text-emerald-700 text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="mt-1 text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <UploadCloud className="h-7 w-7 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">Drag &amp; drop your file here</p>
                      <p className="text-xs text-slate-400 mt-1">or click to browse — PDF, Word, Images up to 50MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload progress bar */}
              {saving && uploadProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short description or instructions (optional)"
                rows={3}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none"
              />

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {saving ? 'Publishing…' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
    )}
    </div>
  );
};

export default AdminCourseDetail;
