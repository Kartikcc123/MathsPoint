import React from 'react';
import { motion } from 'framer-motion';
import { BookMarked, FileText, BookOpen } from 'lucide-react';

const resources = [
  {
    title: "Reference Books",
    desc: "Our experts have created thorough study materials that break down complicated concepts into easily understandable content.",
    bgColor: "bg-[#f0f8ff]",
    icon: <BookMarked className="w-24 h-24 text-blue-500 drop-shadow-md" />,
    button: true
  },
  {
    title: "NCERT Solutions",
    desc: "Unlock academic excellence with Maths Point's NCERT Solutions which provides you step-by-step solutions for thorough understanding.",
    bgColor: "bg-[#fff8ee]",
    icon: <BookOpen className="w-24 h-24 text-orange-400 drop-shadow-md" />,
    button: false
  },
  {
    title: "Notes",
    desc: "Use Maths Point's detailed study materials that simplify complex ideas into easily understandable language for faster revision.",
    bgColor: "bg-[#eefcf2]",
    icon: <FileText className="w-24 h-24 text-emerald-500 drop-shadow-md" />,
    button: false
  }
];

const ResourcesSection = () => {
  return (
    <section className="py-24 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Elements */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a202c] tracking-tight mb-4">
            Study Resources
          </h2>
          <p className="text-slate-500 text-[17px] font-medium max-w-2xl mx-auto">
            A diverse array of learning materials to enhance your educational journey.
          </p>
        </motion.div>
        
        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((res, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-2xl p-8 flex flex-col h-full ${res.bgColor} transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer`}
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-3">{res.title}</h3>
              <p className="text-slate-600 text-[15px] leading-relaxed font-medium mb-8">
                {res.desc}
              </p>
              
              <div className="mt-auto flex flex-col items-center justify-center">
                {/* Visual Icon representation instead of specific 3D assets */}
                <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
                  {res.icon}
                </div>
                
                {res.button && (
                  <button className="bg-[#1c1c1c] text-white px-6 py-2 rounded-md font-bold text-sm tracking-wide mt-2 hover:bg-black transition-colors">
                    Explore
                  </button>
                )}
              </div>
              
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default ResourcesSection;
