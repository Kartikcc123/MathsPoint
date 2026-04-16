import React from 'react';
import { motion } from 'framer-motion';

const images = [
  { url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop", span: "col-span-2 row-span-2" },
  { url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop", span: "col-span-1" },
  { url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop", span: "col-span-1" },
  { url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop", span: "col-span-2" }
];

const GallerySection = () => {
  return (
    <section id="gallery" className="py-24 bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif font-bold mb-4">Moments of Learning</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-stone-400">Glimpses into our interactive workshops, classroom sessions, and the environment that fosters academic brilliance.</p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`overflow-hidden rounded-xl ${img.span} ${img.span === 'col-span-1' ? 'aspect-square' : ''}`}
            >
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
                src={img.url} 
                alt="Gallery" 
                className={`w-full h-full object-cover ${img.span.includes('row-span-2') ? 'min-h-[400px]' : ''}`} 
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
