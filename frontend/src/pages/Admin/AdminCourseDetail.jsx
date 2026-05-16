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
} from 'lucide-react';
import api from '../../services/api';

const TYPE_OPTIONS = [
  { value: 'Notes', label: 'Notes', icon: FileText },
  { value: 'Assignment', label: 'DPP / Assignment', icon: ClipboardList },
  { value: 'Practice Set', label: 'Practice Set', icon: ClipboardList },
  { value: 'Video', label: 'DPP Video', icon: Video },
  { value: 'PYQ', label: 'PYQ', icon: BookMarked },
];

const TYPE_COLORS = {
  Notes: 'bg-sky-50 text-sky-700',
  Assignment: 'bg-amber-50 text-amber-700',
  'Practice Set': 'bg-purple-50 text-purple-700',
  Video: 'bg-red-50 text-red-700',
  PYQ: 'bg-violet-50 text-violet-700',
};

const initialForm = {
  title: '',
  description: '',
  type: 'Notes',
  moduleName: '',
  fileUrl: '',
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
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setCourse(found || null);
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
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoCategorize = () => {
    if (!form.title) {
      setError('Please enter a title first for AI to categorize.');
      return;
    }
    const t = form.title.toLowerCase();
    let newType = form.type;
    
    // Guess type based on keywords
    if (t.includes('dpp') || t.includes('assignment')) newType = 'Assignment';
    else if (t.includes('note')) newType = 'Notes';
    else if (t.includes('video') || t.includes('solution') || t.includes('lecture')) newType = 'Video';
    else if (t.includes('pyq')) newType = 'PYQ';
    else if (t.includes('practice')) newType = 'Practice Set';

    // Try to guess module
    let newModule = form.moduleName;
    const uniqueModules = [...new Set(lessons.map(l => l.moduleTitle).filter(Boolean))];
    
    // Sort modules by length descending so "CH-1 Number System" matches before "CH-1"
    const sortedModules = [...uniqueModules].sort((a, b) => b.length - a.length);
    let moduleFound = false;
    for (const mod of sortedModules) {
      if (t.includes(mod.toLowerCase())) {
        newModule = mod;
        moduleFound = true;
        break;
      }
    }
    
    // If not found by full name, try to match CH-x pattern
    if (!moduleFound) {
      const match = t.match(/(ch\s*-?\s*\d+)/i);
      if (match) {
        const chStr = match[1].toLowerCase().replace(/\s/g, ''); // e.g. ch-1
        // look for module containing this pattern
        const found = uniqueModules.find(m => m.toLowerCase().replace(/\s/g, '').includes(chStr));
        if (found) newModule = found;
      }
    }

    setForm(prev => ({ ...prev, type: newType, moduleName: newModule }));
    setError('');
    setSuccess('AI categorization applied successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fileUrl.trim()) {
      setError('Please provide a Google Drive or direct material link.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = new FormData();
      payload.append('course', courseId);          // auto-fixed, not from form
      payload.append('title', form.title);
      payload.append('description', form.description);
      payload.append('type', form.type);
      payload.append('moduleName', form.moduleName);
      payload.append('fileUrl', form.fileUrl.trim());

      const res = await api.post('/admin/material', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-800"
                      >
                        <LinkIcon className="h-4 w-4" /> Open
                      </a>
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

              {/* Title + Module */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Material title *"
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={handleAutoCategorize}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-purple-100 p-1.5 text-purple-600 transition hover:bg-purple-200 hover:text-purple-700"
                    title="AI Auto Categorize"
                  >
                    <Tag className="h-4 w-4" />
                  </button>
                </div>
                <input
                  name="moduleName"
                  value={form.moduleName}
                  onChange={handleChange}
                  placeholder="Module / chapter name"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                <span>Tip: Use <strong>AI Auto Categorize</strong> to set Type and Module automatically from the title.</span>
              </div>

              {/* Google Drive Link */}
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <LinkIcon className="h-5 w-5 text-sky-500" />
                  <p className="font-semibold text-sm">Google Drive or Direct URL</p>
                </div>
                <input
                  name="fileUrl"
                  type="url"
                  value={form.fileUrl}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
                <p className="text-xs text-slate-500">
                  Paste the shareable link where notes, assessments, PYQs or other study materials are stored.
                </p>
              </div>

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
