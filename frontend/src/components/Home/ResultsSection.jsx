import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildSrcSet } from '../../utils/image';
import LazyImage from '../Shared/LazyImage';

const categories = [
  "UPSC CSE",
  "GATE",
  "Board Exams - CBSE 10th", 
  "Board Exams - ICSE 10th",
  "Board Exams - CBSE 12th", 
  "CA",
  "MBA",
  "SSC",
  "IIT JAM",
  "Banking"
];

// In production, these should be paths to the actual graphic `.webp`/`.png` posters
const bannerData = {
  "UPSC CSE": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
  "GATE": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
  "Board Exams - CBSE 10th": "https://images.unsplash.com/photo-1427504494785-319ce8382ac0?q=80&w=2070&auto=format&fit=crop",
  "Board Exams - ICSE 10th": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop",
  "Board Exams - CBSE 12th": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064&auto=format&fit=crop",
  "CA": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop",
  "MBA": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop",
  "SSC": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
  "IIT JAM": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop",
  "Banking": "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=2070&auto=format&fit=crop"
};

const ResultsSection = () => {
  const [activeTab, setActiveTab] = useState("UPSC CSE");

  return (
    <section className="py-20 bg-white border-b border-gray-100 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Elements */}
        <div className="text-center mb-10 flex flex-col items-center">
          <h2 className="text-[32px] md:text-[38px] font-bold text-[#1a202c] tracking-tight mb-2">
            Academic Excellence : Results
          </h2>
          <p className="text-slate-500 text-[16px] md:text-[18px] max-w-2xl mx-auto">
            Giving wings to a millions dreams, a million more to go
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-3 overflow-x-auto pb-4 scrollbar-hide flex-nowrap md:flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`shrink-0 px-5 py-1.5 rounded-full text-[13px] font-medium transition-all border ${
                activeTab === cat 
                  ? 'border-indigo-500 text-indigo-500' 
                  : 'border-gray-200 text-slate-600 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* Simple, Pure Banner Image Container */}
        <div className="w-full relative rounded-lg overflow-hidden flex items-center justify-center bg-slate-50">
          <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
               className="w-full"
             >
               <LazyImage
                 src={bannerData[activeTab] || bannerData['UPSC CSE']}
                 srcSet={buildSrcSet(bannerData[activeTab] || bannerData['UPSC CSE'])}
                 sizes="100vw"
                 alt={`${activeTab} Results Wall`}
                 placeholder={(bannerData[activeTab] || bannerData['UPSC CSE']) + '?q=10&w=200'}
                 className="w-full h-auto object-cover max-h-[600px] rounded-lg shadow-sm"
               />
             </motion.div>
             
          </AnimatePresence>
        </div>
        
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}} />
    </section>
  );
};

export default ResultsSection;
