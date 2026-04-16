import React from 'react';
import { Home, Book, Play, User } from 'lucide-react';

const BottomNav = () => {
  return (
    <nav className="fixed bottom-3 left-1/2 z-30 w-[92%] -translate-x-1/2 rounded-2xl bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm dark:bg-slate-900/90 sm:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <button className="flex flex-col items-center gap-1 text-xs text-slate-700 dark:text-slate-200">
          <Home className="h-5 w-5" />
          Home
        </button>
        <button className="flex flex-col items-center gap-1 text-xs text-slate-700 dark:text-slate-200">
          <Book className="h-5 w-5" />
          Courses
        </button>
        <button className="flex flex-col items-center gap-1 text-xs text-slate-700 dark:text-slate-200">
          <Play className="h-5 w-5" />
          Live
        </button>
        <button className="flex flex-col items-center gap-1 text-xs text-slate-700 dark:text-slate-200">
          <User className="h-5 w-5" />
          Profile
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
