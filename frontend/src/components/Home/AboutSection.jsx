import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, BookOpen } from 'lucide-react';
import directorImage from '../../assets/Director.jpeg';

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/2 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/5] sm:aspect-[5/6] md:aspect-[4/5] lg:aspect-[5/6]">
              <img
                src={directorImage}
                alt="Director of Academic Plus"
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200">Leadership</p>
                <h4 className="mt-2 text-2xl font-serif font-bold">Director, Academic Plus</h4>
                <p className="mt-2 max-w-md text-sm text-slate-100/90">
                  Guiding pharmacy learners with focused mentoring, academic discipline, and practical career vision.
                </p>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 rounded-2xl bg-amber-500 p-6 text-zinc-950 shadow-xl hidden md:block">
              <div className="text-4xl font-bold font-serif">15+</div>
              <div className="text-sm font-medium uppercase tracking-wider">Years of Excellence</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/2"
          >
            <h2 className="text-amber-600 font-semibold tracking-wider uppercase mb-2">About Us</h2>
            <h3 className="text-4xl font-serif font-bold text-slate-900 mb-6">Preparing students for success in pharmacy education</h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Academic Plus is a premier educational institution dedicated to pharmacy-oriented mentoring and academic support. We focus on simplifying core scientific concepts, strengthening subject understanding, and preparing students for professional growth in the pharmacy field.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-1">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Experienced Faculty</h4>
                  <p className="text-gray-600">Learn from teachers and mentors with deep experience in pharmaceutical sciences and applied healthcare education.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-1">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Personalized Mentoring</h4>
                  <p className="text-gray-600">Individual guidance to support classroom progress, practical readiness, and long-term pharmacy career goals.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-1">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Career-Oriented Learning</h4>
                  <p className="text-gray-600">A structured approach that balances exam performance, conceptual depth, and industry-relevant learning.</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
