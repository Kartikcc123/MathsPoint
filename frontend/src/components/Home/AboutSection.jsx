import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Video, FileText, BrainCircuit, Award } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="relative bg-white pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      
      {/* Background Gradient matching PW soft styling */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-pink-50/60 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left pt-10"
          >
            <h2 className="text-[38px] md:text-[46px] lg:text-[52px] font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-6">
              India's <span className="text-indigo-600">Premiere &</span> <br className="hidden md:block" />
              <span className="text-indigo-600">Dedicated</span> <br className="hidden md:block" />
              Mathematics Platform
            </h2>
            <p className="text-[17px] md:text-[19px] text-slate-600 mb-10 max-w-xl font-medium">
              Unlock your true potential by learning with Maths Point- The most structured and reliable 9th-12th mathematics solution.
            </p>
            <Link 
              to="/courses" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 inline-flex items-center justify-center w-full sm:w-auto"
            >
              Get Started
            </Link>
          </motion.div>

          {/* Right Content - Abstract Imagery & Speech Bubbles */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative h-[400px] md:h-[500px]"
          >
            {/* Decorative dashed orbits */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[400px] md:h-[400px] border border-dashed border-slate-300 rounded-full animate-spin-slow" style={{ animationDuration: '40s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[280px] md:h-[280px] border border-dashed border-indigo-200 rounded-full animate-spin-slow" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>
            
            {/* Colored dots on orbits */}
            <div className="absolute top-[10%] left-[20%] w-3 h-3 bg-indigo-400 rounded-full"></div>
            <div className="absolute bottom-[20%] left-[10%] w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="absolute top-[30%] right-[10%] w-3 h-3 bg-amber-400 rounded-full"></div>

            {/* Central Master Mentor Image */}
            <div className="absolute top-1/2 left-[30%] lg:left-[40%] -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070&auto=format&fit=crop" 
                  alt="Lead Mentor" 
                  loading="lazy"
                  decoding="async"
                  width={224}
                  height={224}
                  className="w-40 h-40 md:w-56 md:h-56 object-cover object-top rounded-full border-4 border-white shadow-xl bg-indigo-50"
                />
                {/* Speech Bubble */}
                <div className="absolute -right-28 sm:-right-40 top-1/2 bg-[#120a45] text-white text-[11px] sm:text-[13px] font-medium p-3 rounded-xl rounded-bl-none shadow-lg max-w-[180px] sm:max-w-[220px] transform hover:scale-105 transition-transform z-30">
                  Maths is easy when taught with logic and consistent practice!
                </div>
              </div>
            </div>

            {/* Secondary Student Image */}
            <div className="absolute top-[15%] right-[5%] sm:right-[15%] z-10 hover:z-30">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1974&auto=format&fit=crop" 
                  alt="Student" 
                  loading="lazy"
                  decoding="async"
                  width={144}
                  height={144}
                  className="w-24 h-24 md:w-36 md:h-36 object-cover object-top rounded-full border-4 border-white shadow-lg bg-pink-50"
                />
                {/* Speech Bubble */}
                <div className="absolute -left-28 sm:-left-32 -top-4 bg-white text-slate-800 text-[11px] sm:text-[12px] font-bold p-2.5 rounded-lg rounded-br-none shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-gray-100 truncate w-max">
                  How can I score 100/100?
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
      
      {/* Overlapping Stats Bar at Bottom */}
      <div className="relative max-w-[90%] sm:max-w-6xl mx-auto -mb-16 mt-10 md:mt-0 z-40">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
            
            {/* Stat 1 */}
            <div className="p-6 md:p-8 flex flex-col items-center text-center group hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 fill-current" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg mb-1">Daily Live</h4>
              <p className="text-sm text-slate-500 font-medium">Interactive math classes</p>
            </div>
            
            {/* Stat 2 */}
            <div className="p-6 md:p-8 flex flex-col items-center text-center group hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 fill-current" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg mb-1">10,000 +</h4>
              <p className="text-sm text-slate-500 font-medium">Practice queries & DPPs</p>
            </div>
            
            {/* Stat 3 */}
            <div className="p-6 md:p-8 flex flex-col items-center text-center group hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg mb-1">24 x 7</h4>
              <p className="text-sm text-slate-500 font-medium">Doubt solving support</p>
            </div>
            
            {/* Stat 4 */}
            <div className="p-6 md:p-8 flex flex-col items-center text-center group hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 fill-current" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg mb-1">99.9%</h4>
              <p className="text-sm text-slate-500 font-medium">Highest board scores</p>
            </div>

          </div>
        </motion.div>
      </div>

    </section>
  );
};

export default AboutSection;
