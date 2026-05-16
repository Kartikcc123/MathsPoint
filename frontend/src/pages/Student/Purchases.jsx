import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus';

const Purchases = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useRefreshOnFocus(async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/dashboard');
      // The dashboard API returns the primary course and enrolledCourses array.
      // We will combine them into a single unique list of purchased courses.
      const primaryCourse = res.data.course;
      const enrolled = res.data.enrolledCourses || [];
      
      const allCoursesMap = new Map();
      if (primaryCourse) allCoursesMap.set(primaryCourse._id, primaryCourse);
      enrolled.forEach(c => allCoursesMap.set(c._id, c));
      
      setCourses(Array.from(allCoursesMap.values()));
    } catch (error) {
      console.error('Failed to load purchases', error);
    } finally {
      setLoading(false);
    }
  });

  const checkExpiration = (enrolledDate, durationStr) => {
    if (!enrolledDate || !durationStr) return { expired: false, expiryDate: null };
    const start = new Date(enrolledDate);
    const parts = durationStr.split(' ');
    if (parts.length !== 2) return { expired: false, expiryDate: null };
    
    const num = parseInt(parts[0]);
    if (isNaN(num)) return { expired: false, expiryDate: null };

    const unit = parts[1].toLowerCase();
    
    let expiryDate = new Date(start);
    if (unit.includes('year')) {
      expiryDate.setFullYear(expiryDate.getFullYear() + num);
    } else if (unit.includes('month')) {
      expiryDate.setMonth(expiryDate.getMonth() + num);
    } else if (unit.includes('day')) {
      expiryDate.setDate(expiryDate.getDate() + num);
    } else {
      return { expired: false, expiryDate: null };
    }
    
    return { 
      expired: new Date() > expiryDate, 
      expiryDate 
    };
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    }).format(new Date(date)).replace(/ /g, " '");
  };

  const getGradientForString = (str) => {
    const gradients = [
      'from-indigo-100 to-purple-100',
      'from-blue-100 to-cyan-100',
      'from-emerald-100 to-teal-100',
      'from-orange-100 to-amber-100',
      'from-rose-100 to-pink-100'
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">My Purchases</h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5a4bda] mb-4"></div>
          <p>Loading your purchases...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
          <h2 className="text-lg font-bold text-slate-700">No purchases found</h2>
          <p className="text-slate-500 mt-2">You haven't enrolled in any batches yet.</p>
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="mt-6 px-6 py-2.5 bg-[#5a4bda] text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            Explore Batches
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => {
            const { expired, expiryDate } = checkExpiration(user?.enrolledDate, course.duration);
            const priceDisplay = course.feeAmount === 0 ? 'Free' : `₹${course.feeAmount}`;
            const purchaseDateDisplay = formatDate(user?.enrolledDate || course.createdAt);
            const gradient = getGradientForString(course.title);
            
            return (
              <div 
                key={course._id} 
                onClick={() => navigate('/student/courses/active')}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:border-[#5a4bda] hover:shadow-md transition-all"
              >
                <div className="flex items-center p-5 gap-6">
                  {/* Thumbnail */}
                  {course.thumbnail ? (
                    <div className="w-40 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-100 shadow-sm relative">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      {course.feeAmount === 0 && (
                        <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                          Free Batch
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`w-40 h-24 shrink-0 rounded-xl bg-gradient-to-br ${gradient} p-4 flex flex-col justify-center border border-slate-100 shadow-sm`}>
                       <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight leading-snug line-clamp-3">
                         {course.title}
                       </h3>
                       {course.feeAmount === 0 && (
                         <span className="mt-auto w-fit bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                           Free Batch
                         </span>
                       )}
                    </div>
                  )}
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <span className="inline-block bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2">
                      Success
                    </span>
                    <h2 className="text-lg font-bold text-slate-800 mb-1 truncate group-hover:text-[#5a4bda] transition-colors">
                      {course.title}
                    </h2>
                    <p className="text-[13px] font-semibold text-slate-500">
                      {purchaseDateDisplay} <span className="mx-1">•</span> <span className={course.feeAmount === 0 ? "text-emerald-600" : ""}>{priceDisplay}</span>
                    </p>
                  </div>
                  
                  {/* Arrow */}
                  <div className="shrink-0 pl-4">
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#5a4bda] transition-colors" />
                  </div>
                </div>

                {/* Expiration Banner */}
                {expired && expiryDate && (
                  <div className="bg-rose-50 px-5 py-3 border-t border-rose-100 text-rose-700 text-[13px] font-semibold">
                    This batch got expired on {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric'}).format(expiryDate)}! Renew to access this batch again
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Purchases;
