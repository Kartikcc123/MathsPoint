import React, { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const containerVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const ParentAttendance = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/parent/children');
        const nextChildren = res.data?.children || [];
        setChildren(nextChildren);
        setSelectedChild((current) => current || nextChildren[0]?._id || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load parent attendance.');
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, []);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        if (!selectedChild) {
          setAttendanceData(null);
          return;
        }

        const res = await api.get(`/parent/children/${selectedChild}/attendance`);
        setAttendanceData(res.data);
      } catch (err) {
        setAttendanceData(null);
        setError(err.response?.data?.message || 'Failed to load child attendance.');
      }
    };

    loadAttendance();
  }, [selectedChild]);

  const sortedRecords = useMemo(() => (
    (attendanceData?.attendanceRecords || [])
      .map((record) => ({ ...record, dateObj: new Date(record.date) }))
      .sort((a, b) => b.dateObj - a.dateObj) // sort descending
  ), [attendanceData]);

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariant} 
      className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-32 pt-8 sm:px-8"
    >
      <motion.header 
        variants={itemVariant}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 p-8 text-white shadow-xl"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500 blur-3xl opacity-30 mix-blend-screen animate-pulse"></div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-indigo-100 shadow-inner backdrop-blur-md">
            <CalendarIcon className="h-4 w-4 text-indigo-200" /> Attendance Records
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
            Track Child Attendance
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-indigo-100/90 sm:text-lg">
            Review detailed daily attendance records and overall attendance performance for each linked child.
          </p>
        </div>
      </motion.header>

      {error && (
        <motion.div variants={itemVariant} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </motion.div>
      )}

      <motion.section variants={itemVariant} className="rounded-[2rem] border border-slate-200/60 bg-white p-6 shadow-sm">
        <label className="space-y-3 block">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Select Child to View</span>
          <div className="relative">
            <select
              value={selectedChild}
              onChange={(event) => setSelectedChild(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-lg font-semibold text-slate-700 transition-all hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            >
              {children.length ? children.map((child) => (
                <option key={child._id} value={child._id}>
                  {child.name} {child.studentId ? `(${child.studentId})` : ''}
                </option>
              )) : (
                <option value="">No linked children</option>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </label>
      </motion.section>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <motion.div variants={itemVariant} className="md:col-span-1 flex flex-col">
          <div className="group relative overflow-hidden flex h-full flex-col items-center justify-center rounded-[2rem] border border-slate-200/60 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-xl hover:shadow-emerald-500/5">
            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-emerald-50 transition-transform duration-500 group-hover:scale-150"></div>
            
            <div className="relative z-10 w-full flex flex-col items-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-6">Overall Rate</p>
              
              <div className="relative mb-6 flex h-40 w-40 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform drop-shadow-sm">
                  <circle cx="80" cy="80" r="70" className="stroke-slate-100" strokeWidth="14" fill="none" />
                  <motion.circle 
                    cx="80" 
                    cy="80" 
                    r="70" 
                    className="stroke-emerald-500" 
                    strokeWidth="14" 
                    fill="none" 
                    strokeDasharray="440" 
                    strokeDashoffset="440" 
                    strokeLinecap="round" 
                    animate={{ strokeDashoffset: 440 - (440 * (attendanceData?.attendancePercentage || 0)) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-slate-800">{attendanceData?.attendancePercentage || 0}%</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800">{attendanceData?.student?.name || 'Select a child'}</h3>
              <p className="mt-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {attendanceData?.attendancePercentage >= 75 ? 'Good Standing' : 'Needs Improvement'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariant} className="rounded-[2rem] border border-slate-200/60 bg-white p-8 shadow-sm md:col-span-3">
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">Timeline</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{attendanceData?.student?.course?.title || 'Attendance History'}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200">
              <Clock className="h-4 w-4" /> Recent First
            </div>
          </div>

          {sortedRecords.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedRecords.map((record) => {
                const isPresent = record.status === 'Present';
                const isLate = record.status === 'Late';
                const isAbsent = record.status === 'Absent';
                
                let statusClasses = '';
                let Icon = null;
                
                if (isPresent) {
                  statusClasses = 'border-emerald-200 bg-emerald-50/50';
                  Icon = <CheckCircle className="h-6 w-6 text-emerald-600" />;
                } else if (isAbsent) {
                  statusClasses = 'border-rose-200 bg-rose-50/50';
                  Icon = <XCircle className="h-6 w-6 text-rose-600" />;
                } else if (isLate) {
                  statusClasses = 'border-amber-200 bg-amber-50/50';
                  Icon = <AlertCircle className="h-6 w-6 text-amber-600" />;
                } else {
                  statusClasses = 'border-slate-200 bg-slate-50/50';
                  Icon = <Clock className="h-6 w-6 text-slate-600" />;
                }

                return (
                  <motion.div 
                    whileHover={{ y: -2 }}
                    key={`${record.date}-${record.status}`} 
                    className={`flex items-center justify-between rounded-2xl border p-5 transition-all hover:shadow-md ${statusClasses}`}
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {record.dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className="text-sm font-bold text-slate-800">{record.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className={`mt-1 text-xs font-bold ${isPresent ? 'text-emerald-700' : isAbsent ? 'text-rose-700' : 'text-amber-700'}`}>
                        {record.status}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                      {Icon}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center">
              <CalendarIcon className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-lg font-bold text-slate-700">No Records Found</p>
              <p className="mt-1 text-sm font-medium text-slate-500 max-w-sm">
                {loading ? 'Loading attendance data...' : 'There are no attendance records available for this child yet.'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ParentAttendance;
