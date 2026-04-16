import React, { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendancePercentage, setAttendancePercentage] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setAttendanceRecords(res.data.attendanceRecords || []);
        setAttendancePercentage(res.data.attendancePercentage || 0);
      } catch (error) {
        console.error('Failed to load attendance', error);
      }
    };

    loadData();
  }, []);

  const sortedRecords = useMemo(() => (
    attendanceRecords.map((record) => ({ ...record, dateObj: new Date(record.date) })).sort((a, b) => a.dateObj - b.dateObj)
  ), [attendanceRecords]);

  const activeMonthLabel = sortedRecords.length
    ? sortedRecords[sortedRecords.length - 1].dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    : 'No attendance month';

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <header className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Attendance Record</h1>
        <p className="mt-1 text-slate-500">Only attendance entries saved in the backend are shown here.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-slate-200/80 bg-white p-6 text-center shadow-sm">
            <div className="relative mb-4 flex h-32 w-32 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform">
                <circle cx="64" cy="64" r="56" className="stroke-slate-100" strokeWidth="12" fill="none" />
                <circle cx="64" cy="64" r="56" className="stroke-green-500" strokeWidth="12" fill="none" strokeDasharray="351" strokeDashoffset={351 - (351 * attendancePercentage) / 100} strokeLinecap="round" />
              </svg>
              <div className="absolute text-3xl font-bold text-slate-800">{attendancePercentage}%</div>
            </div>
            <p className="font-semibold text-slate-600">Overall Attendance</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-sm md:col-span-3">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <CalendarIcon className="h-6 w-6 text-blue-500" /> {activeMonthLabel}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-green-500"></span> Present</div>
              <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-500"></span> Absent</div>
              <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-amber-500"></span> Late</div>
            </div>
          </div>

          {sortedRecords.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sortedRecords.map((record) => {
                const isPresent = record.status === 'Present' || record.status === 'Late';
                return (
                  <div key={`${record.date}-${record.status}`} className={`flex items-center justify-between rounded-2xl border p-4 ${
                    record.status === 'Present' ? 'border-green-200 bg-green-50' : record.status === 'Absent' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
                  }`}>
                    <div>
                      <p className="font-semibold text-slate-800">{record.dateObj.toLocaleDateString()}</p>
                      <p className="text-sm text-slate-500">{record.status}</p>
                    </div>
                    {isPresent ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">No attendance records available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
