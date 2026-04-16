import React, { useEffect, useState } from 'react';
import { Search, Sun, Moon, UserCircle } from 'lucide-react';

const Navbar = ({ onSearch }) => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);

  return (
    <header className="sticky top-0 z-20 w-full bg-white/60 backdrop-blur-md dark:bg-slate-900/60">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-indigo-600 px-3 py-2 text-white">AP</div>
          <div className="text-sm font-bold">AcademicPlus</div>
        </div>

        <div className="ml-4 flex flex-1 items-center gap-3">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              onChange={(e) => onSearch && onSearch(e.target.value)}
              placeholder="Search courses, topics or faculty"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 py-2 pl-10 pr-4 text-sm shadow-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setDark((s) => !s)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200">
              <UserCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
