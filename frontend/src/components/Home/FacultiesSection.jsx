import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { buildSrcSet } from '../../utils/image';

import deepakImg from '../../assets/Deepak.jpeg';
import mansiImg from '../../assets/Mansi.jpeg';
import ashishImg from '../../assets/DirectorCutout.png';

const faculties = [
  { 
    name: "Ashish Upadhyay", 
    subject: "Mathematics", 
    exp: "21 Years", 
    tag: "Director",
    desc: "Visionary leader and senior faculty, driving academic excellence and disciplined mentoring for over two decades.",
    img: ashishImg
  },
  { 
    name: "Mansi Acharya", 
    subject: "Chemistry", 
    exp: "8 Years", 
    tag: "Chemistry Catalyst",
    desc: "Expert in unraveling the complexities of Chemistry, simplifying concepts for a competitive edge.",
    img: mansiImg
  },
  { 
    name: "Deepak Sharma", 
    subject: "Physics", 
    exp: "10 Years", 
    tag: "Physics Expert",
    desc: "Master of Physics concepts, dedicated to simplifying complex theories for exam readiness.",
    img: deepakImg 
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
                <img src={fac.img} alt={fac.name} srcSet={buildSrcSet(fac.img)} sizes="120px" loading="lazy" decoding="async" width={120} height={120} className="w-full h-full object-cover object-top rounded-full bg-slate-50" />
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

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-14 text-center"
        >
          <Link 
            to="/faculties" 
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-[15px] font-bold text-white bg-slate-900 rounded-full shadow-md hover:bg-slate-800 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            Meet All Our Faculties &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FacultiesSection;
