import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-[95vh] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop')" }}
      ></div>
      <div className="absolute inset-0 bg-black/65 z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center text-white px-4 pt-20 max-w-5xl mx-auto"
      >
        <p className="text-amber-300 font-medium tracking-widest uppercase mb-4 text-sm md:text-base">Academic Plus Institute</p>
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
          Building Future<br/>Pharmacy Professionals
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Join Academic Plus for pharmacy-focused learning, expert faculty guidance, practical understanding, and career-ready academic support.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-transparent bg-gradient-to-r from-amber-500 to-yellow-400 px-8 py-3 font-semibold text-lg text-zinc-950 transition duration-300 hover:scale-105 hover:brightness-110">
            Explore Courses <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-amber-300/70 px-8 py-3 font-semibold text-lg transition duration-300 hover:border-amber-400 hover:bg-amber-400 hover:text-zinc-950">
            Get Started
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
