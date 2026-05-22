import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, FileStack, Trash2, UploadCloud } from 'lucide-react';
import api from '../../services/api';

const initialForm = {
  title: '',
  description: '',
  section: 'Reference Books',
  classLabel: '',
  file: null,
};

const sectionOptions = ['Reference Books', 'NCERT Solutions', 'Notes'];

const getFileHref = (fileUrl) => {
  if (!fileUrl) {
    return '#';
  }

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  const base = api.defaults.baseURL || '';

  try {
    const origin = new URL(base).origin;
    return `${origin}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;
  } catch (_error) {
    return fileUrl;
  }
};

const AdminFreeMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/free-materials');
      setMaterials(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load free study materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const materialCount = useMemo(
    () => `${materials.length} file${materials.length === 1 ? '' : 's'} published`,
    [materials.length]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((current) => ({
      ...current,
      file,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!form.file) {
        throw new Error('Please choose a file to upload.');
      }

      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('description', form.description);
      payload.append('section', form.section);
      payload.append('classLabel', form.classLabel);
      payload.append('file', form.file);

      await api.post('/admin/free-materials', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Free study material uploaded successfully.');
      resetForm();
      await loadMaterials();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload free study material.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (material) => {
    const confirmed = window.confirm(`Delete "${material.title}" from the public free study material page?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(material._id);
    setError('');
    setSuccess('');

    try {
      const res = await api.delete(`/admin/free-materials/${material._id}`);
      setSuccess(res.data?.message || 'Material deleted successfully.');
      setMaterials((current) => current.filter((item) => item._id !== material._id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete free study material.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <FileStack className="h-6 w-6 text-sky-600" />
            Free Study Material Library
          </h2>
          <p className="mt-1 tracking-wide text-slate-500">
            Upload notes, NCERT solutions, books, and public PDF resources visible to every visitor on the website.
          </p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-3 text-sm font-semibold text-sky-800">
          {materialCount}
        </div>
      </header>

      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Upload Public Content</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Publish a free file</h3>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              This content will appear on the public free study material page for all students and visitors.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Material title"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <select
                name="section"
                value={form.section}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                {sectionOptions.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>

              <input
                name="classLabel"
                value={form.classLabel}
                onChange={handleChange}
                placeholder="Class label, e.g. Class 10"
                className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              placeholder="Short description about this PDF or study material"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-sky-300 hover:bg-sky-50/40">
              <UploadCloud className="h-8 w-8 text-sky-600" />
              <span className="mt-3 text-sm font-semibold text-slate-700">
                {form.file ? form.file.name : 'Choose PDF, image, or Word document'}
              </span>
              <span className="mt-1 text-xs text-slate-500">
                Supported formats: PDF, image, DOC, DOCX up to 50 MB
              </span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx" onChange={handleFileChange} className="hidden" />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <UploadCloud className="h-5 w-5" />
              {saving ? 'Uploading...' : 'Upload Free Material'}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-800">Published Library Items</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {!loading && materials.length > 0 ? (
              materials.map((material) => (
                <div key={material._id} className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {material.section}
                      </span>
                      {material.classLabel && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {material.classLabel}
                        </span>
                      )}
                    </div>
                    <h4 className="mt-3 text-lg font-bold text-slate-900">{material.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {material.description || 'No description added.'}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">{material.fileName}</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href={getFileHref(material.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(material)}
                      disabled={deletingId === material._id}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === material._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-14 text-center text-slate-500">
                {loading ? 'Loading free study materials...' : 'No free study materials uploaded yet.'}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminFreeMaterials;
