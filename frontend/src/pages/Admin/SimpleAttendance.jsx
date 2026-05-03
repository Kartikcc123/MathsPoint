import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Calendar, Users, Save, XCircle, LoaderCircle } from 'lucide-react';
import api from '../../services/api';

const getTodayDateInput = () => new Date().toISOString().split('T')[0];

const SimpleAttendance = () => {
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

  const activeCourseStudents = useMemo(
    () => students.filter((student) => student.course?._id === selectedCourse),
    [students, selectedCourse]
  );

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
      const attendanceRes = await api.get(`/admin/attendance/${selectedCourse}`, {
        params: { date: attendanceDate },
      });

      const existingAttendance = attendanceRes.data;

      let statusMap = {};
      if (existingAttendance?.records?.length) {
        statusMap = existingAttendance.records.reduce((map, record) => {
          map[String(record.studentId)] = record.status;
          return map;
        }, {});
      }

      const mergedRoster = activeCourseStudents.map((student) => ({
        ...student,
        attendanceStatus: statusMap[String(student._id)] || 'Present',
      }));

      setRoster(mergedRoster);

      if (existingAttendance?.records?.length) {
        setInfo(`Loaded existing attendance for ${attendanceDate}.`);
      } else {
        setInfo(`New attendance for ${attendanceDate}. All students set to Present by default.`);
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

      setInfo(`Attendance saved successfully for ${attendanceDate}.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <CheckCircle className="h-6 w-6 text-green-600" /> Fast Attendance
          </h2>
          <p className="mt-1 tracking-wide text-slate-500">Quickly mark absent students with one click.</p>
        </div>
      </header>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
      {info && <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">{info}</div>}

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 gap-4 flex-col md:flex-row">
            <label className="space-y-2 flex-1">
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
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-50"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 flex-1">
              <span className="text-sm font-semibold text-slate-600">Date</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(event) => {
                  setAttendanceDate(event.target.value);
                  setRoster([]);
                  setInfo('');
                  setError('');
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleLoadRoster}
            disabled={loadingPage || loadingRoster || !selectedCourse}
            className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 font-bold text-white shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loadingRoster ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Users className="h-5 w-5" />}
            Load List
          </button>
        </div>
      </section>

      {roster.length > 0 && (
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">Student List</h3>
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-bold text-white shadow-md transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>

          <div className="space-y-3">
            {roster.map((student) => (
              <div key={student._id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100/50">
                <div className="mb-3 sm:mb-0">
                  <p className="font-bold text-slate-800">{student.name}</p>
                  <p className="text-xs text-slate-500">{student.studentId || 'No ID'} • {student.email}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(student._id, 'Present')}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                      student.attendanceStatus === 'Present'
                        ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500 ring-offset-1'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" /> Present
                  </button>
                  <button
                    onClick={() => handleStatusChange(student._id, 'Absent')}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                      student.attendanceStatus === 'Absent'
                        ? 'bg-rose-100 text-rose-800 ring-2 ring-rose-500 ring-offset-1'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <XCircle className="h-4 w-4" /> Absent
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-3 font-bold text-white shadow-md transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleAttendance;
