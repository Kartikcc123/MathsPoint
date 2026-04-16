import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Edit3, LoaderCircle, Megaphone, Search, Send } from 'lucide-react';
import api from '../../services/api';

const initialForm = {
  title: '',
  message: '',
  target: 'All',
  studentId: '',
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [notificationsRes, studentsRes] = await Promise.all([
        api.get('/admin/notifications'),
        api.get('/admin/students'),
      ]);

      setNotifications(notificationsRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredNotifications = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return notifications;

    return notifications.filter((notification) =>
      [
        notification.title,
        notification.message,
        notification.target,
        notification.studentId?.name,
        notification.studentId?.email,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [notifications, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId('');
  };

  const handleEdit = (notification) => {
    setEditingId(notification._id);
    setForm({
      title: notification.title || '',
      message: notification.message || '',
      target: notification.target || 'All',
      studentId: notification.studentId?._id || '',
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        target: form.target,
        studentId: form.target === 'Student' ? form.studentId : '',
      };

      const res = editingId
        ? await api.patch(`/admin/notifications/${editingId}`, payload)
        : await api.post('/admin/notifications', payload);

      const savedNotification = res.data;

      setNotifications((current) => {
        if (editingId) {
          return current.map((notification) => (notification._id === savedNotification._id ? savedNotification : notification));
        }

        return [savedNotification, ...current];
      });

      setSuccess(editingId ? 'Notification updated successfully.' : 'Notification created successfully.');
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save notification.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <Bell className="h-6 w-6 text-blue-600" /> Notification Panel
          </h2>
          <p className="mt-1 tracking-wide text-slate-500">Create announcements here and show the same saved notifications in the student panel.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
          <Megaphone className="h-4 w-4" /> Live student visibility
        </div>
      </header>

      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">{editingId ? 'Update Notification' : 'Create Notification'}</h3>
            <p className="mt-1 text-sm text-slate-500">Use `All` for broadcast messages or `Student` for one learner.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Notification title"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              placeholder="Notification message"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              name="target"
              value={form.target}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              <option value="Student">Student</option>
              <option value="Parent">Parent</option>
            </select>

            {form.target === 'Student' && (
              <select
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.studentId || student.email})
                  </option>
                ))}
              </select>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {saving ? 'Saving...' : editingId ? 'Update Notification' : 'Publish Notification'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Saved Notifications</h3>
              <p className="text-sm text-slate-500">These are the same records students will receive in their notification dropdown.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notifications..."
                className="w-full rounded-2xl border border-slate-200 py-2.5 pl-9 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="flex min-h-[240px] items-center justify-center gap-3 text-slate-500">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Loading notifications...
              </div>
            ) : filteredNotifications.length ? (
              filteredNotifications.map((notification) => (
                <div key={notification._id} className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-slate-800">{notification.title}</h4>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{notification.target}</span>
                        {notification.studentId ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {notification.studentId.name}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600">{notification.message}</p>
                      <p className="text-xs text-slate-400">
                        Updated {new Date(notification.updatedAt || notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEdit(notification)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <Edit3 className="h-4 w-4" /> Edit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-500">No notifications found yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminNotifications;
