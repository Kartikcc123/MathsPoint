import React, { useEffect, useState } from 'react';
import { Search, Sun, Moon, Bell, UserCircle } from 'lucide-react';

const Navbar = ({ onSearch, searchValue = '', userName = 'Student' }) => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);

  return (
    <header className="sticky top-0 z-30">
      <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/75 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_55%,#22d3ee_100%)] text-sm font-black tracking-[0.24em] text-white shadow-lg shadow-sky-500/20">
              AP
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">Academic Portal</p>
              <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Welcome back, {userName}</div>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchValue}
                onChange={(e) => onSearch && onSearch(e.target.value)}
                placeholder="Search courses, topics or faculty"
                className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:focus:border-sky-400 dark:focus:ring-sky-950"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white">
                <Bell className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDark((state) => !state)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900">
                <UserCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
