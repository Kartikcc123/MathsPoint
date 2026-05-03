import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, Users, CheckCircle, Sparkles, GraduationCap } from 'lucide-react';
import api from '../../services/api';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const [coursesRes, studentsRes] = await Promise.all([
          api.get('/admin/courses'),
          api.get('/admin/students'),
        ]);
        setCourses(coursesRes.data || []);
        setStudents(studentsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load teacher dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const studentCountByCourse = useMemo(() => {
    return students.reduce((map, student) => {
      const courseId = student.course?._id;
      if (!courseId) return map;
      map[courseId] = (map[courseId] || 0) + 1;
      return map;
    }, {});
  }, [students]);

  if (!user || user.actualRole !== 'teacher') return null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <section className="overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,#020617_0%,#1e3a8a_46%,#3b82f6_100%)] p-8 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.95)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-50">
              <Sparkles className="h-4 w-4" /> Teacher Overview
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Teaching Dashboard</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-sky-50/85 sm:text-base">
              Review assigned courses, class sizes, and attendance workflow readiness from one dedicated teacher workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-white/12 bg-white/10 px-5 py-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-sky-100/75">Access Scope</p>
            <p className="mt-2 text-lg font-semibold">{courses.length} assigned course{courses.length === 1 ? '' : 's'}</p>
            <p className="text-sm text-sky-100/80">{students.length} visible students across your sections</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Assigned Courses</p>
          </div>
          <p className="text-4xl font-bold text-slate-800">{loading ? '...' : courses.length}</p>
          <p className="mt-2 text-sm font-medium text-slate-400">Only courses mapped to your teacher profile appear here.</p>
        </div>

        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-600">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Course Students</p>
          </div>
          <p className="text-4xl font-bold text-slate-800">{loading ? '...' : students.length}</p>
          <p className="mt-2 text-sm font-medium text-slate-400">Scoped to the same course access rules used by attendance.</p>
        </div>

        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Attendance Ready</p>
          </div>
          <p className="text-4xl font-bold text-slate-800">{loading ? '...' : courses.filter((course) => (studentCountByCourse[course._id] || 0) > 0).length}</p>
          <p className="mt-2 text-sm font-medium text-slate-400">Courses with active roster data available for attendance marking.</p>
        </div>
      </div>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-800">Assigned Course List</h2>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            <GraduationCap className="h-3.5 w-3.5" /> Teacher scoped view
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {!loading && courses.length ? courses.map((course) => (
            <div key={course._id} className="rounded-[24px] border border-slate-200/80 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Course</p>
              <p className="mt-3 text-lg font-bold text-slate-800">{course.title}</p>
              <p className="mt-2 text-sm text-slate-500">{course.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm font-medium text-slate-600">
                <span>{course.duration || 'No duration set'}</span>
                <span>{studentCountByCourse[course._id] || 0} students</span>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 md:col-span-2 xl:col-span-3">
              {loading ? 'Loading assigned courses...' : 'No courses are assigned to this teacher yet.'}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TeacherDashboard;
