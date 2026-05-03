import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Users, CheckCircle, Sparkles, ArrowRight, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const childrenRes = await api.get('/parent/children');
        const nextChildren = childrenRes.data?.children || [];
        setChildren(nextChildren);

        const attendanceEntries = await Promise.all(
          nextChildren.map(async (child) => {
            const attendanceRes = await api.get(`/parent/children/${child._id}/attendance`);
            return [child._id, attendanceRes.data];
          })
        );

        setAttendanceStats(Object.fromEntries(attendanceEntries));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load parent dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const overallAttendance = useMemo(() => {
    if (!children.length) return 0;
    const total = children.reduce((sum, child) => sum + Number(attendanceStats[child._id]?.attendancePercentage || 0), 0);
    return Math.round(total / children.length);
  }, [children, attendanceStats]);

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariant} 
      className="mx-auto w-full max-w-7xl space-y-10 px-4 pb-32 pt-8 sm:px-8"
    >
      {/* Hero Section */}
      <motion.section 
        variants={itemVariant}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 p-8 text-white shadow-2xl xl:p-12"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        {/* Animated Background Orbs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500 blur-3xl opacity-30 mix-blend-screen animate-pulse"></div>
        <div className="absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-purple-500 blur-3xl opacity-20 mix-blend-screen animate-[pulse_4s_ease-in-out_infinite]"></div>

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-indigo-100 shadow-inner backdrop-blur-md"
            >
              <Sparkles className="h-4 w-4 text-indigo-200" /> Parent Portal
            </motion.div>
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 drop-shadow-sm">
              Welcome to the Parent Panel
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-indigo-100/90 sm:text-lg">
              Follow each linked child&apos;s progress, track their attendance, and stay updated with their ongoing courses directly from here.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[400px]">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-5 shadow-inner backdrop-blur-xl transition hover:bg-white/10">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl transition group-hover:bg-white/10"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-200/80">Linked Children</p>
                <p className="mt-2 text-3xl font-bold text-white">{loading ? '...' : children.length}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-5 shadow-inner backdrop-blur-xl transition hover:bg-white/10">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl transition group-hover:bg-purple-500/20"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-200/80">Overall Attendance</p>
                <p className="mt-2 text-3xl font-bold text-white">{loading ? '...' : `${overallAttendance}%`}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {error && (
        <motion.div variants={itemVariant} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </motion.div>
      )}

      {/* Metrics Row */}
      <motion.div variants={containerVariant} className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Linked Children Card */}
        <motion.div variants={itemVariant} whileHover={{ y: -5 }} className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-7 shadow-sm transition-shadow hover:shadow-xl hover:shadow-indigo-500/5">
          <div className="absolute right-0 top-0 h-40 w-40 -translate-y-16 translate-x-16 rounded-full bg-indigo-50 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 shadow-inner group-hover:text-indigo-700 transition-colors">
                <Users className="h-7 w-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Total Children</span>
            </div>
            <h3 className="text-4xl font-extrabold text-slate-800">{loading ? '...' : children.length}</h3>
            <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">Children available through the secure parent-child backend mapping.</p>
          </div>
        </motion.div>

        {/* Overall Attendance Card */}
        <motion.div variants={itemVariant} whileHover={{ y: -5 }} className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-7 shadow-sm transition-shadow hover:shadow-xl hover:shadow-emerald-500/5">
           <div className="absolute right-0 top-0 h-40 w-40 -translate-y-16 translate-x-16 rounded-full bg-emerald-50 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10 flex h-full items-center justify-between">
            <div>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 shadow-inner">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Avg. Attendance</span>
              </div>
              <div className="flex items-baseline gap-1">
                <h3 className="mt-2 text-4xl font-extrabold text-slate-800">{loading ? '...' : overallAttendance}</h3>
                <span className="text-xl font-bold text-slate-400">%</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-emerald-600">Across all linked students</p>
            </div>
            <div className="relative flex h-[110px] w-[110px] items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform drop-shadow-sm">
                <circle cx="55" cy="55" r="46" className="stroke-slate-100" strokeWidth="10" fill="none" />
                <motion.circle 
                  cx="55" 
                  cy="55" 
                  r="46" 
                  className="stroke-emerald-500" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray="289" 
                  strokeDashoffset="289"
                  strokeLinecap="round" 
                  animate={{ strokeDashoffset: loading ? 289 : 289 - (289 * overallAttendance) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Security Card */}
        <motion.div variants={itemVariant} whileHover={{ y: -5 }} className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-7 shadow-sm transition-shadow hover:shadow-xl hover:shadow-cyan-500/5">
          <div className="absolute right-0 top-0 h-40 w-40 -translate-y-16 translate-x-16 rounded-full bg-cyan-50 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 text-cyan-600 shadow-inner group-hover:text-cyan-700 transition-colors">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Access Integrity</span>
            </div>
            <h3 className="text-4xl font-extrabold text-slate-800">Secure</h3>
            <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">You only see children explicitly linked to your parent account.</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Children Overview Section */}
      <motion.section variants={itemVariant}>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Your Children Overview</h2>
          <Link to="/parent/children" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">View All <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {!loading && children.length ? children.map((child) => {
            const childAttendance = attendanceStats[child._id]?.attendancePercentage ?? 0;
            return (
              <motion.div key={child._id} whileHover={{ y: -5 }} className="group relative overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      <UserCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{child.name}</h3>
                      <p className="text-xs font-medium text-slate-500">{child.studentId || 'ID: Pending'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Enrolled Course</p>
                  <p className="text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{child.course?.title || 'No course linked'}</p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance</p>
                    <p className="text-lg font-bold text-emerald-600">{childAttendance}%</p>
                  </div>
                  <Link to="/parent/attendance" className="rounded-full bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-100">
                    Details
                  </Link>
                </div>
              </motion.div>
            );
          }) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500 md:col-span-2 lg:col-span-3">
              {loading ? 'Loading linked children...' : 'No children are linked to this parent account yet.'}
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
};

export default ParentDashboard;

