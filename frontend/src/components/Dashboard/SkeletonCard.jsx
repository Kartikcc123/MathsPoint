import React from 'react';

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="h-40 w-full rounded-t-2xl bg-slate-200" />
    <div className="space-y-2 rounded-b-2xl bg-white p-4">
      <div className="h-4 w-3/4 rounded bg-slate-200" />
      <div className="h-3 w-1/2 rounded bg-slate-200" />
      <div className="mt-3 flex items-center justify-between">
        <div className="h-8 w-24 rounded-full bg-slate-200" />
        <div className="h-3 w-12 rounded bg-slate-200" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
