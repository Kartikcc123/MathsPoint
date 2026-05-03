import React from 'react';
import { motion } from 'framer-motion';
import { buildSrcSet } from '../../utils/image';
import LazyImage from '../Shared/LazyImage';

const testimonials = [
  { 
    name: "Aman Gupta", 
    role: "JEE Main 2024 AIR 78 | JEE", 
    text: "Maths Point's lectures and specially editorial discussions from where I made important pointers. I also watched some history videos like Buddhism, Jainism as the topics were explained very clearly... all these were very helpful during my preparation...",
    img: "https://images.unsplash.com/photo-1599566147214-ce487862ea4f?q=80&w=1976&auto=format&fit=crop"
  },
  { 
    name: "Ravi Majhi", 
    role: "GATE 2024 AIR 1 | GATE", 
    text: "I am Ravi Majhi, and I am thrilled to share that I have secured All India Rank 1 (AIR 1) in the GATE 2024 examination. From the very beginning, Maths Point stood out for its structured and comprehensive curriculum.",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop"
  },
  { 
    name: "Amit Kumar Mandal", 
    role: "IBPS Topper | Banking", 
    text: "Maths Point helped me in establishing the basics of every subject through which I was able to progress quickly and was also able to increase my speed and also maintaining accuracy.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-[#f8f9fc] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Elements */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#1a202c] mb-3 flex items-center justify-center gap-3">
            Students <span className="text-red-500">❤️</span> Maths Point
          </h2>
          <p className="text-slate-500 text-[18px]">Hear from our students</p>
        </motion.div>

        {/* Featured Top Testimonial */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bg-white rounded-sm shadow-sm border border-gray-100 flex flex-col md:flex-row mb-6 overflow-hidden md:min-h-[280px]"
        >
           {/* Visual Graphic Left Placeholder */}
           <div className="md:w-1/3 bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden">
             <LazyImage
               src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
               srcSet={buildSrcSet('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop')}
               sizes="(max-width: 768px) 100vw, 600px"
               alt="Featured Student"
               placeholder="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=10&w=200&auto=format&fit=crop"
               className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 pointer-events-none">
                 <h3 className="text-white font-extrabold text-3xl">JEE ADV</h3>
                 <p className="text-yellow-400 font-black text-5xl tracking-tighter">AIR 1</p>
             </div>
           </div>

           {/* Content Right */}
           <div className="md:w-2/3 p-8 flex flex-col justify-center relative">
              <span className="text-8xl text-slate-100 font-serif absolute top-2 left-6 leading-none -z-0">“</span>
              <p className="text-slate-600 text-[15px] leading-relaxed relative z-10 mb-8 pt-4">
                My name is Tathagat Awatar. I secured All India Rank 1 by scoring full marks in JEE Advanced 2024. I started my preparation with Maths Point in 12th grade by joining the premium batch, then I took 2 drops... My teachers and their guidance helps me to achieve AIR1 and motivated me during my drop year....
              </p>
              
              <div className="mt-auto">
                 <h4 className="font-extrabold text-[#1a202c] text-base mb-1">Multiple Rankers</h4>
                 <p className="text-indigo-600 text-[13px] font-bold">AIR 1, AIR 86 and other <span className="text-slate-300 mx-1">|</span> JEE</p>
              </div>
           </div>
        </motion.div>
        
        {/* Secondary Row Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 relative flex flex-col"
            >
              <span className="text-8xl text-[#f1f5f9] font-serif absolute -top-4 left-4 leading-none select-none">“</span>
              
              <p className="text-slate-600 text-[14.5px] leading-relaxed relative z-10 flex-grow mb-8 mt-6">
                {test.text}
              </p>
              
              <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-5 relative z-10">
                <LazyImage src={test.img} srcSet={buildSrcSet(test.img)} sizes="44px" alt={test.name} placeholder={`${test.img}?q=10&w=80`} width={44} height={44} className="w-11 h-11 rounded-full object-cover border border-gray-200" />
                <div>
                  <h4 className="font-extrabold text-[#1a202c] text-[15px] mb-0.5">{test.name}</h4>
                  <span className="text-[#4b6bfb] text-[12px] font-bold">{test.role.split('|')[0]} <span className="text-gray-300 mx-1">|</span> {test.role.split('|')[1]}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
