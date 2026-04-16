import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, PlusCircle, Layers3, X } from 'lucide-react';
import api from '../../services/api';

const initialForm = {
  title: '',
  description: '',
  subjects: '',
  feeAmount: '',
  duration: '',
};

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  useEffect(() => {
    loadCourses();
  }, []);

  const courseCountLabel = useMemo(() => `${courses.length} active learning track${courses.length === 1 ? '' : 's'}`, [courses.length]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        title: form.title,
        description: form.description,
        subjects: form.subjects.split(',').map((item) => item.trim()).filter(Boolean),
        feeAmount: Number(form.feeAmount),
        duration: form.duration,
      };
      const res = await api.post('/admin/course', payload);
      setCourses((current) => [res.data, ...current]);
      setSuccess('Course created successfully.');
      closeModal();
      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <BookOpen className="h-6 w-6 text-purple-600" /> Course Management
          </h2>
          <p className="mt-1 tracking-wide text-slate-500">Create, organize, and refine active academic batches.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700">
          <Layers3 className="h-4 w-4" /> {courseCountLabel}
        </div>
      </header>

      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <button onClick={openModal} className="flex min-h-[300px] flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-slate-400 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600">
          <PlusCircle className="mb-4 h-12 w-12 text-slate-300 transition" />
          <p className="font-bold">Create New Course</p>
        </button>

        {courses.slice(0, 2).map((course) => (
          <div key={course._id} className="group col-span-1 flex min-h-[300px] flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
            <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-500 px-6 text-white">
              <div className="absolute right-4 top-4 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-800 shadow backdrop-blur">Active</div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-100/80">{course.duration || 'Open Batch'}</p>
                <h3 className="mt-3 text-2xl font-bold">{course.title}</h3>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <p className="text-sm leading-relaxed text-slate-500">{course.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(course.subjects || []).map((subject) => (
                    <span key={subject} className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">{subject}</span>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-800">Rs {course.feeAmount}</span>
                <span className="text-slate-500">{course.duration || 'Flexible duration'}</span>
              </div>
            </div>
          </div>
        ))}

        {!loading && courses.length === 0 && (
          <div className="col-span-1 flex min-h-[300px] flex-col items-center justify-center rounded-[28px] border border-slate-200/80 bg-white p-8 text-center text-slate-500 shadow-sm md:col-span-2">
            No courses created yet.
          </div>
        )}
      </div>

      {courses.length > 2 && (
        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Subjects</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Fee</th>
              </tr>
            </thead>
            <tbody>
              {courses.slice(2).map((course) => (
                <tr key={course._id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{course.title}</p>
                    <p className="text-xs text-slate-500">{course.description}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{(course.subjects || []).join(', ') || 'Not set'}</td>
                  <td className="px-6 py-4 text-slate-600">{course.duration || 'Flexible'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">Rs {course.feeAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Create Course</h3>
                <p className="text-sm text-slate-500">This saves a real course record to the backend.</p>
              </div>
              <button onClick={closeModal} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <input name="title" value={form.title} onChange={handleChange} placeholder="Course title" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration, e.g. 1 Year" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="feeAmount" type="number" min="0" value={form.feeAmount} onChange={handleChange} placeholder="Fee amount" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="subjects" value={form.subjects} onChange={handleChange} placeholder="Subjects, comma separated" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Course description" rows="4" required className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
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
