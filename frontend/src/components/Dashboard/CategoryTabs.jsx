import React from 'react';

const CategoryTabs = ({ categories = [], active = 'All', onChange }) => {
  return (
    <div className="-mx-4 w-full overflow-x-auto px-4 sm:mx-0">
      <div className="inline-flex min-w-full gap-2 rounded-[24px] border border-white/60 bg-white/70 p-2 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/60 sm:min-w-0">
        {categories.map((category) => {
          const isActive = category === active;

          return (
            <button
              key={category}
              onClick={() => onChange && onChange(category)}
              className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
