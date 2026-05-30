import React, { useEffect, useMemo, useState } from 'react';
import {
  GripVertical,
  ImagePlus,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  ArrowUp,
  ArrowDown,
  Users,
  PanelsTopLeft,
} from 'lucide-react';
import api from '../../services/api';
import { resolveMediaUrl } from '../../utils/media';

const createClientId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyAd = () => ({
  _clientId: createClientId(),
  title: '',
  subtitle: '',
  imageUrl: '',
  file: null,
  previewUrl: '',
  linkLabel: '',
  linkUrl: '',
});

const createEmptyFaculty = () => ({
  _clientId: createClientId(),
  name: '',
  subject: '',
  exp: '',
  tag: '',
  desc: '',
  img: '',
  file: null,
  previewUrl: '',
});

const createEmptySpotlight = () => ({
  primaryImageUrl: '',
  primaryAlt: 'Lead student',
  primaryQuote: '',
  primaryFile: null,
  primaryPreviewUrl: '',
  secondaryImageUrl: '',
  secondaryAlt: 'Student',
  secondaryQuote: '',
  secondaryFile: null,
  secondaryPreviewUrl: '',
});

const mapIncomingAd = (ad = {}) => ({
  ...createEmptyAd(),
  ...ad,
  previewUrl: ad.imageUrl ? resolveMediaUrl(ad.imageUrl) : '',
});

const mapIncomingFaculty = (faculty = {}) => ({
  ...createEmptyFaculty(),
  ...faculty,
  previewUrl: faculty.img ? resolveMediaUrl(faculty.img) : '',
});

const mapIncomingSpotlight = (spotlight = {}) => ({
  ...createEmptySpotlight(),
  ...spotlight,
  primaryPreviewUrl: spotlight.primaryImageUrl ? resolveMediaUrl(spotlight.primaryImageUrl) : '',
  secondaryPreviewUrl: spotlight.secondaryImageUrl ? resolveMediaUrl(spotlight.secondaryImageUrl) : '',
});

const AdminHomeContent = () => {
  const [heroAds, setHeroAds] = useState([]);
  const [studentSpotlight, setStudentSpotlight] = useState(createEmptySpotlight());
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadContent = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/home-content');
      const data = res.data || {};
      setHeroAds((data.heroAds || []).map(mapIncomingAd));
      setStudentSpotlight(mapIncomingSpotlight(data.studentSpotlight || {}));
      setFaculties((data.faculties || []).map(mapIncomingFaculty));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load home content settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const stats = useMemo(
    () => ({
      ads: heroAds.length,
      faculty: faculties.length,
    }),
    [heroAds.length, faculties.length]
  );

  const moveItem = (items, fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= items.length) {
      return items;
    }

    const next = [...items];
    const [picked] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, picked);
    return next;
  };

  const handleAdChange = (index, field, value) => {
    setHeroAds((current) =>
      current.map((ad, idx) => (idx === index ? { ...ad, [field]: value } : ad))
    );
  };

  const handleFacultyChange = (index, field, value) => {
    setFaculties((current) =>
      current.map((faculty, idx) => (idx === index ? { ...faculty, [field]: value } : faculty))
    );
  };

  const handleAdFileChange = (index, file) => {
    if (!file) {
      return;
    }

    setHeroAds((current) =>
      current.map((ad, idx) =>
        idx === index
          ? {
              ...ad,
              file,
              previewUrl: URL.createObjectURL(file),
            }
          : ad
      )
    );
  };

  const handleFacultyFileChange = (index, file) => {
    if (!file) {
      return;
    }

    setFaculties((current) =>
      current.map((faculty, idx) =>
        idx === index
          ? {
              ...faculty,
              file,
              previewUrl: URL.createObjectURL(file),
            }
          : faculty
      )
    );
  };

  const handleSpotlightFileChange = (field, file) => {
    if (!file) {
      return;
    }

    const previewField = field === 'primaryFile' ? 'primaryPreviewUrl' : 'secondaryPreviewUrl';
    setStudentSpotlight((current) => ({
      ...current,
      [field]: file,
      [previewField]: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        heroAds: heroAds.map((ad) => {
          const imageFileKey = ad.file ? `hero-ad-${ad._clientId}` : '';
          return {
            title: ad.title,
            subtitle: ad.subtitle,
            imageUrl: ad.imageUrl,
            linkLabel: ad.linkLabel,
            linkUrl: ad.linkUrl,
            imageFileKey,
          };
        }),
        studentSpotlight: {
          primaryImageUrl: studentSpotlight.primaryImageUrl,
          primaryAlt: studentSpotlight.primaryAlt,
          primaryQuote: studentSpotlight.primaryQuote,
          primaryImageFileKey: studentSpotlight.primaryFile ? 'student-spotlight-primary' : '',
          secondaryImageUrl: studentSpotlight.secondaryImageUrl,
          secondaryAlt: studentSpotlight.secondaryAlt,
          secondaryQuote: studentSpotlight.secondaryQuote,
          secondaryImageFileKey: studentSpotlight.secondaryFile ? 'student-spotlight-secondary' : '',
        },
        faculties: faculties.map((faculty) => {
          const imageFileKey = faculty.file ? `faculty-${faculty._clientId}` : '';
          return {
            name: faculty.name,
            subject: faculty.subject,
            exp: faculty.exp,
            tag: faculty.tag,
            desc: faculty.desc,
            img: faculty.img,
            imageFileKey,
          };
        }),
      };

      const formData = new FormData();
      formData.append('payload', JSON.stringify(payload));

      heroAds.forEach((ad) => {
        if (ad.file) {
          formData.append(`hero-ad-${ad._clientId}`, ad.file);
        }
      });

      if (studentSpotlight.primaryFile) {
        formData.append('student-spotlight-primary', studentSpotlight.primaryFile);
      }

      if (studentSpotlight.secondaryFile) {
        formData.append('student-spotlight-secondary', studentSpotlight.secondaryFile);
      }

      faculties.forEach((faculty) => {
        if (faculty.file) {
          formData.append(`faculty-${faculty._clientId}`, faculty.file);
        }
      });

      const res = await api.put('/admin/home-content', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data?.homeContent || {};
      setHeroAds((data.heroAds || []).map(mapIncomingAd));
      setStudentSpotlight(mapIncomingSpotlight(data.studentSpotlight || {}));
      setFaculties((data.faculties || []).map(mapIncomingFaculty));
      setSuccess(res.data?.message || 'Home page content saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save home page content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-7xl items-center justify-center px-4 pb-20 pt-8 sm:px-8">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading home content editor...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <PanelsTopLeft className="h-6 w-6 text-sky-600" />
            Home Content Manager
          </h2>
          <p className="mt-1 text-slate-500">
            Edit hero advertisements, student spotlight images, and home faculty cards from one admin panel.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
            {stats.ads} ads
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {stats.faculty} faculty cards
          </div>
        </div>
      </header>

      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Hero Ads</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">Manage home page posters</h3>
            </div>
            <button
              type="button"
              onClick={() => setHeroAds((current) => [...current, createEmptyAd()])}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Add Advertisement
            </button>
          </div>

          <div className="space-y-5">
            {heroAds.length ? heroAds.map((ad, index) => (
              <div key={ad._clientId} className="rounded-[24px] border border-slate-200 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <GripVertical className="h-4 w-4 text-slate-400" />
                    Advertisement {index + 1}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setHeroAds((current) => moveItem(current, index, index - 1))} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Move ad up">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setHeroAds((current) => moveItem(current, index, index + 1))} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Move ad down">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setHeroAds((current) => current.filter((_, idx) => idx !== index))} className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100" aria-label="Delete ad">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                  <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-sky-300 hover:bg-sky-50/40">
                    {ad.previewUrl ? (
                      <img src={ad.previewUrl} alt={ad.title || 'Advertisement preview'} className="max-h-[240px] w-full rounded-2xl object-contain" />
                    ) : (
                      <>
                        <ImagePlus className="h-8 w-8 text-sky-600" />
                        <span className="mt-3 text-sm font-semibold text-slate-700">Upload advertisement image</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={(event) => handleAdFileChange(index, event.target.files?.[0] || null)} className="hidden" />
                  </label>

                  <div className="grid gap-4">
                    <input value={ad.title} onChange={(event) => handleAdChange(index, 'title', event.target.value)} placeholder="Ad title for admin reference" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                    <textarea value={ad.subtitle} onChange={(event) => handleAdChange(index, 'subtitle', event.target.value)} rows="3" placeholder="Short note or subtitle" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                    <div className="grid gap-4 md:grid-cols-2">
                      <input value={ad.linkLabel} onChange={(event) => handleAdChange(index, 'linkLabel', event.target.value)} placeholder="Optional button label" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                      <input value={ad.linkUrl} onChange={(event) => handleAdChange(index, 'linkUrl', event.target.value)} placeholder="Optional button URL" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-500">
                No hero advertisements added yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Student Spotlight</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Update the student image section</h3>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 p-5">
              <p className="mb-4 text-sm font-semibold text-slate-700">Primary student image</p>
              <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-sky-300 hover:bg-sky-50/40">
                {studentSpotlight.primaryPreviewUrl ? (
                  <img src={studentSpotlight.primaryPreviewUrl} alt={studentSpotlight.primaryAlt || 'Primary student preview'} className="max-h-[280px] w-full rounded-2xl object-contain" />
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-sky-600" />
                    <span className="mt-3 text-sm font-semibold text-slate-700">Upload primary image</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={(event) => handleSpotlightFileChange('primaryFile', event.target.files?.[0] || null)} className="hidden" />
              </label>
              <div className="mt-4 grid gap-4">
                <input value={studentSpotlight.primaryAlt} onChange={(event) => setStudentSpotlight((current) => ({ ...current, primaryAlt: event.target.value }))} placeholder="Primary image alt text" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                <textarea value={studentSpotlight.primaryQuote} onChange={(event) => setStudentSpotlight((current) => ({ ...current, primaryQuote: event.target.value }))} rows="3" placeholder="Primary speech bubble text" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 p-5">
              <p className="mb-4 text-sm font-semibold text-slate-700">Secondary student image</p>
              <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-sky-300 hover:bg-sky-50/40">
                {studentSpotlight.secondaryPreviewUrl ? (
                  <img src={studentSpotlight.secondaryPreviewUrl} alt={studentSpotlight.secondaryAlt || 'Secondary student preview'} className="max-h-[280px] w-full rounded-2xl object-contain" />
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-sky-600" />
                    <span className="mt-3 text-sm font-semibold text-slate-700">Upload secondary image</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={(event) => handleSpotlightFileChange('secondaryFile', event.target.files?.[0] || null)} className="hidden" />
              </label>
              <div className="mt-4 grid gap-4">
                <input value={studentSpotlight.secondaryAlt} onChange={(event) => setStudentSpotlight((current) => ({ ...current, secondaryAlt: event.target.value }))} placeholder="Secondary image alt text" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                <textarea value={studentSpotlight.secondaryQuote} onChange={(event) => setStudentSpotlight((current) => ({ ...current, secondaryQuote: event.target.value }))} rows="3" placeholder="Secondary speech bubble text" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Faculty Cards</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">Edit home faculty section in order</h3>
            </div>
            <button
              type="button"
              onClick={() => setFaculties((current) => [...current, createEmptyFaculty()])}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Add Faculty
            </button>
          </div>

          <div className="space-y-5">
            {faculties.length ? faculties.map((faculty, index) => (
              <div key={faculty._clientId} className="rounded-[24px] border border-slate-200 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Users className="h-4 w-4 text-slate-400" />
                    Faculty {index + 1}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setFaculties((current) => moveItem(current, index, index - 1))} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Move faculty up">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setFaculties((current) => moveItem(current, index, index + 1))} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Move faculty down">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setFaculties((current) => current.filter((_, idx) => idx !== index))} className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100" aria-label="Delete faculty">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
                  <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-sky-300 hover:bg-sky-50/40">
                    {faculty.previewUrl ? (
                      <img src={faculty.previewUrl} alt={faculty.name || 'Faculty preview'} className="max-h-[240px] w-full rounded-2xl object-contain" />
                    ) : (
                      <>
                        <ImagePlus className="h-8 w-8 text-sky-600" />
                        <span className="mt-3 text-sm font-semibold text-slate-700">Upload faculty image</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={(event) => handleFacultyFileChange(index, event.target.files?.[0] || null)} className="hidden" />
                  </label>

                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <input value={faculty.name} onChange={(event) => handleFacultyChange(index, 'name', event.target.value)} placeholder="Faculty name" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                      <input value={faculty.subject} onChange={(event) => handleFacultyChange(index, 'subject', event.target.value)} placeholder="Subject" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <input value={faculty.exp} onChange={(event) => handleFacultyChange(index, 'exp', event.target.value)} placeholder="Experience, e.g. 12 Years" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                      <input value={faculty.tag} onChange={(event) => handleFacultyChange(index, 'tag', event.target.value)} placeholder="Tag, e.g. Director" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                    </div>
                    <textarea value={faculty.desc} onChange={(event) => handleFacultyChange(index, 'desc', event.target.value)} rows="4" placeholder="Short faculty description" className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-500">
                No faculty cards added yet.
              </div>
            )}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {saving ? 'Saving changes...' : 'Save Home Content'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminHomeContent;
