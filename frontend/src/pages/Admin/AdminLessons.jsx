import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Video,
  Eye,
  EyeOff,
  GripVertical,
  Shield,
  Loader2,
  X,
  Save,
  ChevronDown,
  Star,
  Clock,
  BookOpen,
} from 'lucide-react';
import api from '../../services/api';

const AdminLessons = () => {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(location.state?.courseId || '');
  const [lessons, setLessons] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    subject: '',
    title: '',
    description: '',
    moduleTitle: '',
    youtubeVideoId: '',
    duration: '',
    thumbnail: '',
    isPublished: false,
    isFree: false,
  });

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/admin/courses');
        setCourses(res.data);
        if (res.data.length > 0 && !selectedCourse) {
          setSelectedCourse(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch lessons & materials for selected course
  const fetchData = useCallback(async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      const [lessonsRes, materialsRes] = await Promise.all([
        api.get(`/admin/lessons/${selectedCourse}`),
        api.get(`/admin/materials?course=${selectedCourse}`)
      ]);
      setLessons(lessonsRes.data);
      // Backend might not support ?course filter on /materials, so let's fallback to filtering if needed.
      // Wait, getMaterials in adminController usually returns all or filters by course.
      setMaterials(materialsRes.data); 
    } catch (err) {
      console.error('Failed to load course data', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({
      subject: '',
      title: '',
      description: '',
      moduleTitle: '',
      youtubeVideoId: '',
      duration: '',
      thumbnail: '',
      isPublished: false,
      isFree: false,
    });
    setEditingLesson(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (lesson) => {
    setEditingLesson(lesson);
    setForm({
      subject: lesson.subject || '',
      title: lesson.title || '',
      description: lesson.description || '',
      moduleTitle: lesson.moduleTitle || '',
      youtubeVideoId: '', // Don't pre-fill — it's encrypted
      duration: lesson.duration?.toString() || '',
      thumbnail: lesson.thumbnail || '',
      isPublished: lesson.isPublished || false,
      isFree: lesson.isFree || false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!editingLesson && !form.youtubeVideoId.trim()) return;

    try {
      setSaving(true);

      const payload = {
        subject: form.subject.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        moduleTitle: form.moduleTitle.trim(),
        duration: parseInt(form.duration) || 0,
        thumbnail: form.thumbnail.trim(),
        isPublished: form.isPublished,
        isFree: form.isFree,
      };

      if (form.youtubeVideoId.trim()) {
        payload.youtubeVideoId = form.youtubeVideoId.trim();
      }

      if (editingLesson) {
        await api.put(`/admin/lesson/${editingLesson._id}`, payload);
      } else {
        payload.courseId = selectedCourse;
        await api.post('/admin/lesson', payload);
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Failed to save lesson', err);
      alert(err.response?.data?.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Delete this lesson? All associated watch progress will also be removed.')) return;
    try {
      setDeletingId(lessonId);
      await api.delete(`/admin/lesson/${lessonId}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete lesson', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (lesson) => {
    try {
      await api.put(`/admin/lesson/${lesson._id}`, { isPublished: !lesson.isPublished });
      fetchData();
    } catch (err) {
      console.error('Failed to toggle publish', err);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Group by subject and module
  const groupedLessons = lessons.reduce((acc, l) => {
    const mod = (l.subject ? `${l.subject} - ` : '') + (l.moduleTitle || 'Ungrouped');
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(l);
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Video Lessons</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage encrypted YouTube video lessons for your courses
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Course selector */}
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={openCreateModal}
            disabled={!selectedCourse}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" /> Add Lesson
          </button>
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <Shield className="h-5 w-5 text-emerald-600 shrink-0" />
        <p className="text-sm text-emerald-700">
          <strong>AES-256 Encrypted</strong> — All YouTube video IDs are encrypted before storage. They are never exposed in the database or API responses.
        </p>
      </div>

      {/* Lessons list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
        </div>
      ) : lessons.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">No lessons yet</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            {selectedCourse
              ? 'Add your first video lesson by pasting a YouTube Video ID.'
              : 'Select a course to manage its lessons.'}
          </p>
          {selectedCourse && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-600"
            >
              <Plus className="h-4 w-4" /> Add First Lesson
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLessons).map(([moduleName, moduleLessons]) => (
            <div key={moduleName}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  {moduleName}
                </h3>
                <span className="text-xs text-slate-400">
                  ({moduleLessons.length} {moduleLessons.length === 1 ? 'lesson' : 'lessons'})
                </span>
              </div>

              <div className="space-y-2">
                {moduleLessons.map((lesson, idx) => (
                  <div
                    key={lesson._id}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-slate-300"
                  >
                    <div className="text-slate-300 shrink-0 cursor-grab">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 shrink-0">
                      <span className="text-sm font-bold">{lesson.order + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {lesson.title}
                        </p>
                        {lesson.isFree && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 uppercase">
                            Free
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" /> {formatDuration(lesson.duration)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-emerald-500">
                          <Shield className="h-3 w-3" /> Encrypted
                        </span>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTogglePublish(lesson)}
                        className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          lesson.isPublished
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title={lesson.isPublished ? 'Published' : 'Draft'}
                      >
                        {lesson.isPublished ? (
                          <><Eye className="h-3.5 w-3.5" /> Live</>
                        ) : (
                          <><EyeOff className="h-3.5 w-3.5" /> Draft</>
                        )}
                      </button>

                      <button
                        onClick={() => openEditModal(lesson)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(lesson._id)}
                        disabled={deletingId === lesson._id}
                        className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 hover:border-red-200 disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === lesson._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-800">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Lesson Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Introduction to Trigonometry"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </div>

              {/* YouTube Video ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  YouTube Video ID {!editingLesson && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="text"
                  value={form.youtubeVideoId}
                  onChange={(e) => setForm({ ...form, youtubeVideoId: e.target.value })}
                  placeholder="e.g. dQw4w9WgXcQ"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 font-mono transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  required={!editingLesson}
                />
                <p className="mt-1 text-xs text-slate-400">
                  {editingLesson
                    ? 'Leave blank to keep existing video. Enter new ID to replace.'
                    : 'Paste the YouTube video ID (the part after v= in the URL). It will be encrypted before storage.'}
                </p>
              </div>

              {/* Module & Duration */}
              <div className="grid grid-cols-2 gap-4">
                {/* Subject Dropdown */}
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
                  >
                    <option value="" disabled>Select Subject</option>
                    {(courses.find(c => c._id === selectedCourse)?.subjects || []).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Chapter Combobox */}
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Module / Chapter Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="moduleTitle"
                    value={form.moduleTitle}
                    onChange={(e) => setForm({ ...form, moduleTitle: e.target.value })}
                    placeholder="e.g. Module 1: Basics"
                    required
                    list="lesson-chapter-list"
                    autoComplete="off"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  <datalist id="lesson-chapter-list">
                    {Array.from(new Set([
                      ...((courses.find(c => c._id === selectedCourse)?.chapters?.[form.subject]) || []),
                      ...materials.filter(m => (!form.subject || m.subject === form.subject) && (m.course === selectedCourse || m.course?._id === selectedCourse)).map(m => m.moduleName),
                      ...lessons.filter(l => !form.subject || l.subject === form.subject).map(l => l.moduleTitle)
                    ])).filter(Boolean).map(chapter => (
                      <option key={chapter} value={chapter} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g. 600"
                  min="0"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this lesson..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500/20"
                  />
                  <span className="text-sm font-medium text-slate-700">Published</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFree}
                    onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <span className="text-sm font-medium text-slate-700">Free Preview</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-600 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLessons;
