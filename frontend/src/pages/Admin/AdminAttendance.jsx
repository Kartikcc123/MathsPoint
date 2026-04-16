import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Calendar, Clock3, Filter, LoaderCircle, Users, Save } from 'lucide-react';
import api from '../../services/api';

const STATUS_OPTIONS = ['Present', 'Absent', 'Late'];

const getTodayDateInput = () => new Date().toISOString().split('T')[0];

const AdminAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(getTodayDateInput());
  const [roster, setRoster] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingPage(true);
        setError('');
        const [coursesRes, studentsRes] = await Promise.all([
          api.get('/admin/courses'),
          api.get('/admin/students'),
        ]);

        setCourses(coursesRes.data || []);
        setStudents(studentsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance setup data.');
      } finally {
        setLoadingPage(false);
      }
    };

    loadData();
  }, []);

  const selectedCourseDetails = useMemo(
    () => courses.find((course) => course._id === selectedCourse) || null,
    [courses, selectedCourse]
  );

  const activeCourseStudents = useMemo(
    () => students.filter((student) => student.course?._id === selectedCourse),
    [students, selectedCourse]
  );

  const buildDefaultRoster = () =>
    activeCourseStudents.map((student) => ({
      ...student,
      attendanceStatus: 'Present',
    }));

  const handleLoadRoster = async () => {
    if (!selectedCourse) {
      setError('Please select a course before loading the roster.');
      setInfo('');
      setRoster([]);
      return;
    }

    setLoadingRoster(true);
    setError('');
    setInfo('');

    try {
      const defaultRoster = buildDefaultRoster();
      const attendanceRes = await api.get(`/admin/attendance/${selectedCourse}`, {
        params: { date: attendanceDate },
      });

      const existingAttendance = attendanceRes.data;

      if (existingAttendance?.records?.length) {
        const statusMap = existingAttendance.records.reduce((map, record) => {
          map[String(record.studentId)] = record.status;
          return map;
        }, {});

        const mergedRoster = defaultRoster.map((student) => ({
          ...student,
          attendanceStatus: statusMap[String(student._id)] || 'Present',
        }));

        setRoster(mergedRoster);
        setInfo(`Loaded saved attendance for ${attendanceDate}.`);
      } else {
        setRoster(defaultRoster);
        setInfo(
          defaultRoster.length === 0
            ? 'No students are assigned to this course yet.'
            : `Loaded ${defaultRoster.length} student${defaultRoster.length === 1 ? '' : 's'} for fresh attendance marking.`
        );
      }
    } catch (err) {
      setRoster([]);
      setError(err.response?.data?.message || 'Failed to load the class roster.');
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleStatusChange = (studentId, attendanceStatus) => {
    setRoster((current) =>
      current.map((student) =>
        student._id === studentId ? { ...student, attendanceStatus } : student
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse || roster.length === 0) {
      setError('Load a roster before saving attendance.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setInfo('');

      await api.post(`/admin/attendance/${selectedCourse}`, {
        date: attendanceDate,
        records: roster.map((student) => ({
          studentId: student._id,
          status: student.attendanceStatus,
        })),
      });

      setInfo(`Attendance saved successfully for ${attendanceDate}. Student panel will now use this record.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    return roster.reduce(
      (counts, student) => {
        counts[student.attendanceStatus] += 1;
        return counts;
      },
      { Present: 0, Absent: 0, Late: 0 }
    );
  }, [roster]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <CheckCircle className="h-6 w-6 text-green-600" /> Master Attendance
          </h2>
          <p className="mt-1 tracking-wide text-slate-500">Save attendance in admin and show the same records in the student panel.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
          <Clock3 className="h-4 w-4" /> Best updated before first lecture
        </div>
      </header>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
      {info && <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{info}</div>}

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-600">Course</span>
              <select
                value={selectedCourse}
                onChange={(event) => {
                  setSelectedCourse(event.target.value);
                  setRoster([]);
                  setInfo('');
                  setError('');
                }}
                disabled={loadingPage}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-600">Attendance Date</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(event) => {
                  setAttendanceDate(event.target.value);
                  setRoster([]);
                  setInfo('');
                  setError('');
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-600">Batch</span>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600">
                <Filter className="h-4 w-4" />
                <span>{selectedCourseDetails?.duration || 'Auto from selected course'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleLoadRoster}
              disabled={loadingPage || loadingRoster}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-3 font-bold text-white shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingRoster ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Users className="h-5 w-5" />}
              {loadingRoster ? 'Loading...' : 'Load Roster'}
            </button>

            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={saving || roster.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-8 py-3 font-bold text-white shadow-md transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      </section>

      <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-sm">
        {loadingPage ? (
          <div className="flex min-h-[320px] items-center justify-center gap-3 text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading attendance workspace...
          </div>
        ) : roster.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500">
              <Calendar className="h-10 w-10" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">Class Roster Empty</h3>
            <p className="mx-auto mb-8 max-w-md text-slate-500">
              Select a course and date, then click Load Roster to view or edit saved attendance.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Course</p>
                <p className="mt-3 text-lg font-bold text-slate-800">{selectedCourseDetails?.title || 'Unknown course'}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-emerald-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Present</p>
                <p className="mt-3 text-3xl font-bold text-emerald-800">{summary.Present}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-red-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-700">Absent</p>
                <p className="mt-3 text-3xl font-bold text-red-800">{summary.Absent}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-amber-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Late</p>
                <p className="mt-3 text-3xl font-bold text-amber-800">{summary.Late}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-[24px] border border-slate-200/80">
              <table className="w-full whitespace-nowrap text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Student</th>
                    <th className="px-6 py-4 font-semibold">Student ID</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((student) => (
                    <tr key={student._id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{student.studentId || 'Not assigned'}</td>
                      <td className="px-6 py-4 text-slate-600">{student.phone || student.parentPhone || 'No phone saved'}</td>
                      <td className="px-6 py-4">
                        <select
                          value={student.attendanceStatus}
                          onChange={(event) => handleStatusChange(student._id, event.target.value)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;
