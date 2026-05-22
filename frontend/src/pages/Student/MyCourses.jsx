import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, ChevronRight, Clock, Search } from 'lucide-react';
import api from '../../services/api';
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus';

const formatPrice = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const MyCourses = () => {
  const [data, setData] = useState({ course: null, enrolledCourses: [], materials: [] });
  const [publicCourses, setPublicCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useRefreshOnFocus(async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/dashboard');
      setData({
        course: res.data.course,
        enrolledCourses: res.data.enrolledCourses || [],
        materials: res.data.materials || [],
      });
    } catch (error) {
      console.error('Failed to load student courses', error);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const res = await api.get('/public/courses');
        setPublicCourses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch public courses', err);
      }
    };

    fetchPublic();
  }, []);

  const allCourses = useMemo(() => {
    const items = [];
    if (data.course) {
      items.push(data.course);
    }

    (data.enrolledCourses || []).forEach((course) => {
      if (!items.find((existing) => existing._id === course._id)) {
        items.push(course);
      }
    });

    return items;
  }, [data.course, data.enrolledCourses]);

  const hasOngoingCourse = allCourses.length > 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center text-slate-500">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-[#5a4bda]" />
          <p>Loading your dashboard...</p>
        </div>
      ) : hasOngoingCourse ? (
        <>
          <header className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800">My Current Batch</h1>
            <p className="mt-1 text-slate-500">These are your ongoing purchased or assigned batches available for study.</p>
          </header>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allCourses.map((course, idx) => (
              <div
                key={course._id || idx}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                <div className="flex h-full flex-col p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 className="line-clamp-2 text-[17px] font-bold leading-tight text-slate-800">
                      {course.title}
                    </h2>
                  </div>

                  <div className="relative mb-5 flex h-36 w-full flex-col justify-center overflow-hidden rounded-xl bg-[#efeef9] p-4">
                    <h3 className="w-3/4 text-[15px] font-black uppercase leading-tight text-[#4b3088] line-clamp-2">
                      {course.title}
                    </h3>
                    <div className="mt-2 inline-block max-w-fit rounded bg-[#8b6b9e] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      Ongoing Batch
                    </div>
                    <div className="z-10 mt-auto pt-2">
                      <span className="rounded-md border border-slate-100 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-800 shadow-sm">
                        Hinglish
                      </span>
                    </div>
                    <div className="absolute bottom-0 right-0 h-full w-[45%] bg-gradient-to-l from-[#dcd9f4] to-transparent" />
                  </div>

                  <div className="mb-6 flex items-start gap-2 text-[13px] font-medium text-slate-700">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span className="leading-snug">
                      Starts on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} | Ends on 30 Jul 2026
                    </span>
                  </div>

                  <div className="mt-auto border-t border-slate-100 pt-5">
                    <Link
                      to="/student/courses/active"
                      className="block w-full rounded-lg bg-[#5a4bda] py-2.5 text-center font-semibold text-white transition-colors hover:bg-[#4b3ec2]"
                    >
                      Let's Study
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="text-[22px] font-medium text-slate-800">Batches</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search for batches"
                className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none sm:w-80"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
            You do not have any ongoing batch right now. Buy a batch below to unlock the full student study panel.
          </div>

          <div className="relative flex min-h-[200px] w-full flex-col items-center justify-between gap-8 overflow-hidden rounded-md bg-gradient-to-r from-[#fae1e0] via-[#f5dede] to-[#f8ede3] p-6 md:flex-row md:p-8">
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 md:text-5xl" style={{ fontFamily: 'serif' }}>
                  Maths
                  <br />
                  Preparation
                  <br />
                  Offer
                </h2>
              </div>
            </div>
            <div className="hidden items-center gap-4 pr-4 md:flex">
              {[
                { title: 'Foundation Batch', price: 'Rs 2,249' },
                { title: 'Target Batch 2026', price: 'Rs 1,529' },
                { title: 'Maths Mahapack', price: 'Rs 2,699' },
              ].map((item) => (
                <div key={item.title} className="flex w-[120px] flex-col items-center rounded-lg bg-pink-900/10 p-3 text-center backdrop-blur-sm">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-pink-800/20">
                    <span className="text-xs text-pink-900">B</span>
                  </div>
                  <p className="mb-3 flex h-8 items-center text-[10px] font-bold leading-tight text-slate-800">{item.title}</p>
                  <div className="w-full rounded-full bg-black py-1.5 text-[10px] font-bold text-white">NOW @ {item.price}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-[22px] font-medium text-slate-800">Popular Batches</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publicCourses.map((course, idx) => {
                const bgs = ['bg-[#ffe4e1]', 'bg-[#e1f5fe]', 'bg-[#e0f7fa]'];
                const cardBg = bgs[idx % bgs.length];
                const fee = Number(course.feeAmount ?? course.price ?? 0);
                const originalPrice = Number(course.mrp ?? Math.round(fee * 1.5));
                const discount = originalPrice > fee && originalPrice > 0
                  ? Math.round(((originalPrice - fee) / originalPrice) * 100)
                  : 0;

                return (
                  <div
                    key={course._id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow duration-300 hover:shadow-lg"
                  >
                    <div className={`flex h-44 w-full flex-col items-center justify-center p-6 text-center ${cardBg}`}>
                      <h3 className="mb-2 text-xl font-black uppercase tracking-tight text-slate-800">{course.title}</h3>
                      <p className="rounded bg-sky-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">TARGET BATCH</p>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#ff6b00]">{course.category || 'MATHS'}</span>
                        <span className="rounded border border-slate-300 px-2 py-0.5 text-[10px] font-medium text-slate-600">HINGLISH</span>
                      </div>

                      <h4 className="mb-3 line-clamp-2 text-[17px] font-semibold leading-tight text-slate-800">{course.title}</h4>

                      <div className="mb-6 space-y-2">
                        <div className="flex items-center gap-2 text-[13px] text-slate-600">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                          <span>{course.category || 'General Exams'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-slate-600">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>Starts on 25th May'26</span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="mb-4 flex items-end justify-between">
                          <div>
                            <div className="mb-0.5 flex items-center gap-2">
                              <span className="text-[22px] font-bold leading-none text-slate-900">{formatPrice(fee)}</span>
                              {originalPrice > fee && (
                                <span className="text-[13px] text-slate-400 line-through">{formatPrice(originalPrice)}</span>
                              )}
                            </div>
                            {discount > 0 && <span className="text-[13px] font-bold text-green-600">{discount}% OFF</span>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/checkout/${course._id}`)}
                              className="rounded-md bg-slate-900 px-6 py-2 text-[15px] font-medium text-white transition hover:bg-slate-800"
                            >
                              Buy Now
                            </button>
                            <button className="flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-slate-600 transition hover:bg-slate-50">
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-1 flex items-center overflow-hidden rounded border border-orange-100 bg-orange-50/50 text-[11px]">
                          <div className="bg-[#ff6b00] px-2 py-1.5 font-medium text-white">MidMonthOffer</div>
                          <div className="px-2 py-1.5 font-medium text-orange-800">Limited time offer valid till 15th May</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {publicCourses.length === 0 && (
                <div className="col-span-1 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 md:col-span-2 lg:col-span-3">
                  No popular batches available right now.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
