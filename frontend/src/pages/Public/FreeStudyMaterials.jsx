import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  LibraryBig,
} from 'lucide-react';
import api from '../../services/api';

const sectionConfig = [
  {
    key: 'reference-books',
    label: 'Reference Books',
    description: 'Helpful books, guides, and supporting PDFs for stronger conceptual learning.',
    icon: BookMarked,
    accent: 'from-sky-100 via-white to-cyan-50',
    buttonClass: 'bg-sky-600 hover:bg-sky-700',
  },
  {
    key: 'ncert-solutions',
    label: 'NCERT Solutions',
    description: 'Step-by-step NCERT support to make revision cleaner and understanding deeper.',
    icon: BookOpen,
    accent: 'from-amber-100 via-white to-orange-50',
    buttonClass: 'bg-amber-500 hover:bg-amber-600',
  },
  {
    key: 'notes',
    label: 'Notes',
    description: 'Quick revision notes, chapter PDFs, and class-ready study sheets for students.',
    icon: FileText,
    accent: 'from-emerald-100 via-white to-teal-50',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
  },
];

const sectionMap = sectionConfig.reduce((acc, section) => {
  acc[section.key] = section;
  return acc;
}, {});

const sectionLabelByKey = sectionConfig.reduce((acc, section) => {
  acc[section.key] = section.label;
  return acc;
}, {});

const normalizeSectionKey = (value = '') =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

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

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const FreeStudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedSection = searchParams.get('section') || sectionConfig[0].key;
  const activeSection = sectionMap[requestedSection] ? requestedSection : sectionConfig[0].key;

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/public/free-study-materials');
        setMaterials(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load free study materials.');
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, []);

  const groupedMaterials = useMemo(() => {
    return materials.reduce((acc, material) => {
      const key = normalizeSectionKey(material.section);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(material);
      return acc;
    }, {});
  }, [materials]);

  const activeMaterials = groupedMaterials[activeSection] || [];

  const changeSection = (sectionKey) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('section', sectionKey);
    setSearchParams(nextParams);
  };

  return (
    <div className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_40%,#f8fafc_100%)] text-slate-800">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_38%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
            <LibraryBig className="h-4 w-4" />
            Free Study Material
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
            Open Learning Library
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Browse free notes, NCERT solutions, and reference-book PDFs uploaded by Maths Point for every student visiting the website.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.35)] sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Study Sections</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  Free resources for website visitors
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Use the section buttons below to open notes, NCERT solutions, or reference books.
                </p>
              </div>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:text-sky-900"
              >
                Explore paid courses too
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {sectionConfig.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.key;

                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => changeSection(section.key)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`mt-10 rounded-[32px] border border-slate-200 bg-gradient-to-br ${sectionMap[activeSection].accent} p-6 shadow-sm sm:p-8`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Active Section</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">{sectionMap[activeSection].label}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  {sectionMap[activeSection].description}
                </p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 px-5 py-4 text-sm font-medium text-slate-600 shadow-sm">
                {activeMaterials.length} file{activeMaterials.length === 1 ? '' : 's'} available
              </div>
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="mt-4 h-8 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : activeMaterials.length ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {activeMaterials.map((material, index) => (
                  <motion.article
                    key={material._id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {material.classLabel || sectionLabelByKey[activeSection]}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {formatDate(material.createdAt)}
                      </span>
                    </div>

                    <h4 className="mt-5 text-2xl font-bold leading-tight text-slate-900">
                      {material.title}
                    </h4>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {material.description || 'Free PDF material uploaded by Maths Point for open website access.'}
                    </p>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      File: <span className="font-semibold text-slate-800">{material.fileName}</span>
                    </div>

                    <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
                      <a
                        href={getFileHref(material.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${sectionMap[activeSection].buttonClass}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open PDF
                      </a>
                      <a
                        href={getFileHref(material.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500 shadow-sm">
                No free materials are published in {sectionMap[activeSection].label} yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FreeStudyMaterials;
