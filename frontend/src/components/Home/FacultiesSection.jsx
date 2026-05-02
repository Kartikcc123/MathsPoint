import React from 'react';
import { motion } from 'framer-motion';

const faculties = [
  { 
    name: "Arvind Sharma", 
    subject: "Senior Mathematics", 
    exp: "15+ Years", 
    tag: "Ex-HOD",
    desc: "Renowned for simplifying complex calculus and algebra for JEE Advanced.",
    img: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070&auto=format&fit=crop" 
  },
  { 
    name: "Priya Singh", 
    subject: "Algebra & Geometry", 
    exp: "8+ Years", 
    tag: "Olympiad Specialist",
    desc: "Expert in building strong foundations for 9th and 10th-grade board toppers.",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop" 
  },
  { 
    name: "Ravi Verma", 
    subject: "Competitive Math", 
    exp: "10+ Years", 
    tag: "Gold Medalist",
    desc: "Master of shortcut tricks and speed strategies to crack objective math exams.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" 
  }
];

const FacultiesSection = () => {
  return (
    <section id="faculties" className="py-24 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Elements */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <div className="bg-[#fff1f2] text-[#9f1239] text-[13px] font-bold px-4 py-1.5 rounded-full mb-5">
            Expert Faculties
          </div>
          <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a202c] tracking-tight mb-4">
            Learn from the Math Masters
          </h2>
          <p className="text-slate-500 text-[16px] max-w-2xl mx-auto leading-relaxed">
            India's top educators right on your screen, combining deep subject knowledge with the best exam-oriented strategies.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {faculties.map((fac, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-200 flex flex-col items-center p-8 text-center transition-shadow group relative"
            >
              
              {/* Optional background accent for the top of the card */}
              <div className="absolute top-0 left-0 right-0 h-[100px] bg-slate-50 rounded-t-xl border-b border-gray-100 z-0"></div>

              {/* Portrait */}
              <div className="relative w-[120px] h-[120px] rounded-full border-[3px] border-[#0a1128] p-1 bg-white z-10 mb-5 group-hover:scale-105 transition-transform duration-300">
                <img src={fac.img} alt={fac.name} className="w-full h-full object-cover rounded-full" />
              </div>
              
              {/* Info */}
              <h3 className="text-xl font-extrabold text-[#1a202c] mb-1 z-10">{fac.name}</h3>
              <p className="text-[#9f1239] font-bold text-[13.5px] bg-[#fff1f2] px-3 py-1 rounded-md mb-4 z-10">
                {fac.subject}
              </p>
              
              <p className="text-slate-500 text-sm font-medium mb-6 z-10 leading-relaxed px-2">
                {fac.desc}
              </p>
              
              {/* Bottom Tags */}
              <div className="mt-auto w-full flex items-center justify-center gap-3 pt-5 border-t border-gray-100 z-10">
                <span className="text-slate-700 text-[12px] font-bold bg-slate-100 px-3 py-1.5 rounded flex-1">
                  Exp: {fac.exp}
                </span>
                <span className="text-indigo-700 text-[12px] font-bold bg-indigo-50 px-3 py-1.5 rounded flex-1">
                  {fac.tag}
                </span>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacultiesSection;
