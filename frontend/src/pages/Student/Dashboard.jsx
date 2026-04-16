import React, { useContext, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, IndianRupee, CheckCircle, FileText, PlayCircle, DownloadCloud, TrendingUp, Clock3, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Navbar from '../../components/Dashboard/Navbar';
import CategoryTabs from '../../components/Dashboard/CategoryTabs';
import CourseCard from '../../components/Dashboard/CourseCard';
import SkeletonCard from '../../components/Dashboard/SkeletonCard';
import BottomNav from '../../components/Dashboard/BottomNav';
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus';

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

  // Courses list for the card grid
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    let mounted = true;
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        if (!mounted) return;
        setCourses(res.data || []);
      } catch (err) {
        // fallback mock data
        if (!mounted) return;
        setCourses([
          { id: 1, title: 'NEET Crash Course', faculty: 'Sharma Sir', thumbnail: '/public/sample1.jpg', progress: 48, enrolled: true, category: 'Recorded' },
          { id: 2, title: 'Organic Chemistry Live', faculty: 'Khan Madam', thumbnail: '/public/sample2.jpg', progress: 0, enrolled: false, category: 'Live' },
          { id: 3, title: 'Maths Problem Series', faculty: 'Verma Sir', thumbnail: '/public/sample3.jpg', progress: 12, enrolled: true, category: 'Notes' },
          { id: 4, title: 'Physics Tests Pack', faculty: 'Agarwal Sir', thumbnail: '/public/sample4.jpg', progress: 0, enrolled: false, category: 'Tests' },
          { id: 5, title: 'Viva Preparation', faculty: 'Rao Maam', thumbnail: '/public/sample5.jpg', progress: 76, enrolled: true, category: 'Recorded' },
        ]);
      } finally {
        if (mounted) setLoadingCourses(false);
      }
    };

    fetchCourses();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-32 pt-8 sm:px-8">
      <Navbar onSearch={(q) => console.log('search', q)} />

      <div className="mt-4">
        <CategoryTabs
          categories={[ 'All', 'Live', 'Recorded', 'Notes', 'Tests' ]}
          active={activeCategory}
          onChange={(c) => setActiveCategory(c)}
        />
      </div>
      <section className="overflow-hidden rounded-4xl border border-white/60 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_52%,#38bdf8_100%)] p-8 text-white shadow-[0_30px_80px_-40px_rgba(37,99,235,0.9)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-50">
              <Sparkles className="h-4 w-4" /> Pharmacy Dashboard
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Good morning, {firstName}</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-50/85 sm:text-base">
              Your student portal now shows the pharmacy course, study materials, fees, attendance, and results available for your account.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-blue-100/75">Enrolled Course</p>
              <p className="mt-2 text-lg font-semibold">{course?.title || 'No course assigned'}</p>
              <p className="text-sm text-blue-100/80">{course?.duration || 'Ask admin to assign a pharmacy program'}</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-blue-100/75">Pending Items</p>
              <p className="mt-2 text-lg font-semibold">{unpaidFees.length} fee update</p>
              <p className="text-sm text-blue-100/80">{data.materials.length} pharmacy resources available</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div whileHover={{ scale: 1.02, y: -4 }} className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-blue-500/6 transition group-hover:scale-110"></div>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Active Course</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">{course?.title || 'No course assigned'}</h3>
          <p className="mt-3 text-sm text-slate-500">{course?.description || 'Your assigned pharmacy course details will appear here once the admin sets them up.'}</p>
          {course && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(course.subjects || []).map((subject) => (
                <span key={subject} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{subject}</span>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -4 }} className="flex items-center justify-between rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-2xl bg-green-50 p-3 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Attendance</span>
            </div>
            <h3 className="mt-4 text-3xl font-bold text-slate-800">{data.attendancePercentage}<span className="text-lg text-slate-400">%</span></h3>
            <p className="mt-1 text-xs font-medium text-green-600">{data.attendancePercentage ? 'Calculated from recorded attendance' : 'No attendance records yet'}</p>
          </div>
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform">
              <circle cx="48" cy="48" r="40" className="stroke-slate-100" strokeWidth="8" fill="none" />
              <circle cx="48" cy="48" r="40" className="stroke-green-500" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset={251 - (251 * data.attendancePercentage) / 100} strokeLinecap="round" />
            </svg>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -4 }} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-red-50 p-3 text-red-600">
              <IndianRupee className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Dues</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{latestUnpaidFee ? `Rs ${latestUnpaidFee.amount}` : 'Rs 0'}</h3>
          <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium ${latestUnpaidFee ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {latestUnpaidFee ? `${latestUnpaidFee.month} pending` : 'No pending fees'}
          </div>
        </motion.div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800">Quick Actions</h2>
            <p className="text-sm text-slate-500">Jump into the actual data available for your account.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link to="/student/fees" className="group flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition duration-300 group-hover:bg-blue-600 group-hover:text-white">
              <IndianRupee className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Fees</span>
          </Link>
          <Link to="/student/courses" className="group flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 transition duration-300 group-hover:bg-purple-600 group-hover:text-white">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Materials</span>
          </Link>
          <Link to="/student/courses/active" className="group flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 transition duration-300 group-hover:bg-green-600 group-hover:text-white">
              <PlayCircle className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Course View</span>
          </Link>
          <Link to="/student/results" className="group flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600 transition duration-300 group-hover:bg-orange-600 group-hover:text-white">
              <DownloadCloud className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Results</span>
          </Link>
        </div>
      </section>

      {/* Continue Learning Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800">Continue Learning</h2>
            <p className="text-sm text-slate-500">Resume the courses you're enrolled in.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {loadingCourses ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            courses.filter(c => c.enrolled).map((course) => (
              <CourseCard key={course.id} course={course} onContinue={(c) => console.log('continue', c)} />
            ))
          )}
        </div>
      </section>

      {/* Popular Courses Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800">Popular Courses</h2>
            <p className="text-sm text-slate-500">Trending courses among your peers.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {loadingCourses ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            courses.map((course) => (
              <CourseCard key={course.id} course={course} onContinue={(c) => console.log('open', c)} />
            ))
          )}
        </div>
      </section>

      {/* Recommended Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800">Recommended for You</h2>
            <p className="text-sm text-slate-500">Based on your activity and enrolled subjects.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {loadingCourses ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            courses.slice().reverse().map((course) => (
              <CourseCard key={course.id} course={course} onContinue={(c) => console.log('open', c)} />
            ))
          )}
        </div>
      </section>

      <BottomNav />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-800">Performance Overview</h2>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <TrendingUp className="h-4 w-4" /> {data.results.length} recorded results
            </div>
          </div>
          <div className="h-72 w-full">
            {performanceData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="marks" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500">No result data available yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-800">Subject-wise Accuracy</h2>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Clock3 className="h-4 w-4" /> Based on saved results
            </div>
          </div>
          <div className="h-72 w-full">
            {subjectData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500">No subject data available yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
