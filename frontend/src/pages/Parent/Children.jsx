import React, { useEffect, useState } from 'react';
import { Users, UserCircle, BookOpen, Fingerprint } from 'lucide-react';
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

const ParentChildren = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/parent/children');
        setChildren(res.data?.children || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load linked children.');
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, []);

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
            <Users className="h-4 w-4 text-indigo-200" /> Linked Wards
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
            Manage Children
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-indigo-100/90 sm:text-lg">
            This list is sourced directly from the backend parent-child access mapping, showing the students you are authorized to monitor.
          </p>
        </div>
      </motion.header>

      {error && (
        <motion.div variants={itemVariant} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </motion.div>
      )}

      <motion.div variants={containerVariant} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {!loading && children.length ? children.map((child) => (
          <motion.article 
            key={child._id} 
            variants={itemVariant}
            whileHover={{ y: -5 }} 
            className="group relative overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10"
          >
            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-indigo-50 transition-transform duration-500 group-hover:scale-150"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 shadow-inner">
                  <UserCircle className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Student</p>
                  <h2 className="text-xl font-extrabold text-slate-800">{child.name}</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <Fingerprint className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student ID</p>
                    <p className="text-sm font-bold text-slate-700">{child.studentId || 'Not assigned'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <BookOpen className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Course</p>
                    <p className="text-sm font-bold text-slate-700">{child.course?.title || 'No course linked'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-500 text-center">{child.email}</p>
              </div>
            </div>
          </motion.article>
        )) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500 md:col-span-2 lg:col-span-3">
            {loading ? 'Loading linked children...' : 'No children are linked yet.'}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ParentChildren;
