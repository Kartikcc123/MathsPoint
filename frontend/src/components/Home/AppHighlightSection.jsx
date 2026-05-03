import React from 'react';
import { Play, Apple, BookOpen, Video, HelpCircle, FileText, Target, Award, BrainCircuit, PenTool, CheckCircle, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock blocks for decoration (the Lego-like pieces in the screenshot)
const BlockBlue = () => (
  <div className="grid grid-cols-2 gap-1 p-1 shrink-0">
    <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
    <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
    <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
    <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
  </div>
);

const BlockYellow = () => (
  <div className="grid grid-cols-3 gap-1 p-1 shrink-0">
    <div className="w-2 h-2 bg-amber-400 rounded-sm"></div>
    <div className="w-2 h-2 bg-amber-400 rounded-sm"></div>
    <div className="w-2 h-2 bg-amber-400 rounded-sm"></div>
    <div className="w-2 h-2 bg-amber-400 rounded-sm"></div>
    <div className="w-2 h-2 bg-amber-400 rounded-sm"></div>
    <div className="w-2 h-2 bg-amber-400 rounded-sm"></div>
  </div>
);

// Feature Pill Component
const FeaturePill = ({ icon: Icon, text, colorClass, iconBg }) => (
  <div className="flex shrink-0 items-center gap-2.5 bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow cursor-default">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${iconBg}`}>
      <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
    </div>
    <span className="text-[14px] font-semibold text-slate-700 tracking-tight whitespace-nowrap">{text}</span>
  </div>
);

const AppHighlightSection = () => {
  // Features list
  const row1 = [
    { icon: HelpCircle, text: "24x7 Doubt Solving", color: "text-emerald-600", bg: "bg-emerald-100" },
    { type: "blockYellow" },
    { icon: PenTool, text: "Mock Tests", color: "text-orange-600", bg: "bg-orange-100" },
    { type: "blockBlue" },
    { icon: BookOpen, text: "Flashcards", color: "text-rose-600", bg: "bg-rose-100" },
    { icon: Target, text: "Career Guidance", color: "text-amber-600", bg: "bg-amber-100" },
    { icon: Video, text: "Live Classes", color: "text-indigo-600", bg: "bg-indigo-100" },
    { icon: HelpCircle, text: "24x7 Doubt Solving", color: "text-emerald-600", bg: "bg-emerald-100" },
    { type: "blockYellow" },
    { icon: PenTool, text: "Mock Tests", color: "text-orange-600", bg: "bg-orange-100" },
  ];

  const row2 = [
    { icon: CheckCircle, text: "PYQ Tests", color: "text-slate-600", bg: "bg-slate-100" },
    { icon: Award, text: "Mentorship", color: "text-red-600", bg: "bg-red-100" },
    { type: "blockYellow" },
    { icon: BrainCircuit, text: "Improvement Book", color: "text-blue-600", bg: "bg-blue-100" },
    { icon: CheckCircle, text: "PYQ Practice", color: "text-emerald-600", bg: "bg-emerald-100" },
    { icon: Target, text: "Daily Sessions", color: "text-rose-600", bg: "bg-rose-100" },
    { icon: FileText, text: "Revision Notes", color: "text-indigo-600", bg: "bg-indigo-100" },
    { type: "blockBlue" },
    { icon: CheckCircle, text: "PYQ Tests", color: "text-amber-600", bg: "bg-amber-100" },
    { icon: Award, text: "Mentorship", color: "text-red-600", bg: "bg-red-100" },
  ];

  const row3 = [
    { icon: FileText, text: "Subjective Tests", color: "text-slate-600", bg: "bg-slate-100" },
    { icon: Target, text: "Important Q's", color: "text-emerald-600", bg: "bg-emerald-100" },
    { type: "blockYellow" },
    { type: "blockBlue" },
    { icon: PenTool, text: "Topic-wise Tests", color: "text-amber-600", bg: "bg-amber-100" },
    { icon: BookOpen, text: "Regular Homework", color: "text-teal-600", bg: "bg-teal-100" },
    { icon: Video, text: "Topic-wise Videos", color: "text-rose-600", bg: "bg-rose-100" },
    { type: "blockYellow" },
    { icon: FileText, text: "Subjective Tests", color: "text-indigo-600", bg: "bg-indigo-100" },
  ];

  const renderRowItems = (row, prefix) => (
    row.map((item, idx) => {
      if (item.type === 'blockBlue') return <BlockBlue key={`${prefix}-${idx}`} />;
      if (item.type === 'blockYellow') return <BlockYellow key={`${prefix}-${idx}`} />;
      return <FeaturePill key={`${prefix}-${idx}`} icon={item.icon} text={item.text} colorClass={item.color} iconBg={item.bg} />;
    })
  );

  return (
    <section className="bg-[#f0f4f8] py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top App Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-12 gap-4 md:gap-6 bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/60 shadow-sm w-full">
          <h2 className="text-2xl md:text-[28px] font-extrabold text-slate-800 tracking-tight text-center md:text-left min-w-0 break-words">
            Learn more about <span className="text-blue-600">Maths Point App</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 justify-center">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex items-center gap-1.5">
                <Play className="w-5 h-5 text-emerald-500 fill-current" />
                <span className="font-bold text-slate-700">4.8</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Apple className="w-5 h-5 text-slate-800 fill-current" />
                <span className="font-bold text-slate-700">4.9</span>
              </div>
            </div>

            <button aria-label="Download Maths Point app" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-colors shadow-md shadow-blue-600/20 whitespace-nowrap min-w-[120px]">
              Download App
            </button>
          </div>
        </div>

      </div>

      {/* Floating Pills Rows (Infinite Marquee) */}
      <div className="relative w-full mx-auto flex flex-col gap-6 select-none mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)">
        
        {/* Row 1 - Moves Left */}
        <div className="flex w-full overflow-hidden">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            className="flex gap-5 items-center shrink-0 w-max"
          >
            {renderRowItems(row1, 'r1a')}
            <div className="w-5"></div>
            {renderRowItems(row1, 'r1b')}
            <div className="w-5"></div>
          </motion.div>
        </div>
        
        {/* Row 2 - Moves Right */}
        <div className="flex w-full overflow-hidden">
          <motion.div 
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
            className="flex gap-5 items-center shrink-0 w-max"
          >
            {renderRowItems(row2, 'r2a')}
            <div className="w-5"></div>
            {renderRowItems(row2, 'r2b')}
            <div className="w-5"></div>
          </motion.div>
        </div>
        
        {/* Row 3 - Moves Left (slightly faster) */}
        <div className="flex w-full overflow-hidden">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="flex gap-5 items-center shrink-0 w-max"
          >
            {renderRowItems(row3, 'r3a')}
            <div className="w-5"></div>
            {renderRowItems(row3, 'r3b')}
            <div className="w-5"></div>
          </motion.div>
        </div>
        
      </div>
    </section>
  );
};

export default AppHighlightSection;
