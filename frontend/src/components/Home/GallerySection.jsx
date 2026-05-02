import React from 'react';
import { motion } from 'framer-motion';

const images = [
  { url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop", span: "col-span-2 row-span-2", alt: "Students in classroom" },
  { url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop", span: "col-span-1 row-span-1", alt: "Group study" },
  { url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop", span: "col-span-1 row-span-1", alt: "Presentation" },
  { url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop", span: "col-span-2 row-span-1", alt: "Maths workshop" }
];

const GallerySection = () => {
  return (
    <section id="gallery" className="py-24 bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Elements */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <div className="bg-[#fff1f2] text-[#9f1239] text-[13px] font-bold px-4 py-1.5 rounded-full mb-5">
            Campus Life
          </div>
          <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a202c] tracking-tight mb-4">
            Moments of Excellence
          </h2>
          <p className="text-slate-500 text-[16px] max-w-2xl mx-auto leading-relaxed">
            Glimpses into our interactive workshops, rigorous math classrooms, and the collaborative environment that fosters academic brilliance.
          </p>
        </motion.div>
        
        {/* Masonry-Style Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 h-[600px]">
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
                className="w-full h-full object-cover z-0 relative" 
              />
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default GallerySection;
