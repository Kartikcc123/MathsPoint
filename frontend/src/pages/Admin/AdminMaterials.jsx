import React, { useEffect, useMemo, useState } from 'react';
import { FolderOpen, UploadCloud, Link as LinkIcon, Trash2, X } from 'lucide-react';
import api from '../../services/api';

const initialForm = {
  course: '',
  title: '',
  description: '',
  type: 'Notes',
  moduleName: '',
  fileUrl: '',
};

const AdminMaterials = () => {
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingMaterialId, setDeletingMaterialId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, materialsRes] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/materials'),
      ]);
      setCourses(coursesRes.data || []);
      setMaterials(materialsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const materialCount = useMemo(() => `${materials.length} published item${materials.length === 1 ? '' : 's'}`, [materials.length]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
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
      if (!form.fileUrl.trim()) {
        throw new Error('Please provide a Google Drive or direct material link.');
      }

      const payload = new FormData();
      payload.append('course', form.course);
      payload.append('title', form.title);
      payload.append('description', form.description);
      payload.append('type', form.type);
      payload.append('moduleName', form.moduleName);
      payload.append('fileUrl', form.fileUrl.trim());

      const res = await api.post('/admin/material', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMaterials((current) => [res.data, ...current]);
      setSuccess('Material published successfully.');
      closeModal();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to publish material.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMaterial = async (material) => {
    const confirmed = window.confirm(`Delete "${material.title}"? This material link will be removed from the website.`);

    if (!confirmed) {
      return;
    }

    setDeletingMaterialId(material._id);
    setError('');
    setSuccess('');

    try {
      const res = await api.delete(`/admin/material/${material._id}`);
      setMaterials((current) => current.filter((item) => item._id !== material._id));
      setSuccess(res.data?.message || 'Material deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete material.');
    } finally {
      setDeletingMaterialId('');
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <FolderOpen className="h-6 w-6 text-cyan-600" /> Publish Course Materials
          </h2>
          <p className="mt-1 tracking-wide text-slate-500">Publish notes and study materials using a Google Drive or direct link only.</p>
        </div>
        <button onClick={openModal} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-cyan-700">
          <UploadCloud className="h-5 w-5" /> Publish Material
        </button>
      </header>

      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Published</p>
          <p className="mt-3 text-3xl font-bold text-slate-800">{materials.length}</p>
          <p className="mt-2 text-sm text-slate-500">Visible in student materials tab</p>
        </div>
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Courses ready</p>
          <p className="mt-3 text-3xl font-bold text-slate-800">{courses.length}</p>
          <p className="mt-2 text-sm text-slate-500">Choose a target course when publishing</p>
        </div>
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Library status</p>
          <p className="mt-3 text-lg font-semibold text-slate-800">{materialCount}</p>
          <p className="mt-2 text-sm text-slate-500">All materials are now published through shareable links</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">Published Materials</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-100 bg-white text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Module</th>
                <th className="px-6 py-4 font-semibold">Link</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && materials.length > 0 ? materials.map((material) => (
                <tr key={material._id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{material.title}</p>
                    <p className="text-xs text-slate-500">{material.description || 'No description'}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{material.course?.title || 'Unknown course'}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">{material.type}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{material.moduleName || 'General'}</td>
                  <td className="px-6 py-4">
                    <a href={material.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                      <LinkIcon className="h-4 w-4" /> Open
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleDeleteMaterial(material)}
                      disabled={deletingMaterialId === material._id}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingMaterialId === material._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-14 text-center text-slate-500">
                    {loading ? 'Loading materials...' : 'No materials published yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Publish Material</h3>
                <p className="text-sm text-slate-500">Paste a Google Drive or direct link for notes, assignments, videos, and other study material.</p>
              </div>
              <button onClick={closeModal} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <select name="course" value={form.course} onChange={handleChange} required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
                <select name="type" value={form.type} onChange={handleChange} className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Notes">Notes</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Practice Set">Practice Set</option>
                  <option value="Video">Video</option>
                  <option value="Link">Link</option>
                </select>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Material title" required className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="moduleName" value={form.moduleName} onChange={handleChange} placeholder="Module / chapter name" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="space-y-3 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3 text-slate-700">
                  <LinkIcon className="h-5 w-5 text-blue-500" />
                  <p className="font-semibold">Use a Google Drive or direct material URL</p>
                </div>
                <input
                  name="fileUrl"
                  type="url"
                  value={form.fileUrl}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-slate-500">
                  Add the shareable Drive link where your notes, assignments, videos, or other study materials are stored.
                </p>
              </div>

              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description or instructions" rows="4" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-2xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70">
                  {saving ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaterials;
