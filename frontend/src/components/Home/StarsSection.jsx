import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const starsData = [
  {
    id: 1,
    name: "Aritro Ray",
    category: "JEE Adv.",
    year: "25",
    program: "Online Classroom Course",
    achievement: "AIR 50",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Charuvrat Bains",
    category: "JEE Main",
    year: "25",
    program: "Offline Classroom Course",
    achievement: "99.9%ile",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Aabhineet Patni",
    category: "CBSE 12th",
    year: "24",
    program: "Online Classroom Course",
    achievement: "99.4%",
    image: "https://images.unsplash.com/photo-1599566147214-ce487862ea4f?q=80&w=1976&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Pragya Poonia",
    category: "CBSE 10th",
    year: "24",
    program: "Foundation Course",
    achievement: "98.8%",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Arka Banerjee",
    category: "JEE Adv.",
    year: "24",
    program: "Online Classroom Course",
    achievement: "AIR 395",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: 6,
    name: "Rishabh Jain",
    category: "JEE Main",
    year: "24",
    program: "Crash Course",
    achievement: "AIR 842",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
  }
];

const categories = ["ALL", "JEE Adv.", "JEE Main", "BOARDS"];

const StarsSection = () => {
  const [activeTab, setActiveTab] = useState("ALL");
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  const filteredStars = activeTab === "ALL"
    ? starsData
    : starsData.filter(star => {
        if (activeTab === 'BOARDS') return /CBSE|Board/i.test(star.category);
        return String(star.category).toLowerCase() === String(activeTab).toLowerCase();
      });

  // Animated counter for header (simple incremental effect)
  useEffect(() => {
    let raf = null;
    const start = performance.now();
    const from = 0;
    const to = filteredStars.length;
    const duration = 600; // ms
    const step = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      setCount(Math.round(from + (to - from) * t));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [filteredStars.length]);

  // Helper to render the cards (new grid-oriented card design)
  const renderCards = () => (
    filteredStars.map((star, idx) => (
      <motion.article
        key={`${star.id}-${idx}`}
        className="relative bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col md:flex-row gap-4 p-4"
        whileHover={shouldReduceMotion ? {} : { scale: 1.025, translateY: -6 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: idx * 0.05 }}
      >
        <div className="flex-shrink-0 w-full md:w-40 lg:w-44 h-36 md:h-auto rounded-md overflow-hidden bg-gradient-to-tr from-sky-50 to-white flex items-center justify-center">
          <img src={star.image} alt={star.name} loading="lazy" className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover object-top shadow-xl border-4 border-white -mt-6 md:mt-0" />
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">{star.name}</h3>
              <span className="text-xs font-semibold px-2 py-1 rounded-full text-white bg-gradient-to-r from-emerald-500 to-teal-500">{star.achievement}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{star.program} • <span className="font-medium text-slate-700">{star.category} '{star.year}</span></p>
            <p className="mt-3 text-sm text-slate-600">Outstanding academic performance with focused mentoring and regular test-series.</p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs text-slate-500">Featured student</span>
            </div>
            <button aria-label={`View profile of ${star.name}`} className="inline-flex items-center gap-2 text-sm text-sky-600 hover:underline">
              View profile <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.article>
    ))
  );

  return (
    <section className="py-20 bg-white border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section matching exact screenshot layout */}
        <div className="flex flex-col mb-10">
          <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a202c] tracking-tight mb-6 flex items-center gap-2">
            Meet our stars <span className="text-amber-400">✨</span>
          </h2>
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`shrink-0 px-6 py-2 rounded-lg text-sm font-bold transition-colors border ${
                  activeTab === cat 
                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                    : 'bg-white text-slate-500 border-gray-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {/* Grid layout for stars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> 
          {renderCards()}
        </div>

      </div>

      {/* Utility style for hiding scrollbar directly in component if needed */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </section>
  );
};

export default StarsSection;
