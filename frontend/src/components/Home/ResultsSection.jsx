import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award } from 'lucide-react';

const ResultsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-zinc-950 text-white">
      {/* Decorative BG pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif font-bold mb-4">Our Hall of Fame</h2>
          <div className="w-16 h-1 bg-white mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-lg text-amber-100/80">Celebrating the exceptional achievements of our scholars year after year.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-amber-300/15 bg-white/10 p-8 text-center backdrop-blur-md"
          >
            <Trophy className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <div className="text-5xl font-bold font-serif mb-2">99.8%</div>
            <div className="text-amber-100/80">Highest Score in Boards</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-amber-300/15 bg-white/10 p-8 text-center backdrop-blur-md"
          >
            <Award className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <div className="text-5xl font-bold font-serif mb-2">500+</div>
            <div className="text-amber-100/80">Selections in Top Tier Colleges</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-amber-300/15 bg-white/10 p-8 text-center backdrop-blur-md"
          >
            <Star className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <div className="text-5xl font-bold font-serif mb-2">100%</div>
            <div className="text-amber-100/80">First Division Rate</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
