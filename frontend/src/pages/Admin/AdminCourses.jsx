import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  Layers3,
  X,
  Sparkles,
  ChevronRight,
  BookText,
  Circle,
  Trash2,
} from 'lucide-react';
import api from '../../services/api';

const initialForm = {
  title: '',
  description: '',
  subjects: '',
  feeAmount: '',
  duration: '',
  language: '',
  mrp: '',
  classLabel: '',
  startedAt: '',
};

/* ─── Gradient palettes for courses without a thumbnail ─── */
const GRADIENTS = [
  ['#ff6b6b', '#ee0979'],
  ['#4776E6', '#8E54E9'],
  ['#11998e', '#38ef7d'],
  ['#F7971E', '#FFD200'],
  ['#c94b4b', '#4b134f'],
  ['#00b09b', '#96c93d'],
];

/* ─── Format date to "27th Apr'26" style ─── */
const fmtDate = (dateStr) => {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const day = d.getDate();
  const suffix = ['th', 'st', 'nd', 'rd'][
    day % 10 > 3 || Math.floor((day % 100) / 10) === 1 ? 0 : day % 10
  ];
  const mon = d.toLocaleString('en-IN', { month: 'short' });
  const yr = String(d.getFullYear()).slice(2);
  return `${day}${suffix} ${mon}'${yr}`;
};

/* ─── PW-Style Course Card ─── */
const PWCourseCard = ({ course, index, onClick, onDelete, deleting }) => {
  const [grad] = GRADIENTS[index % GRADIENTS.length]
    ? [GRADIENTS[index % GRADIENTS.length]]
    : [['#4776E6', '#8E54E9']];

  const gradPair = GRADIENTS[index % GRADIENTS.length] || ['#4776E6', '#8E54E9'];

  const subjects = course.subjects || [];
  const classLabel = course.classLabel || subjects[0] || 'Course';
  const language = course.language || 'ENGLISH';
  const purpose = subjects.length > 1
    ? subjects.slice(1).join(', ')
    : subjects[0] || 'Academic Preparation';
  const fee = course.feeAmount ?? 0;
  const mrp = course.mrp || 0;
  const discount = mrp > 0 && fee < mrp
    ? Math.round(((mrp - fee) / mrp) * 100)
    : null;
  const startDate = course.startedAt || course.createdAt;

  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">

      {/* ── 1. Ad Banner / Thumbnail ──────────────────────── */}
      <div className="relative h-44 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Gradient banner with course title like PW */
          <div
            className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center"
            style={{ background: `linear-gradient(135deg, ${gradPair[0]}, ${gradPair[1]})` }}
          >
            {/* faint texture overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_60%)]" />
            <p className="relative z-10 text-2xl font-extrabold uppercase tracking-wide text-white drop-shadow-md">
              {course.title}
            </p>
            {course.duration && (
              <p className="relative z-10 mt-1 text-xs font-semibold uppercase tracking-widest text-white/70">
                {course.duration}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── 2. Card Body ─────────────────────────────────── */}
      <div className="px-4 pb-4 pt-3">

        {/* Row A: class label (orange) + language pill */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-orange-500">{classLabel}</span>
          <span className="rounded border border-slate-300 px-2 py-0.5 text-[11px] font-bold tracking-wider text-slate-600">
            {language}
          </span>
        </div>

        {/* Row B: course title */}
        <h3 className="mt-1 text-base font-extrabold leading-snug text-slate-900">
          {course.title}
        </h3>

        {/* Row C: purpose / category */}
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
          <BookText className="h-3.5 w-3.5 shrink-0" />
          <span>{purpose}</span>
        </div>

        {/* Row D: ongoing + start date */}
        <div className="mt-1.5 flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-red-500">
            <Circle className="h-2.5 w-2.5 fill-red-500" />
            Ongoing
          </span>
          {startDate && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Started on {fmtDate(startDate)}</span>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-slate-100" />

        {/* Row E: price row */}
        <div className="flex items-end gap-2">
          <span className="text-xl font-extrabold text-slate-900">
            {fee === 0 ? 'Free' : `₹${fee.toLocaleString('en-IN')}`}
          </span>
          {mrp > 0 && mrp !== fee && (
            <span className="pb-0.5 text-sm text-slate-400 line-through">
              ₹{mrp.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        {discount && (
          <p className="mt-0.5 text-sm font-bold text-green-600">{discount}% OFF</p>
        )}

        {/* Row F: Buy Now + Arrow */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onClick}
            className="flex-1 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-sky-700 active:scale-95"
          >
            Manage Course
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            title="Delete course"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClick}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── AI Description Generator ─── */
const generateDescription = (form, setForm, setGenerating) => {
  const { title, subjects, duration, feeAmount } = form;
  if (!title.trim()) return;
  setGenerating(true);

  const subjectList = subjects.split(',').map((s) => s.trim()).filter(Boolean);
  const dur = duration.trim();
  const fee = Number(feeAmount);

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const openers = [
    `Master ${title.trim()} with our comprehensive, expertly designed course`,
    `Unlock your potential with the ${title.trim()} batch — a structured learning program`,
  ];
  const subjectPhrases = [
    subjectList.length > 0 ? ` covering ${subjectList.join(', ')}` : '',
  ];
  const durationPhrases = [dur ? ` Designed to be completed in ${dur.toLowerCase()}` : ''];
  const feePhrases = fee === 0 ? [' — completely free of cost!'] : fee > 0 ? [` Available at just ₹${fee}.`] : [''];
  const closers = [' Includes video lectures, practice sets, and study materials curated by top educators.'];
  const ctas = [' Start learning today and stay ahead of the competition!'];

  const desc = pick(openers) + pick(subjectPhrases) + '.' + pick(durationPhrases) + pick(feePhrases) + pick(closers) + pick(ctas);
  const cleaned = desc.replace(/\.\.+/g, '.').replace(/\s+/g, ' ').trim();

  let i = 0;
  setForm((p) => ({ ...p, description: '' }));
  const interval = setInterval(() => {
    i++;
    setForm((p) => ({ ...p, description: cleaned.substring(0, i) }));
    if (i >= cleaned.length) { clearInterval(interval); setGenerating(false); }
  }, 12);
};

/* ─── Main Page ─── */
const AdminCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generating, setGenerating] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState('');

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/courses');
      setCourses(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCourses(); }, []);

  const courseCountLabel = useMemo(
    () => `${courses.length} active batch${courses.length === 1 ? '' : 'es'}`,
    [courses.length]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((cur) => ({ ...cur, [name]: value }));
  };

  const openModal = () => { setError(''); setSuccess(''); setForm(initialForm); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setForm(initialForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
        feeAmount: Number(form.feeAmount),
        duration: form.duration,
        language: form.language || undefined,
        mrp: form.mrp ? Number(form.mrp) : undefined,
        classLabel: form.classLabel || undefined,
        startedAt: form.startedAt || undefined,
      };
      const res = await api.post('/admin/course', payload);
      setCourses((cur) => [res.data, ...cur]);
      setSuccess('Course created successfully.');
      closeModal();
      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    const confirmed = window.confirm(
      `Delete "${course.title}"? This will also remove its lessons, materials, attendance, and linked course access.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingCourseId(course._id);
    setError('');
    setSuccess('');

    try {
      await api.delete(`/admin/course/${course._id}`);
      setCourses((current) => current.filter((item) => item._id !== course._id));
      setSuccess(`Course "${course.title}" deleted successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course.');
    } finally {
      setDeletingCourseId('');
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">

      {/* Header */}
      <header className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <BookOpen className="h-6 w-6 text-sky-600" /> Course Management
          </h2>
          <p className="mt-1 tracking-wide text-slate-500">
            Create, organize, and manage active academic batches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
            <Layers3 className="h-4 w-4" /> {courseCountLabel}
          </span>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-sky-700"
          >
            <PlusCircle className="h-4 w-4" /> New Course
          </button>
        </div>
      </header>

      {/* Alerts */}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-[440px] animate-pulse rounded-3xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* Create Card */}
          <button
            onClick={openModal}
            className="flex min-h-[440px] flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-slate-400 transition hover:border-sky-400 hover:bg-sky-50/50 hover:text-sky-600"
          >
            <PlusCircle className="h-10 w-10" />
            <div className="text-center">
              <p className="text-lg font-bold">Create New Course</p>
              <p className="mt-1 text-sm">Add a new batch to the platform</p>
            </div>
          </button>

          {courses.map((course, idx) => (
            <PWCourseCard
              key={course._id}
              course={course}
              index={idx}
              onClick={() => navigate(`/admin/courses/${course._id}`)}
              onDelete={() => handleDeleteCourse(course)}
              deleting={deletingCourseId === course._id}
            />
          ))}

          {courses.length === 0 && (
            <div className="col-span-2 flex min-h-[200px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400 shadow-sm">
              <BookOpen className="mb-3 h-10 w-10 text-slate-300" />
              No courses yet — click the card above to create your first batch.
            </div>
          )}
        </div>
      )}

      {/* ── Create Course Modal ─────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Create Course</h3>
                <p className="text-sm text-slate-500">Fill in the details for the new batch.</p>
              </div>
              <button onClick={closeModal} className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input name="title" value={form.title} onChange={handleChange} placeholder="Course title *" required className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                <input name="classLabel" value={form.classLabel} onChange={handleChange} placeholder="Class label, e.g. Class 9" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                <input name="language" value={form.language} onChange={handleChange} placeholder="Language, e.g. ENGLISH / HINGLISH" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration, e.g. 1 Year" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                <input name="feeAmount" type="number" min="0" value={form.feeAmount} onChange={handleChange} placeholder="Fee / Selling price (₹) *" required className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                <input name="mrp" type="number" min="0" value={form.mrp} onChange={handleChange} placeholder="MRP / Original price (₹, for strikethrough)" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                <input name="subjects" value={form.subjects} onChange={handleChange} placeholder="Subjects / Purpose (comma separated)" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 md:col-span-2" />
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Started On</label>
                  <input name="startedAt" type="date" value={form.startedAt} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                </div>
              </div>

              <div className="relative">
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Course description *" rows="4" required className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-36 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none" />
                <button type="button" onClick={() => generateDescription(form, setForm, setGenerating)} disabled={!form.title.trim() || generating} className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Sparkles className="h-3.5 w-3.5" />
                  {generating ? 'Writing...' : 'AI Generate'}
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-70">
                  {saving ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
