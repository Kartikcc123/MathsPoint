import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserRoundPlus } from 'lucide-react';
import api from '../../services/api';

const initialParentForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  linkedStudents: [],
};

const AdminParents = () => {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialParentForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/admin/students');
        setStudents(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load students.');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleStudentToggle = (studentId) => {
    setForm((current) => ({
      ...current,
      linkedStudents: current.linkedStudents.includes(studentId)
        ? current.linkedStudents.filter((id) => id !== studentId)
        : [...current.linkedStudents, studentId],
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
        role: 'parent',
        linkedStudents: form.linkedStudents,
      });

      setForm(initialParentForm);
      setSuccess('Parent account created successfully. It can now log in through the dedicated parent portal.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create parent account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <UserRoundPlus className="h-6 w-6 text-emerald-600" /> Create Parent Account
        </h1>
        <p className="mt-1 text-slate-500">Create dedicated parent portal accounts and link them to one or more students.</p>
      </header>

      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Parent name" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Parent email" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Temporary password" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Parent mobile number" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" rows="3" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="mb-3 text-sm font-semibold text-emerald-800">Link Students</p>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-2">
            {!loading && students.length > 0 ? students.map((student) => (
              <label key={student._id} className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.linkedStudents.includes(student._id)}
                  onChange={() => handleStudentToggle(student._id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  <span className="block font-semibold text-slate-800">{student.name}</span>
                  <span className="block text-xs text-slate-500">{student.email} {student.studentId ? `• ${student.studentId}` : ''}</span>
                </span>
              </label>
            )) : (
              <p className="text-sm text-slate-500">{loading ? 'Loading students...' : 'No student records available yet.'}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Parent will log in from <span className="font-semibold">`/parent-login`</span>.
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
            {saving ? 'Creating...' : 'Create Parent'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminParents;
