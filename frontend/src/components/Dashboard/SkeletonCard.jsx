import React from 'react';

const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_22px_55px_-28px_rgba(15,23,42,0.2)]">
    <div className="h-44 w-full bg-slate-200" />
    <div className="space-y-3 p-5">
      <div className="h-5 w-3/4 rounded-full bg-slate-200" />
      <div className="h-4 w-full rounded-full bg-slate-200" />
      <div className="h-4 w-2/3 rounded-full bg-slate-200" />
      <div className="pt-2">
        <div className="mb-2 h-3 w-20 rounded-full bg-slate-200" />
        <div className="h-2.5 w-full rounded-full bg-slate-200" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-10 w-28 rounded-full bg-slate-200" />
        <div className="h-3 w-16 rounded-full bg-slate-200" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
