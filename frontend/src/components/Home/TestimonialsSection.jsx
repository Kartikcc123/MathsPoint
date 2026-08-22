import React from 'react';
import { motion } from 'framer-motion';
import { buildSrcSet } from '../../utils/image';
const MentorImage = "https://lmssystem.s3.ap-south-1.amazonaws.com/static-assets/17b53ac618731af4b69154aaa9d8a559.jpeg";
const SomyaImage = "https://lmssystem.s3.ap-south-1.amazonaws.com/static-assets/9f4fa78de602ede0aad0c2e2a50c364f.webp";
// const StudentImage = "https://lmssystem.s3.ap-south-1.amazonaws.com/static-assets/65e26407d2d083d7d2f0b042a81662c4.jpeg";
import LazyImage from '../Shared/LazyImage';

const getImageProps = (img) => {
  const isRemote = typeof img === 'string' && /^https?:\/\//.test(img);

  return {
    src: img,
    srcSet: isRemote ? buildSrcSet(img) : undefined,
    placeholder: isRemote ? `${img}?q=10&w=80` : img,
  };
};

const testimonials = [
  { 
    name: "Somya Lodha", 
    role: "Class 10 Topper | Maths 97/100", 
    text: "Maths Point helped me build strong concepts in mathematics and improve my confidence step by step. The teaching style made difficult topics feel simple, and that support helped me score 97/100 in Maths.",
    img: SomyaImage,
    imageClassName: "scale-[2.25] object-[center_22%]"
  },
  { 
    name: "Nimit Mehta", 
    role: "Class 12 Commerce Topper | 98.2%", 
    text: "My experience with Maths Point has been excellent throughout my Class 12 journey. The guidance, regular practice, and clear explanations played a big role in helping me achieve 98.2% in Commerce.",
    img: MentorImage,
    imageClassName: "scale-[2.1] object-[center_18%]"
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-[#f8f9fc] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Elements */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#1a202c] mb-3 flex items-center justify-center gap-3">
            Students <span className="text-red-500">❤️</span> Maths Point
          </h2>
          <p className="text-slate-500 text-[18px]">Hear from our students</p>
        </motion.div>

        {/* Featured Top Testimonial */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bg-white rounded-sm shadow-sm border border-gray-100 flex flex-col md:flex-row mb-6 overflow-hidden md:min-h-[280px]"
        >
           {/* Visual Graphic Left Placeholder */}
           <div className="md:w-1/3 bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden">
             <LazyImage
               src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
               srcSet={buildSrcSet('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop')}
               sizes="(max-width: 768px) 100vw, 600px"
               alt="Featured Student"
               placeholder="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=10&w=200&auto=format&fit=crop"
               className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 pointer-events-none">
                 <h3 className="text-white font-extrabold text-3xl">Class 10 & 12</h3>
                 <p className="text-yellow-400 font-black text-5xl tracking-tighter">Top Maths Results</p>
             </div>
           </div>

           {/* Content Right */}
           <div className="md:w-2/3 p-8 flex flex-col justify-center relative">
              <span className="text-8xl text-slate-100 font-serif absolute top-2 left-6 leading-none -z-0">“</span>
              <p className="text-slate-600 text-[15px] leading-relaxed relative z-10 mb-8 pt-4">
                Maths Point is dedicated to helping Class 10 and Class 12 students master mathematics with clarity and confidence. Through strong concept building, regular practice, and focused guidance, our students improve their scores, perform well in board exams, and achieve top results.
              </p>
              
              <div className="mt-auto">
                 <h4 className="font-extrabold text-[#1a202c] text-base mb-1">Focused Board Preparation</h4>
                 <p className="text-indigo-600 text-[13px] font-bold">Class 10 Excellence <span className="text-slate-300 mx-1">|</span> Class 12 Top Scores</p>
              </div>
           </div>
        </motion.div>
        
        {/* Secondary Row Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => {
            const imageProps = getImageProps(test.img);

            return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 relative flex flex-col"
            >
              <span className="text-8xl text-[#f1f5f9] font-serif absolute -top-4 left-4 leading-none select-none">“</span>
              
              <p className="text-slate-600 text-[14.5px] leading-relaxed relative z-10 flex-grow mb-8 mt-6">
                {test.text}
              </p>
              
              <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-5 relative z-10">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-white shrink-0">
                  <LazyImage
                    src={imageProps.src}
                    srcSet={imageProps.srcSet}
                    sizes="56px"
                    alt={test.name}
                    placeholder={imageProps.placeholder}
                    width={56}
                    height={56}
                    className={`w-full h-full object-cover ${test.imageClassName ?? "scale-150 object-center"}`}
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#1a202c] text-[15px] mb-0.5">{test.name}</h4>
                  <span className="text-[#4b6bfb] text-[12px] font-bold">{test.role.split('|')[0]} <span className="text-gray-300 mx-1">|</span> {test.role.split('|')[1]}</span>
                </div>
              </div>
            </motion.div>
          )})}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
