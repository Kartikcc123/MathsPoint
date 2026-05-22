import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock3,
  IndianRupee,
  Layers3,
  Sparkles,
  Users,
  X,
  ChevronRight,
  BookText,
  Circle,
} from 'lucide-react';
import api from '../../services/api';
import { buildSrcSet } from '../../utils/image';

const fallbackImages = [
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1596496050827-8299e0220de1?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070&auto=format&fit=crop',
];

const GRADIENTS = [
  ['#ff6b6b', '#ee0979'],
  ['#4776E6', '#8E54E9'],
  ['#11998e', '#38ef7d'],
  ['#F7971E', '#FFD200'],
  ['#c94b4b', '#4b134f'],
  ['#00b09b', '#96c93d'],
];

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

const categoryConfig = [
  { id: 'all', label: 'All Programs' },
  { id: 'class-5-8', label: 'Class 5-8th' },
  { id: 'class-9', label: 'Class 9th' },
  { id: 'class-10', label: 'Class 10th' },
  { id: 'class-11', label: 'Class 11th' },
  { id: 'class-12', label: 'Class 12th' },
  { id: 'iit-jee', label: 'IIT-JEE' },
  { id: 'boards', label: 'Boards' },
  { id: 'other', label: 'Other' },
];

const categoryMatchers = {
  'class-5-8': ['class 5', 'class 6', 'class 7', 'class 8', '5th', '6th', '7th', '8th', 'junior division'],
  'class-9': ['class 9', '9th', 'ix'],
  'class-10': ['class 10', '10th', 'x'],
  'class-11': ['class 11', '11th', 'xi'],
  'class-12': ['class 12', '12th', 'xii'],
  'iit-jee': ['iit jee', 'jee', 'jee mains', 'jee advanced', 'engineering entrance', 'dropper'],
  boards: ['board', 'cbse', 'icse', 'state board', 'school'],
};

const buildCourseHaystack = (course) =>
  [
    course.title,
    course.description,
    course.classLabel,
    ...(course.subjects || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const buildCourseSummary = (course) => {
  const subjects = (course.subjects || []).filter(Boolean);
  const subjectText = subjects.length ? subjects.join(', ') : 'core concepts';
  const durationText = course.duration || 'a flexible learning timeline';
  const feeText = typeof course.feeAmount === 'number' ? `Rs ${course.feeAmount}` : 'the listed fee';

  return {
    highlight: `${course.title} focuses on ${subjectText} and is structured for students who want a clear path through ${durationText}.`,
    support: `The program combines topic coverage, guided practice, and progress support around ${subjectText}, with the full course fee set at ${feeText}.`,
  };
};

const inferCourseCategory = (course) => {
  const haystack = buildCourseHaystack(course);

  const matchedCategory = Object.entries(categoryMatchers).find(([, terms]) =>
    terms.some((term) => haystack.includes(term))
  );

  return matchedCategory?.[0] || 'other';
};

const isBoardsCourse = (course) => {
  const haystack = buildCourseHaystack(course);
  const isBoardTagged = categoryMatchers.boards.some((term) => haystack.includes(term));
  const isClass10 = categoryMatchers['class-10'].some((term) => haystack.includes(term));
  const isClass12 = categoryMatchers['class-12'].some((term) => haystack.includes(term));

  return isBoardTagged && (isClass10 || isClass12);
};

const getAudienceLabel = (category) => {
  switch (category) {
    case 'class-5-8':
      return 'Junior Division';
    case 'class-9':
      return 'Foundation Batch';
    case 'class-10':
      return 'Board Booster';
    case 'class-11':
      return 'Senior Secondary';
    case 'class-12':
      return 'Exam Finisher';
    case 'iit-jee':
      return 'Competitive Track';
    case 'boards':
      return 'School Success';
    case 'other':
      return 'Special Program';
    default:
      return 'Featured Program';
  }
};

const formatFee = (feeAmount) => {
  if (typeof feeAmount !== 'number' || Number.isNaN(feeAmount)) {
    return 'Contact for fee';
  }

  return `Rs ${feeAmount.toLocaleString('en-IN')}`;
};

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const apiRoot = (api?.defaults?.baseURL || '').replace(/\/api$/, '');
  if (!apiRoot) return url;
  return `${apiRoot}${url.startsWith('/') ? '' : '/'}${url}`;
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/public/courses');
        const loadedCourses = res.data || [];
        setCourses(loadedCourses);

        const requestedCourseId = searchParams.get('course');
        if (requestedCourseId) {
          const matchedCourse = loadedCourses.find((course) => course._id === requestedCourseId);
          setSelectedCourse(matchedCourse || null);
        }
      } catch (error) {
        console.error('Failed to load courses page data', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [searchParams]);

  const activeCategory = searchParams.get('category') || 'all';

  const normalizedCourses = useMemo(
    () =>
      courses.map((course, index) => ({
        ...course,
        inferredCategory: inferCourseCategory(course),
        visual: course.thumbnail ? resolveImageUrl(course.thumbnail) : fallbackImages[index % fallbackImages.length],
      })),
    [courses]
  );

  const filteredCourses = useMemo(() => {
    if (activeCategory === 'all') {
      return normalizedCourses;
    }

    if (activeCategory === 'boards') {
      return normalizedCourses.filter((course) => isBoardsCourse(course));
    }

    return normalizedCourses.filter(
      (course) => course.inferredCategory === activeCategory
    );
  }, [activeCategory, normalizedCourses]);

  const courseCountLabel = useMemo(
    () => `${filteredCourses.length} program${filteredCourses.length === 1 ? '' : 's'} available now`,
    [filteredCourses.length]
  );

  const categoryCountLabel = useMemo(
    () => `${courses.length} admin-managed course${courses.length === 1 ? '' : 's'}`,
    [courses.length]
  );

  const selectedCourseSummary = useMemo(
    () => (selectedCourse ? buildCourseSummary(selectedCourse) : null),
    [selectedCourse]
  );

  const changeCategory = (category) => {
    const nextParams = new URLSearchParams(searchParams);

    if (category === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', category);
    }

    setSearchParams(nextParams);
  };

  const openCourseDetails = (course) => {
    setSelectedCourse(course);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('course', course._id);
    setSearchParams(nextParams);
  };

  const closeCourseDetails = () => {
    setSelectedCourse(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('course');
    setSearchParams(nextParams);
  };

  return (
    <div className="w-full bg-white text-slate-800">
      <section className="relative flex min-h-[340px] items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070&auto=format&fit=crop"
          srcSet={buildSrcSet('https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070&auto=format&fit=crop')}
          sizes="100vw"
          alt="Courses background"
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 z-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.72),rgba(14,165,233,0.3))]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 px-4 pt-10 text-center text-white"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-50">
            <Sparkles className="h-4 w-4" /> Dynamic Course Catalog
          </div>
          <h1 className="mb-4 font-serif text-4xl font-bold md:text-6xl">Our Courses</h1>
          <div className="mx-auto mb-4 h-1 w-16 bg-sky-400" />
          <p className="mx-auto max-w-2xl text-lg font-light text-gray-200 md:text-xl">
            Public course cards are powered by the same live course records created from your admin panel.
          </p>
        </motion.div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_-35px_rgba(15,23,42,0.28)] sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Browse Tracks</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Card-wise learning programs</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  A cleaner, PW-inspired card layout with a stronger visual hierarchy, while still staying fully connected to admin-created course data.
                </p>
              </div>

            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {categoryConfig.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => changeCategory(category.id)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/15'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-700'
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-12">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
                    <div className="h-44 animate-pulse bg-slate-200" />
                    <div className="space-y-4 p-6">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                      <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCourses.length ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course, idx) => {
                  const gradPair = GRADIENTS[idx % GRADIENTS.length] || ['#4776E6', '#8E54E9'];
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
                  <motion.article
                    key={course._id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: idx * 0.05 }}
                    className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    {/* â”€â”€ 1. Ad Banner / Thumbnail â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <div className="relative h-48 overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={resolveImageUrl(course.thumbnail)}
                          srcSet={buildSrcSet(resolveImageUrl(course.thumbnail))}
                          sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1600px"
                          alt={course.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center"
                          style={{ background: `linear-gradient(135deg, ${gradPair[0]}, ${gradPair[1]})` }}
                        >
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

                    {/* â”€â”€ 2. Card Body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                      {/* Row A: class label (orange) + language pill */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-orange-500">{classLabel}</span>
                        <span className="rounded border border-slate-300 px-2 py-0.5 text-[11px] font-bold tracking-wider text-slate-600">
                          {language}
                        </span>
                      </div>

                      {/* Row B: course title */}
                      <h3 className="mt-1.5 text-lg font-extrabold leading-snug text-slate-900">
                        {course.title}
                      </h3>

                      {/* Row C: purpose / category */}
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                        <BookText className="h-4 w-4 shrink-0" />
                        <span>{purpose}</span>
                      </div>

                      {/* Row D: ongoing + start date */}
                      <div className="mt-2 flex items-center gap-2 text-sm">
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

                      {/* Spacer to push pricing and button to bottom */}
                      <div className="flex-1" />

                      {/* Divider */}
                      <div className="my-4 border-t border-slate-100" />

                      {/* Row E: price row */}
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-extrabold text-slate-900">
                          {fee === 0 ? 'Free' : `₹${fee.toLocaleString('en-IN')}`}
                        </span>
                        {mrp > 0 && mrp !== fee && (
                          <span className="pb-1 text-sm font-medium text-slate-400 line-through">
                            ₹{mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      {discount && (
                        <p className="mt-0.5 text-sm font-bold text-green-600">{discount}% OFF</p>
                      )}

                      {/* Row F: Buy Now + Arrow */}
                      <div className="mt-4 flex items-center gap-2">
                        <Link
                          to={`/checkout/${course._id}`}
                          className="flex-1 rounded-2xl bg-slate-900 py-3.5 text-center text-sm font-bold text-white transition hover:bg-sky-700 active:scale-95"
                        >
                          Buy Now
                        </Link>
                        <button
                          onClick={() => openCourseDetails(course)}
                          className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                          aria-label="View Details"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm">
                No courses match this filter yet. The layout is still connected to your admin panel, so any new course added there will appear here automatically.
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_minmax(0,1fr)] overflow-y-auto">
              <div className="relative min-h-[320px] overflow-hidden bg-slate-950">
                <img
                  src={normalizedCourses.find((course) => course._id === selectedCourse._id)?.visual || fallbackImages[0]}
                  srcSet={buildSrcSet(normalizedCourses.find((course) => course._id === selectedCourse._id)?.visual || fallbackImages[0])}
                  sizes="100vw"
                  alt={selectedCourse.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute left-6 top-6 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
                  {getAudienceLabel(inferCourseCategory(selectedCourse))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">Course Overview</p>
                  <h2 className="mt-3 font-serif text-4xl font-bold">{selectedCourse.title}</h2>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-sky-50/85">
                    {selectedCourseSummary?.highlight}
                  </p>
                </div>
              </div>

              <div className="relative p-8">
                <button
                  type="button"
                  onClick={closeCourseDetails}
                  className="absolute right-6 top-6 rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="space-y-6 pr-10">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Program Details</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{selectedCourse.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">{selectedCourse.description}</p>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">{selectedCourseSummary?.support}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Duration</p>
                      <p className="mt-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                        <Clock3 className="h-5 w-5 text-sky-600" /> {selectedCourse.duration || 'Flexible duration'}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Course Fee</p>
                      <p className="mt-3 flex items-center gap-2 text-lg font-bold text-green-700">
                        <IndianRupee className="h-5 w-5" /> {formatFee(selectedCourse.feeAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Managed From</p>
                      <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Layers3 className="h-4 w-4 text-sky-700" /> Admin course management panel
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Designed For</p>
                      <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Users className="h-4 w-4 text-sky-700" /> {getAudienceLabel(inferCourseCategory(selectedCourse))}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Subjects Included</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {(selectedCourse.subjects || []).length ? (
                        selectedCourse.subjects.map((subject) => (
                          <span key={subject} className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800">
                            <CheckCircle className="h-4 w-4" /> {subject}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">Subjects will be updated by admin.</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-sky-100 bg-sky-50 p-5">
                    <p className="text-sm leading-relaxed text-sky-900">
                      This course page stays synced with your admin panel. If the admin adds, edits, or removes a course, the public card and this details view reflect that live backend data.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                      to={`/checkout/${selectedCourse._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3 font-bold text-zinc-950 transition hover:brightness-105"
                    >
                      Buy Now <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={closeCourseDetails}
                      className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
