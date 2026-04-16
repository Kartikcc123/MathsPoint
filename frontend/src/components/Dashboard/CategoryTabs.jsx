import React from 'react';

const CategoryTabs = ({ categories = [], active = 'All', onChange }) => {
  return (
    <div className="-mx-4 w-full overflow-x-auto px-4 sm:mx-0">
      <div className="flex gap-3 py-3">
        {categories.map((cat) => {
          const isActive = cat === active;
          return (
            <button
              key={cat}
              onClick={() => onChange && onChange(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
