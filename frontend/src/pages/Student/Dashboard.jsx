import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, Clock, MessageCircleQuestion, Bookmark } from 'lucide-react';
import api from '../../services/api';
import useRefreshOnFocus from '../../hooks/useRefreshOnFocus';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({ materials: [], course: null });

  useRefreshOnFocus(async () => {
    try {
      const res = await api.get('/student/dashboard');
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  });

  if (!user || user.role !== 'student') return null;

  const hasOngoingCourse = Boolean(user.course || (user.enrolledCourses && user.enrolledCourses.length > 0));

  if (!hasOngoingCourse) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8 pb-20">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800">No Ongoing Batch Yet</h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            Your student account is active, but you do not have any ongoing purchased batch right now. Explore available batches and buy one to unlock the full study panel.
          </p>
          <div className="mt-6">
            <Link
              to="/student/courses"
              className="inline-flex items-center rounded-2xl bg-[#5a4bda] px-5 py-3 font-semibold text-white transition hover:bg-[#4b3ec2]"
            >
              Explore Batches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-20">
      
      {/* My Learning Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <h2 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">My Learning</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* My Batches Card */}
          <Link to="/student/courses" className="group flex flex-col p-5 rounded-xl bg-[#f0f4ff] border border-transparent hover:border-indigo-100 hover:shadow-md transition-all duration-300">
            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center mb-4 shadow-sm border border-slate-100 text-slate-700 group-hover:text-indigo-600 transition-colors">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1 text-[15px]">My Batches</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              View list of the batches in which you are enrolled
            </p>
          </Link>

          {/* Recent Learning Card */}
          <Link to="/student/courses" className="group flex flex-col p-5 rounded-xl bg-[#fff0e5] border border-transparent hover:border-orange-100 hover:shadow-md transition-all duration-300">
            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center mb-4 shadow-sm border border-slate-100 text-slate-700 group-hover:text-orange-500 transition-colors">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1 text-[15px]">Recent Learning</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              View your past learning history
            </p>
          </Link>

          {/* My Doubts Card */}
          <Link to="/contact" className="group flex flex-col p-5 rounded-xl bg-[#e6fcf5] border border-transparent hover:border-emerald-100 hover:shadow-md transition-all duration-300">
            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center mb-4 shadow-sm border border-slate-100 text-slate-700 group-hover:text-emerald-600 transition-colors">
              <MessageCircleQuestion className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1 text-[15px]">My Doubts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              View the list of your asked doubts in the lectures
            </p>
          </Link>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-12">
        <h2 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">Quick Access</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Bookmarks Card */}
          <Link to="/student/profile" className="group flex flex-col p-5 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-300">
            <div className="bg-[#f0f4ff] w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
              <Bookmark className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1 text-[15px]">Bookmarks</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              View the list of your saved questions.
            </p>
          </Link>
        </div>
      </div>

      {/* Slogan Footer */}
      <div className="mt-8 px-4">
        <h2 className="text-2xl font-bold text-slate-500 text-center sm:text-left tracking-tight">
          Padhlo chahe kahi se Manzil milegi yahi se!
        </h2>
      </div>

    </div>
  );
};

export default StudentDashboard;
