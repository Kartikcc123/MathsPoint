import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, IndianRupee, CheckCircle, ArrowRight, X, Sparkles } from 'lucide-react';
import api from '../../services/api';

const fallbackImages = [
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1596496050827-8299e0220de1?q=80&w=2070&auto=format&fit=crop',
];

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

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const loadCourses = async () => {
      try {
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
      }
    };

    loadCourses();
  }, [searchParams]);

  const courseCountLabel = useMemo(
    () => `${courses.length} active program${courses.length === 1 ? '' : 's'} from the admin panel`,
    [courses.length]
  );

  const openCourseDetails = (course) => {
    setSelectedCourse(course);
    setSearchParams({ course: course._id });
  };

  const closeCourseDetails = () => {
    setSelectedCourse(null);
    setSearchParams({});
  };

  const selectedCourseSummary = useMemo(
    () => (selectedCourse ? buildCourseSummary(selectedCourse) : null),
    [selectedCourse]
  );

  return (
    <div className="w-full bg-white text-gray-800">
      <section className="relative flex min-h-[340px] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,rgba(24,24,27,0.88),rgba(120,53,15,0.72),rgba(234,179,8,0.34))]"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 px-4 pt-10 text-center text-white"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-50">
            <Sparkles className="h-4 w-4" /> Live Course Catalog
          </div>
          <h1 className="mb-4 font-serif text-4xl font-bold md:text-6xl">Our Programs</h1>
          <div className="mx-auto mb-4 h-1 w-16 bg-amber-400"></div>
          <p className="mx-auto max-w-2xl text-lg font-light text-gray-200 md:text-xl">
            {courseCountLabel}. Explore a course, open the full details card, and then continue to enroll.
          </p>
        </motion.div>
      </section>

      <section className="bg-stone-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {courses.length ? (
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {courses.map((course, idx) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="group flex flex-col overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img src={fallbackImages[idx % fallbackImages.length]} alt={course.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-6 right-6">
                      <h2 className="font-serif text-2xl font-bold text-white">{course.title}</h2>
                      <span className="font-medium text-amber-200">{course.duration || 'Open Duration'}</span>
                    </div>
                  </div>

                  <div className="flex flex-grow flex-col p-8">
                    <p className="mb-6 line-clamp-3 flex-grow text-gray-600">{course.description}</p>

                    <ul className="mb-8 space-y-4">
                      <li className="flex items-center gap-3 text-gray-600">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50">
                          <BookOpen className="h-4 w-4 text-amber-600" />
                        </div>
                        <span className="font-medium">Subjects:</span>
                        <span className="font-semibold text-slate-900">{(course.subjects || []).slice(0, 3).join(', ') || 'Not added'}</span>
                      </li>
                      <li className="flex items-center gap-3 text-gray-600">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50">
                          <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                        <span className="font-medium">Duration:</span>
                        <span className="font-semibold text-slate-900">{course.duration || 'Flexible'}</span>
                      </li>
                      <li className="flex items-center gap-3 text-gray-600">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50">
                          <IndianRupee className="h-4 w-4 text-amber-700" />
                        </div>
                        <span className="font-medium">Fee:</span>
                        <span className="font-semibold text-amber-800">Rs {course.feeAmount}</span>
                      </li>
                    </ul>

                    <button
                      type="button"
                      onClick={() => openCourseDetails(course)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 py-4 font-bold text-zinc-950 transition duration-300 hover:brightness-105"
                    >
                      Learn More <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm">
              No courses have been created by admin yet.
            </div>
          )}
        </div>
      </section>

      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_minmax(0,1fr)]">
              <div className="relative min-h-[320px] overflow-hidden bg-slate-950">
                <img
                  src={fallbackImages[courses.findIndex((course) => course._id === selectedCourse._id) % fallbackImages.length] || fallbackImages[0]}
                  alt={selectedCourse.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">Course Overview</p>
                  <h2 className="mt-3 font-serif text-4xl font-bold">{selectedCourse.title}</h2>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-amber-50/85">
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
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Program Details</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{selectedCourse.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                      {selectedCourse.description}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                      {selectedCourseSummary?.support}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Duration</p>
                      <p className="mt-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                        <Clock className="h-5 w-5 text-amber-600" /> {selectedCourse.duration || 'Flexible duration'}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Course Fee</p>
                      <p className="mt-3 flex items-center gap-2 text-lg font-bold text-green-700">
                        <IndianRupee className="h-5 w-5" /> Rs {selectedCourse.feeAmount}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Subjects Included</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {(selectedCourse.subjects || []).length ? (
                        selectedCourse.subjects.map((subject) => (
                          <span key={subject} className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
                            <CheckCircle className="h-4 w-4" /> {subject}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">Subjects will be updated by admin.</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-amber-100 bg-amber-50 p-5">
                    <p className="text-sm leading-relaxed text-amber-900">
                      This learning track is built around {((selectedCourse.subjects || []).filter(Boolean).join(', ')) || 'the published syllabus'}, with a planned duration of {selectedCourse.duration || 'a flexible schedule'} and a current fee of Rs {selectedCourse.feeAmount}.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3 font-bold text-zinc-950 transition hover:brightness-105"
                    >
                      Enroll Now <ArrowRight className="h-4 w-4" />
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
