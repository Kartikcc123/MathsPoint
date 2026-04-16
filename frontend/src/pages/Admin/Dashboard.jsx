import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, BookOpen, Clock, TrendingUp, IndianRupee, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/admin/dashboard-summary');
        setSummary(res.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
        setError(error.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user || user.role !== 'admin') return null;

  const totals = summary?.totals || {};
  const recentStudents = summary?.recentStudents || [];
  const revenueSeries = summary?.revenueSeries || [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      <section className="overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,#020617_0%,#1e3a8a_46%,#0ea5e9_100%)] p-8 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.95)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-50">
              <Sparkles className="h-4 w-4" /> Admin Overview
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Overview Dashboard</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-50/85 sm:text-base">
              Keep pharmacy admissions, academic delivery, attendance, and reporting in sync with one clear operations view.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-blue-100/75">Student Access</p>
              <p className="mt-2 text-lg font-semibold">{totals.studentsWithAccess || 0} students can open the panel</p>
              <p className="text-sm text-blue-100/80">{totals.students || 0} total student records on the website</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-blue-100/75">Priority Queue</p>
              <p className="mt-2 text-lg font-semibold">{totals.unpublishedResults || 0} results awaiting publish</p>
              <p className="text-sm text-blue-100/80">{totals.pendingPayments || 0} payment records need follow-up</p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div whileHover={{ scale: 1.02, y: -4 }} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Total Students</p>
          </div>
          <p className="text-4xl font-bold text-slate-800">{loading ? '...' : totals.students || 0}</p>
          <p className="mt-2 flex items-center gap-1 text-sm font-medium text-green-500"><TrendingUp className="h-4 w-4" /> {totals.studentsWithAccess || 0} currently have dashboard access</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -4 }} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Active Courses</p>
          </div>
          <p className="text-4xl font-bold text-slate-800">{loading ? '...' : totals.courses || 0}</p>
          <p className="mt-2 text-sm font-medium text-slate-400">{totals.materials || 0} study materials published</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -4 }} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-2xl bg-green-50 p-3 text-green-600">
              <IndianRupee className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Revenue</p>
          </div>
          <p className="text-4xl font-bold text-slate-800">{loading ? '...' : `Rs ${totals.totalRevenue || 0}`}</p>
          <p className="mt-2 flex items-center gap-1 text-sm font-medium text-green-500"><TrendingUp className="h-4 w-4" /> Based on paid fee records</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -4 }} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Avg Attendance</p>
          </div>
          <p className="text-4xl font-bold text-slate-800">{loading ? '...' : `${totals.averageAttendance || 0}%`}</p>
          <p className="mt-2 text-sm font-medium text-slate-400">Calculated from saved attendance records</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-800">Revenue Trajectory</h2>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">2026</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {!loading && revenueSeries.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No paid fee records yet, so there is no live revenue trend to show.</p>
          ) : null}
        </div>

        <div className="flex flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-6">
            <h2 className="text-lg font-bold text-slate-800">Recent Enrollments</h2>
            <span className="text-sm font-semibold text-blue-600">{recentStudents.length} recent records</span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="sticky top-0 border-b border-slate-100 bg-white text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student Name</th>
                  <th className="px-6 py-4 font-semibold">Course Enrolled</th>
                  <th className="px-6 py-4 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {!loading && recentStudents.length > 0 ? recentStudents.map((student, idx) => (
                  <tr key={student._id || idx} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {student.courseTitle || 'No course assigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide ${student.studentPanelAllowed || student.courseTitle ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-700'}`}>
                        {student.studentPanelAllowed || student.courseTitle ? 'Active' : 'Pending Access'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-14 text-center text-slate-500">
                      {loading ? 'Loading dashboard...' : 'No student records found yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
