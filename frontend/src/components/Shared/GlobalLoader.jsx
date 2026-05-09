import React from 'react';
import { Loader2 } from 'lucide-react';

const GlobalLoader = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm fixed inset-0 z-[9999]">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-slate-600 font-medium animate-pulse">Loading Math Point...</p>
    </div>
  );
};

export default GlobalLoader;
