import React, { useContext, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  BookOpen, IndianRupee, CheckCircle, FileText, PlayCircle, 
  DownloadCloud, TrendingUp, Clock3, Sparkles, Award, Zap, Book
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Navbar from '../../components/Dashboard/Navbar';
import CategoryTabs from '../../components/Dashboard/CategoryTabs';
import CourseCard from '../../components/Dashboard/CourseCard';
import SkeletonCard from '../../components/Dashboard/SkeletonCard';
import BottomNav from '../../components/Dashboard/BottomNav';
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus';

// Framer Motion Variants
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

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({ fees: [], results: [], materials: [], course: null, attendancePercentage: 0 });

  useRefreshOnFocus(async () => {
    try {
      const res = await api.get('/student/dashboard');
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  });

  const course = data.course;
  const unpaidFees = data.fees.filter((fee) => fee.status !== 'Paid');
  const latestUnpaidFee = unpaidFees[0] || null;

  const performanceData = useMemo(() => (
    data.results.slice().reverse().map((result) => ({
      name: result.examName,
      marks: Math.round((result.marksObtained / result.totalMarks) * 100),
    }))
  ), [data.results]);

  const subjectData = useMemo(() => {
    const grouped = data.results.reduce((acc, result) => {
      const percentage = (result.marksObtained / result.totalMarks) * 100;
      if (!acc[result.subject]) acc[result.subject] = { total: 0, count: 0 };
      acc[result.subject].total += percentage;
      acc[result.subject].count += 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([subject, stats]) => ({
      subject,
      score: Math.round(stats.total / stats.count),
    }));
  }, [data.results]);

  if (!user || user.role !== 'student') return null;

  const firstName = user.name.split(' ')[0];

  const enrolledCourses = data.enrolledCourses || [];

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
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-900 via-sky-800 to-sky-900 p-8 text-white shadow-2xl xl:p-12"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        {/* Animated Background Orbs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl opacity-30 mix-blend-screen mix-blend-screen animate-pulse"></div>
        <div className="absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-cyan-500 blur-3xl opacity-20 mix-blend-screen mix-blend-screen animate-[pulse_4s_ease-in-out_infinite]"></div>

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-sky-100 shadow-inner backdrop-blur-md"
            >
              <Sparkles className="h-4 w-4 text-sky-200" /> Maths Point Portal
            </motion.div>
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-200 drop-shadow-sm">
              Welcome back, {firstName}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-sky-100/90 sm:text-lg">
              Ready to conquer today's goals? Your ongoing courses, performance metrics, and pending actions are all aggregated right here.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[400px]">
             <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-5 shadow-inner backdrop-blur-xl transition hover:bg-white/10">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl transition group-hover:bg-white/10"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-sky-200/80">Active Program</p>
                <p className="mt-2 text-xl font-bold text-white">{course?.title || 'No Base Program'}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-sky-200">
                  <Award className="h-3.5 w-3.5" />
                  {course?.duration || 'Update from Admin'}
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-5 shadow-inner backdrop-blur-xl transition hover:bg-white/10">
               <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl transition group-hover:bg-cyan-500/20"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-sky-200/80">Action Items</p>
                <p className="mt-2 text-xl font-bold text-white">{unpaidFees.length} Pending Dues</p>
                 <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-sky-200">
                  <Book className="h-3.5 w-3.5" />
                  {data.materials.length} New Resources
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Metrics Row */}
      <motion.div variants={containerVariant} className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Active Course Card */}
        <motion.div variants={itemVariant} whileHover={{ y: -5 }} className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-7 shadow-sm transition-shadow hover:shadow-xl hover:shadow-sky-500/5">
          <div className="absolute right-0 top-0 h-40 w-40 -translate-y-16 translate-x-16 rounded-full bg-sky-50 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 text-sky-600 shadow-inner group-hover:text-sky-700 transition-colors">
                <BookOpen className="h-7 w-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Current Focus</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800">{course?.title || 'Explore Courses'}</h3>
            <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">{course?.description || 'Your enrolled program module will be tracked here.'}</p>
            {course && (
              <div className="mt-5 flex flex-wrap gap-2">
                {(course.subjects || []).map((subject) => (
                  <span key={subject} className="rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-1.5 text-xs font-semibold text-sky-700 backdrop-blur-sm transition hover:bg-sky-100">
                    {subject}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Attendance Card */}
        <motion.div variants={itemVariant} whileHover={{ y: -5 }} className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-7 shadow-sm transition-shadow hover:shadow-xl hover:shadow-emerald-500/5">
           <div className="absolute right-0 top-0 h-40 w-40 -translate-y-16 translate-x-16 rounded-full bg-emerald-50 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10 flex h-full items-center justify-between">
            <div>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 shadow-inner">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Attendance</span>
              </div>
              <div className="flex items-baseline gap-1">
                <h3 className="mt-2 text-4xl font-extrabold text-slate-800">{data.attendancePercentage}</h3>
                <span className="text-xl font-bold text-slate-400">%</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-emerald-600">{data.attendancePercentage ? 'Maintained excellent streak' : 'No records yet'}</p>
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
                  animate={{ strokeDashoffset: 289 - (289 * data.attendancePercentage) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Dues Card */}
        <motion.div variants={itemVariant} whileHover={{ y: -5 }} className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-7 shadow-sm transition-shadow hover:shadow-xl hover:shadow-rose-500/5">
           <div className="absolute right-0 top-0 h-40 w-40 -translate-y-16 translate-x-16 rounded-full bg-rose-50 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-pink-50 text-rose-600 shadow-inner">
                  <IndianRupee className="h-7 w-7" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Fee Status</span>
              </div>
              <h3 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-800">
                {latestUnpaidFee ? `₹${latestUnpaidFee.amount}` : '₹0'}
              </h3>
            </div>
            <div className="mt-4">
              <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold ${latestUnpaidFee ? 'bg-rose-50 text-rose-700 border border-rose-100/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'}`}>
                {latestUnpaidFee ? <><Activity className="h-3.5 w-3.5"/> Action Required: {latestUnpaidFee.month}</> : <><CheckCircle className="h-3.5 w-3.5" /> All dues cleared</>}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.section variants={itemVariant}>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Essential Shortcuts</h2>
          <span className="text-sm font-semibold text-slate-500">Quick navigations</span>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <Link to="/student/fees" className="group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-500/10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sky-50/30 opacity-0 transition-opacity group-hover:opacity-100"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-sky-500/30">
              <IndianRupee className="h-7 w-7" />
            </div>
            <div className="text-center">
              <span className="block text-[15px] font-bold text-slate-800">Fee Payment</span>
              <span className="mt-1 block text-xs font-medium text-slate-400">View receipts & pay</span>
            </div>
          </Link>
          <Link to="/student/courses" className="group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-500/10">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-50/30 opacity-0 transition-opacity group-hover:opacity-100"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-cyan-500/30">
              <FileText className="h-7 w-7" />
            </div>
            <div className="text-center">
              <span className="block text-[15px] font-bold text-slate-800">Study Material</span>
              <span className="mt-1 block text-xs font-medium text-slate-400">Notes & resources</span>
            </div>
          </Link>
          <Link to="/student/courses/active" className="group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/10">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-50/30 opacity-0 transition-opacity group-hover:opacity-100"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-teal-500/30">
              <PlayCircle className="h-7 w-7" />
            </div>
           <div className="text-center">
              <span className="block text-[15px] font-bold text-slate-800">Live Classes</span>
              <span className="mt-1 block text-xs font-medium text-slate-400">Join scheduled meets</span>
            </div>
          </Link>
          <Link to="/student/results" className="group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-50/30 opacity-0 transition-opacity group-hover:opacity-100"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/30">
              <DownloadCloud className="h-7 w-7" />
            </div>
            <div className="text-center">
              <span className="block text-[15px] font-bold text-slate-800">Exam Results</span>
              <span className="mt-1 block text-xs font-medium text-slate-400">View performance</span>
            </div>
          </Link>
        </div>
      </motion.section>

      {/* Continue Learning Section */}
      {enrolledCourses.length > 0 && (
        <motion.section variants={itemVariant}>
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">In Progress</h2>
            <span className="text-sm font-semibold text-slate-500">Pick up where you left</span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <CourseCard key={course._id || course.id} course={course} onContinue={(c) => console.log('continue', c)} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Charts Section */}
      <motion.div variants={containerVariant} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <motion.div variants={itemVariant} className="rounded-[2rem] border border-slate-200/60 bg-white p-8 shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/50">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Growth Trajectory</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Your recent exam scores</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50/80 px-4 py-2 text-xs font-bold text-sky-700 backdrop-blur-sm border border-sky-100">
              <TrendingUp className="h-4 w-4" /> {data.results.length} Tests Taken
            </div>
          </div>
          <div className="h-72 w-full">
            {performanceData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px 20px', fontWeight: 'bold', color: '#1e293b' }} 
                    itemStyle={{ color: '#3b82f6', fontWeight: '900' }}
                  />
                  <Line type="monotone" dataKey="marks" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, strokeWidth: 3, fill: '#fff', stroke: '#3b82f6' }} activeDot={{ r: 8, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400">No result data available yet.</div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariant} className="rounded-[2rem] border border-slate-200/60 bg-white p-8 shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/50">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Subject Mastery</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Average efficiency per subject</p>
            </div>
             <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50/80 px-4 py-2 text-xs font-bold text-cyan-700 backdrop-blur-sm border border-cyan-100">
              <Zap className="h-4 w-4" /> Realtime Data
            </div>
          </div>
          <div className="h-72 w-full">
            {subjectData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dx={-10} />
                  <Tooltip 
                     cursor={{ fill: '#f8fafc' }} 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px 20px', fontWeight: 'bold' }} 
                     itemStyle={{ color: '#8b5cf6', fontWeight: '900' }}
                  />
                  <Bar dataKey="score" fill="url(#barGradient)" radius={[8, 8, 8, 8]} barSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400">No subject data available yet.</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StudentDashboard;
