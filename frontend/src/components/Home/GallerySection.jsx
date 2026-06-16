import React from 'react';
import { motion } from 'framer-motion';
// import advertise1 from '../../assets/Advertise1.png';
// import advertise2 from '../../assets/Advertise2.png';
// import advertise3 from '../../assets/Advertise3.png';

const images = [
  // { url: advertise1, span: 'md:col-span-2', alt: 'Maths Point advertisement poster 1' },
  // { url: advertise2, span: 'md:col-span-1', alt: 'Maths Point advertisement poster 2' },
  // { url: advertise3, span: 'md:col-span-1', alt: 'Maths Point advertisement poster 3' },
];

const GallerySection = () => {
  return (
    <section id="gallery" className="py-24 bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Elements */}
        {/* <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <div className="bg-[#fff1f2] text-[#9f1239] text-[13px] font-bold px-4 py-1.5 rounded-full mb-5">
            Featured Posters
          </div>
          <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a202c] tracking-tight mb-4">
            Latest Advertisements
          </h2>
          <p className="text-slate-500 text-[16px] max-w-2xl mx-auto leading-relaxed">
            Explore the latest Maths Point posters highlighting our programs, batches, and student-focused learning opportunities.
          </p>
        </motion.div>
         */}
        {/* Poster Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[260px] md:auto-rows-[320px]">
          {images.map((img, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`overflow-hidden rounded-[16px] border border-gray-200 shadow-sm relative group bg-white ${img.span}`}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-10"></div>
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                src={img.url} 
                alt={img.alt} 
                className="w-full h-full object-contain bg-white z-0 relative" 
              />
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default GallerySection;
