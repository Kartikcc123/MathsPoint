import React from 'react';
import { motion } from 'framer-motion';

const faculties = [
  { name: "Arvind Sharma", subject: "Senior Mathematics", exp: "15+ Years", img: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070&auto=format&fit=crop" },
  { name: "Priya Singh", subject: "Algebra & Geometry", exp: "8+ Years", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop" },
  { name: "Ravi Verma", subject: "Competitive Math", exp: "10+ Years", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" }
];

const FacultiesSection = () => {
  return (
    <section id="faculties" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Meet Our Faculties</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">Mentorship from the best minds in the industry.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {faculties.map((fac, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col items-center p-8 text-center"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-amber-100">
                <img src={fac.img} alt={fac.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-1">{fac.name}</h3>
              <p className="text-amber-700 font-semibold mb-3">{fac.subject}</p>
              <span className="inline-block bg-gray-100 text-gray-600 px-4 py-1 rounded-full text-sm font-medium">Exp: {fac.exp}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacultiesSection;
