import React from 'react';
import { Play } from 'lucide-react';

const CourseCard = ({ course = {}, onContinue }) => {
  const { title, faculty, thumbnail, progress = 0, enrolled = false } = course;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/80 shadow-md transition-transform duration-300 hover:scale-105 dark:bg-slate-800">
      <div className="h-40 w-full overflow-hidden rounded-t-2xl bg-slate-200">
        <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-300">{faculty}</p>

        {enrolled && (
          <div className="mt-2 w-full">
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-2 rounded-full bg-indigo-500 transition-width" style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-300">{progress}% complete</div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => onContinue && onContinue(course)}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Play className="h-4 w-4" />
            {enrolled ? 'Continue' : 'Watch Now'}
          </button>
          <div className="text-xs text-slate-400">{enrolled ? 'In progress' : 'Preview'}</div>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;
