import React from 'react';
import { Play, Clock3 } from 'lucide-react';
import { buildSrcSet } from '../../utils/image';
import LazyImage from '../Shared/LazyImage';

const CourseCard = ({ course = {}, onContinue }) => {
  const { title, faculty, thumbnail, progress = 0, enrolled = false, category } = course;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/88 shadow-[0_22px_55px_-28px_rgba(15,23,42,0.28)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_65px_-26px_rgba(37,99,235,0.28)] dark:border-slate-800/90 dark:bg-slate-900/90">
      <div className="relative h-44 w-full overflow-hidden bg-slate-200">
        <LazyImage
          src={thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80'}
          srcSet={buildSrcSet(thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80')}
          sizes="(max-width: 640px) 640px, 900px"
          alt={title}
          placeholder={thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=100&q=10'}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.72))]" />
        <div className="absolute left-4 top-4 inline-flex rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
          {category || 'Course'}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">Faculty</p>
            <p className="mt-1 text-sm font-semibold">{faculty || 'Academic Team'}</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs backdrop-blur-sm">
            <Clock3 className="h-3.5 w-3.5" />
            {enrolled ? `${progress}% done` : 'Preview'}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            {enrolled ? 'Pick up where you left off and keep your momentum going.' : 'Explore this course before enrolling.'}
          </p>
        </div>

        {enrolled && (
          <div className="w-full">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-300">
              <span>Progress</span>
              <span>{Math.min(100, progress)}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-2.5 rounded-full bg-[linear-gradient(90deg,#2563eb_0%,#22c55e_100%)]" style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3">
          <button
            onClick={() => onContinue && onContinue(course)}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-600 dark:bg-white dark:text-slate-900 dark:hover:bg-sky-100"
          >
            <Play className="h-4 w-4" />
            {enrolled ? 'Continue' : 'Watch Now'}
          </button>
          <div className="text-xs font-medium text-slate-400">{enrolled ? 'In progress' : 'Open preview'}</div>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;
