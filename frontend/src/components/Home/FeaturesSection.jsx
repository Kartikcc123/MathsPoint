import React from 'react';
import { motion } from 'framer-motion';
import { Video, BookOpen, CheckCircle, HelpCircle, Activity } from 'lucide-react';

const features = [
  { icon: <Video className="w-8 h-8 text-amber-600" />, title: "Live Classes", desc: "Interactive, real-time sessions with strict curriculum timelines." },
  { icon: <BookOpen className="w-8 h-8 text-amber-600" />, title: "Structured Learning", desc: "Organized study material and chapter-wise modules." },
  { icon: <CheckCircle className="w-8 h-8 text-amber-600" />, title: "Practice Tests", desc: "Weekly assessments based on pharmacy-focused topics, case patterns, and academic evaluation." },
  { icon: <HelpCircle className="w-8 h-8 text-amber-600" />, title: "Doubt Solving", desc: "24/7 priority resolution of conceptual doubts." },
  { icon: <Activity className="w-8 h-8 text-amber-600" />, title: "Performance Tracking", desc: "Detailed analytics on test scores and specific weaknesses." }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Why Choose Academic Plus?</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">We provide everything a student needs in one ecosystem.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center text-center rounded-2xl border border-transparent bg-stone-50 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-amber-100 hover:bg-white hover:shadow-xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold font-serif text-slate-900 mb-3">{feat.title}</h3>
              <p className="text-gray-600 text-sm">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
