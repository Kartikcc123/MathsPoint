import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  { name: "Rahul S.", role: "B.Pharm Student", text: "Academic Plus helped me understand pharmaceutics and chemistry in a much clearer way. The faculty guidance gave me real confidence." },
  { name: "Anjali M.", role: "Diploma in Pharmacy Top Performer", text: "The structured teaching, regular assessments, and practical explanations made every module easier to master." },
  { name: "Vikas K.", role: "Parent", text: "The academic support, discipline, and regular feedback gave us confidence that our child was on the right pharmacy career path." }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">What Our Students Say</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mb-6"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-50 p-8 rounded-2xl relative"
            >
              <Quote className="w-12 h-12 text-amber-100 absolute top-6 right-6" />
              <p className="text-gray-600 italic mb-8 relative z-10 text-lg">"{test.text}"</p>
              <div>
                <h4 className="font-bold text-slate-900 font-serif text-xl">{test.name}</h4>
                <span className="text-amber-700 text-sm font-medium uppercase tracking-wider">{test.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
