import React from 'react';
import { Home, Book, Play, User } from 'lucide-react';

const BottomNav = () => {
  const items = [
    { label: 'Home', Icon: Home, active: true },
    { label: 'Courses', Icon: Book },
    { label: 'Live', Icon: Play },
    { label: 'Profile', Icon: User },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 z-30 w-[92%] -translate-x-1/2 rounded-[28px] border border-white/70 bg-white/90 px-3 py-3 shadow-[0_25px_60px_-30px_rgba(15,23,42,0.5)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {items.map(({ label, Icon, active }) => (
          <button
            key={label}
            className={`flex min-w-[68px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition ${active ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300'}`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
