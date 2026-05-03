import React, { useEffect, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import api from '../../services/api';

const TeacherStudents = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/admin/courses');
        const nextCourses = res.data || [];
        setCourses(nextCourses);
        setSelectedCourse((current) => current || nextCourses[0]?._id || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load teacher courses.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setError('');
        const res = await api.get('/admin/students', {
          params: selectedCourse ? { courseId: selectedCourse } : {},
        });
        setStudents(res.data || []);
      } catch (err) {
        setStudents([]);
        setError(err.response?.data?.message || 'Failed to load students.');
      }
    };

    if (selectedCourse) {
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [selectedCourse]);

  const selectedCourseDetails = useMemo(
    () => courses.find((course) => course._id === selectedCourse) || null,
    [courses, selectedCourse]
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <Users className="h-6 w-6 text-sky-500" /> Course Students
        </h1>
        <p className="mt-1 text-slate-500">Review only the students that belong to your assigned course roster.</p>
      </header>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-600">Course</span>
          <select
            value={selectedCourse}
            onChange={(event) => setSelectedCourse(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {courses.length ? courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            )) : (
              <option value="">No assigned courses</option>
            )}
          </select>
        </label>
      </section>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800">{selectedCourseDetails?.title || 'Students'}</h2>
            <p className="mt-1 text-sm text-slate-500">{students.length} visible student{students.length === 1 ? '' : 's'} in this teacher-scoped roster</p>
          </div>
        </div>

        {students.length ? (
          <div className="overflow-x-auto rounded-[24px] border border-slate-200/80">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Student ID</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{student.studentId || 'Not assigned'}</td>
                    <td className="px-6 py-4 text-slate-600">{student.phone || student.parentPhone || 'No contact saved'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
            {loading ? 'Loading roster...' : 'No students are visible for the selected course.'}
          </div>
        )}
      </section>
    </div>
  );
};

export default TeacherStudents;
