import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, ExternalLink, FileText } from 'lucide-react';
import api from '../../services/api';
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus';

const MyCourses = () => {
  const [data, setData] = useState({ course: null, materials: [] });

  useRefreshOnFocus(async () => {
    try {
      const res = await api.get('/student/dashboard');
      setData({ course: res.data.course, materials: res.data.materials || [] });
    } catch (error) {
      console.error('Failed to load student courses', error);
    }
  });

  const { course, materials } = data;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">My Enrolled Courses</h1>
        <p className="mt-1 text-slate-500">Only the course assigned by the admin panel is shown here.</p>
      </header>

      {course ? (
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-8 md:flex-row">
            <Link to="/student/courses/active" className="group flex aspect-video w-full items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-500 text-white md:w-1/3">
              <div className="px-6 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-100/80">{course.duration || 'Open batch'}</p>
                <h2 className="mt-3 text-2xl font-bold">{course.title}</h2>
              </div>
            </Link>
            <div className="flex w-full flex-col justify-center md:w-2/3">
              <div className="mb-2 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-blue-600">
                Assigned Course
              </div>
              <Link to="/student/courses/active" className="inline-block transition hover:text-blue-600">
                <h2 className="mb-4 text-3xl font-bold text-slate-800">{course.title}</h2>
              </Link>
              <p className="mb-6 text-slate-600">{course.description}</p>

              <div className="mb-6 flex flex-col gap-3 text-sm font-medium text-slate-500 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" /> {course.duration || 'Flexible duration'}
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-400" /> {(course.subjects || []).length} subjects
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(course.subjects || []).map((subject) => (
                  <span key={subject} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{subject}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
          No course has been assigned to this student account yet.
        </div>
      )}

      <section>
        <h3 className="mb-6 text-xl font-bold text-slate-800">Recent Study Materials</h3>
        {materials.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {materials.slice(0, 8).map((material) => (
              <a href={material.fileUrl} target="_blank" rel="noreferrer" key={material._id} className="flex items-center gap-4 rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="truncate text-sm font-semibold text-slate-800 transition hover:text-blue-600">{material.title}</h4>
                  <span className="text-xs text-slate-400">{material.type} • {material.moduleName || 'General'}</span>
                </div>
                <span className="rounded-full p-2 transition hover:bg-slate-50">
                  <ExternalLink className="h-4 w-4 text-slate-300 transition hover:text-blue-500" />
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
            No materials have been published for this course yet.
          </div>
        )}
      </section>
    </div>
  );
};

export default MyCourses;
