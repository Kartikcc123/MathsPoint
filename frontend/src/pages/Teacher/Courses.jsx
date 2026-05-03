import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import api from '../../services/api';

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/admin/courses');
        setCourses(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assigned courses.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <BookOpen className="h-6 w-6 text-sky-500" /> Assigned Courses
        </h1>
        <p className="mt-1 text-slate-500">This list is filtered by the teacher-course assignments configured in the backend.</p>
      </header>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {!loading && courses.length ? courses.map((course) => (
          <article key={course._id} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Course</p>
            <h2 className="mt-3 text-xl font-bold text-slate-800">{course.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{course.description}</p>
            <div className="mt-5 flex items-center justify-between text-sm font-medium text-slate-600">
              <span>{course.duration || 'Duration pending'}</span>
              <span>Rs {course.feeAmount || 0}</span>
            </div>
          </article>
        )) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 md:col-span-2 xl:col-span-3">
            {loading ? 'Loading assigned courses...' : 'No courses are assigned yet.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCourses;
