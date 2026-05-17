import React, { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import api from '../../services/api';

const initialTeacherForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  taughtCourses: [],
};

const AdminTeachers = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initialTeacherForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/admin/courses');
        setCourses(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCourseToggle = (courseId) => {
    setForm((current) => ({
      ...current,
      taughtCourses: current.taughtCourses.includes(courseId)
        ? current.taughtCourses.filter((id) => id !== courseId)
        : [...current.taughtCourses, courseId],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/admin/user', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        address: form.address.trim(),
        role: 'teacher',
        taughtCourses: form.taughtCourses,
      });

      setForm(initialTeacherForm);
      setSuccess('Teacher account created successfully. It can now log in through the secure staff portal.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create teacher account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <GraduationCap className="h-6 w-6 text-violet-600" /> Create Teacher Account
        </h1>
        <p className="mt-1 text-slate-500">Create teacher logins and assign exactly which courses they are allowed to manage.</p>
      </header>

      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Teacher name" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Teacher email" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Temporary password" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Teacher mobile number" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>

        <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" rows="3" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />

        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
          <p className="mb-3 text-sm font-semibold text-violet-800">Assign Courses</p>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-2">
            {!loading && courses.length > 0 ? courses.map((course) => (
              <label key={course._id} className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.taughtCourses.includes(course._id)}
                  onChange={() => handleCourseToggle(course._id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <span className="block font-semibold text-slate-800">{course.title}</span>
                  <span className="block text-xs text-slate-500">{course.duration || 'Duration pending'} {course.feeAmount !== undefined ? `• Rs ${course.feeAmount}` : ''}</span>
                </span>
              </label>
            )) : (
              <p className="text-sm text-slate-500">{loading ? 'Loading courses...' : 'No courses available to assign yet.'}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
          Teacher will log in from <span className="font-semibold">`/portal-8a9d3f2c`</span>.
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70">
            {saving ? 'Creating...' : 'Create Teacher'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminTeachers;
