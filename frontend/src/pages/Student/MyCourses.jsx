import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, ExternalLink, FileText, IndianRupee, Search, ChevronRight, Calendar } from 'lucide-react';
import api from '../../services/api';
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus';

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
        materials: res.data.materials || [] 
      });
    } catch (error) {
      console.error('Failed to load student courses', error);
    } finally {
      setLoading(false);
    }
  });

  // Fetch public courses for the "empty" state
  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const res = await api.get('/public/courses');
        setPublicCourses(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch public courses', err);
      }
    };
    fetchPublic();
  }, []);

  const { course, enrolledCourses, materials } = data;
  
  // Combine legacy single course and new array of courses, remove duplicates
  const allCourses = [];
  if (course) allCourses.push(course);
  enrolledCourses.forEach(c => {
    if (!allCourses.find(ext => ext._id === c._id)) {
      allCourses.push(c);
    }
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 pt-8 sm:px-8">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5a4bda] mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      ) : allCourses.length > 0 ? (
        <>
          <header className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800">My Enrolled Courses</h1>
            <p className="mt-1 text-slate-500">Access the courses you've purchased or been assigned to.</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allCourses.map((c, idx) => (
              <div key={c._id || idx} className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="p-5 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h2 className="text-[17px] font-bold text-slate-800 leading-tight line-clamp-2">
                      {c.title}
                    </h2>
                    <button className="text-slate-600 hover:text-green-600 transition-colors shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                    </button>
                  </div>
                  
                  {/* Thumbnail Banner */}
                  <div className="w-full h-36 bg-[#efeef9] rounded-xl mb-5 relative overflow-hidden flex flex-col justify-center p-4">
                     <h3 className="text-[15px] font-black text-[#4b3088] uppercase leading-tight w-3/4 line-clamp-2">{c.title}</h3>
                     <div className="mt-2 inline-block bg-[#8b6b9e] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase max-w-fit shadow-sm">
                       ACTIVE BATCH
                     </div>
                     <div className="mt-auto pt-2 z-10">
                       <span className="bg-white text-slate-800 px-2.5 py-1 rounded-md text-[11px] font-medium shadow-sm border border-slate-100">Hinglish</span>
                     </div>
                     {/* Decorative element representing image area */}
                     <div className="absolute right-0 bottom-0 w-[45%] h-full bg-gradient-to-l from-[#dcd9f4] to-transparent"></div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-start gap-2 text-[13px] text-slate-700 mb-6 font-medium">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">Starts on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})} | Ends on 30 Jul 2026</span>
                  </div>

                  {/* Footer Button */}
                  <div className="mt-auto pt-5 border-t border-slate-100">
                    <Link to="/student/courses/active" className="block w-full text-center bg-[#5a4bda] text-white font-semibold py-2.5 rounded-lg hover:bg-[#4b3ec2] transition-colors">
                      Let's Study
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>


        </>
      ) : (
        /* Empty State - Popular Batches */
        <div className="space-y-10">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-[22px] font-medium text-slate-800">Batches</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search for batches" 
                className="w-full sm:w-80 rounded-md border border-slate-300 pl-9 pr-4 py-2 text-sm focus:border-slate-400 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Ad Banner */}
          <div className="w-full relative overflow-hidden rounded-md bg-gradient-to-r from-[#fae1e0] via-[#f5dede] to-[#f8ede3] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[200px]">
             <div className="flex-1 flex justify-center items-center">
               <div className="text-center">
                 <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase" style={{fontFamily: 'serif'}}>
                   MATHS<br/>PREPARATION<br/>OFFER
                 </h2>
               </div>
             </div>
             <div className="hidden md:flex gap-4 items-center pr-4">
                {[
                  { title: "Foundation Batch", price: "₹2,249" },
                  { title: "Target Batch 2026", price: "₹1,529" },
                  { title: "Maths Mahapack", price: "₹2,699" }
                ].map((item, i) => (
                  <div key={i} className="bg-pink-900/10 backdrop-blur-sm rounded-lg p-3 w-[120px] flex flex-col items-center text-center">
                    <div className="h-8 w-8 bg-pink-800/20 rounded-full mb-3 flex items-center justify-center">
                      <span className="text-pink-900 text-xs">🎓</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-800 leading-tight mb-3 h-8 flex items-center">{item.title}</p>
                    <div className="w-full bg-black text-white text-[10px] font-bold py-1.5 rounded-full">NOW @ {item.price}</div>
                  </div>
                ))}
             </div>
          </div>

          {/* Popular Batches Section */}
          <div>
            <h2 className="text-[22px] font-medium text-slate-800 mb-6">Popular Batches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicCourses.map((course, idx) => {
                const bgs = ['bg-[#ffe4e1]', 'bg-[#e1f5fe]', 'bg-[#e0f7fa]'];
                const cardBg = bgs[idx % bgs.length];
                const originalPrice = Math.round(course.price * 1.5);
                const discount = Math.round(((originalPrice - course.price) / originalPrice) * 100);

                return (
                <div key={course._id} className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Thumbnail area */}
                  <div className={`h-44 w-full ${cardBg} flex flex-col items-center justify-center p-6 text-center`}>
                    <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{course.title}</h3>
                    <p className="text-[10px] font-bold text-white bg-sky-500 px-2 py-1 rounded shadow-sm">TARGET BATCH</p>
                  </div>
                  
                  {/* Details area */}
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-[#ff6b00]">{course.category || 'MATHS'}</span>
                      <span className="text-[10px] font-medium border border-slate-300 px-2 py-0.5 rounded text-slate-600">HINGLISH</span>
                    </div>
                    
                    <h4 className="font-semibold text-slate-800 text-[17px] mb-3 line-clamp-2 leading-tight">{course.title}</h4>
                    
                    <div className="space-y-2 mb-6">
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
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[22px] font-bold text-slate-900 leading-none">₹{course.price}</span>
                            <span className="text-[13px] text-slate-400 line-through">₹{originalPrice}</span>
                          </div>
                          <span className="text-[13px] font-bold text-green-600">{discount}% OFF</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/checkout/${course._id}`)}
                            className="bg-slate-900 text-white text-[15px] font-medium py-2 px-6 rounded-md hover:bg-slate-800 transition"
                          >
                            Buy Now
                          </button>
                          <button className="border border-slate-300 text-slate-600 px-3 py-2 rounded-md hover:bg-slate-50 transition flex items-center justify-center">
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-[11px] rounded overflow-hidden border border-orange-100 bg-orange-50/50 mt-1">
                        <div className="bg-[#ff6b00] text-white font-medium px-2 py-1.5">MidMonthOffer</div>
                        <div className="text-orange-800 font-medium px-2 py-1.5">Limited time offer valid till 15th May</div>
                      </div>
                    </div>
                  </div>
                </div>
              )})}

              {/* Placeholder cards if no public courses available from API yet */}
              {publicCourses.length === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 p-10 text-center text-slate-500 bg-white border border-dashed border-slate-300 rounded-xl">
                  Loading popular batches...
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
