import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const fallbackImages = [
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1596496050827-8299e0220de1?q=80&w=2070&auto=format&fit=crop',
];

const CoursesSection = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await api.get('/public/courses');
        setCourses(res.data || []);
      } catch (error) {
        console.error('Failed to load public courses', error);
      }
    };

    loadCourses();
  }, []);

  return (
    <section id="courses" className="bg-stone-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="mb-4 font-serif text-4xl font-bold text-slate-900">Our Core Programs</h2>
          <div className="mx-auto mb-6 h-1 w-16 bg-amber-500"></div>
          <p className="text-lg text-gray-600">These courses are loaded directly from the admin panel and updated live on the website.</p>
        </motion.div>

        {courses.length ? (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {courses.slice(0, 3).map((course, idx) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group flex flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-950/10"
                >
                  <div className="h-56 overflow-hidden">
                    <img
                      src={fallbackImages[idx % fallbackImages.length]}
                      alt={course.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-grow flex-col p-8">
                    <h3 className="mb-3 font-serif text-2xl font-bold text-slate-900">{course.title}</h3>
                    <p className="mb-6 line-clamp-3 flex-grow text-gray-600">{course.description}</p>

                    <div className="mb-6 space-y-3 text-sm text-slate-600">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-amber-600" />
                        <span>{(course.subjects || []).slice(0, 3).join(', ') || 'Subjects will be updated by admin'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span>{course.duration || 'Flexible duration'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <IndianRupee className="h-4 w-4 text-amber-700" />
                        <span>Rs {course.feeAmount}</span>
                      </div>
                    </div>

                    <Link
                      to={`/courses?course=${course._id}`}
                      className="mt-auto inline-flex w-max items-center gap-1 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 hover:text-amber-900"
                    >
                      Learn More <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Load More Courses <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
            No courses have been created by admin yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesSection;
