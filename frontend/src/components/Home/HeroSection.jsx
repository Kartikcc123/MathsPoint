import React from 'react';
import { buildSrcSet } from '../../utils/image';
import LazyImage from '../Shared/LazyImage';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from 'framer-motion';

const SwiperNavButtons = () => {
  const swiper = useSwiper();
  const handleKey = (e, fn) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => swiper.slidePrev()}
        onKeyDown={(e) => handleKey(e, () => swiper.slidePrev())}
        aria-label="Previous slide"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 hidden md:flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white cursor-pointer hover:bg-sky-500 hover:border-sky-400 transition-all hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-6 h-6 stroke-[3]" />
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => swiper.slideNext()}
        onKeyDown={(e) => handleKey(e, () => swiper.slideNext())}
        aria-label="Next slide"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 hidden md:flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white cursor-pointer hover:bg-sky-500 hover:border-sky-400 transition-all hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-6 h-6 stroke-[3]" />
      </div>
    </>
  );
};

export default function HeroSection() {
  const slides = [
    {
      title: "Empower Your Maths Preparation",
      subtitle: "Join the elite institute dedicated to forging future toppers.",
      img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Learn with India's Best Educators",
      subtitle: "Expert faculty guidance and practical understanding.",
      
      img: "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Crack Exams with Confidence",
      subtitle: "Career-ready academic support and test series.",
      
      img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
    },
  ];

  return (
    <section id="hero" className="w-full relative bg-slate-950">
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        effect="fade"
        pagination={{ clickable: true }}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        loop={true}
        className="w-full h-[220px] md:h-[280px] lg:h-[320px] group"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="w-full h-full flex items-center px-4 md:px-12 lg:px-20 relative">
              <LazyImage
                src={slide.img}
                srcSet={buildSrcSet(slide.img)}
                sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1600px"
                alt=""
                ariaHidden={true}
                placeholder={slide.img}
                className="absolute inset-0 w-full h-full object-cover object-center -z-10"
                style={{ position: 'absolute', inset: 0 }}
              />
              {/* Cinematic Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-transparent z-0"></div>
              <div className="absolute inset-0 bg-black/20 z-0"></div>
              
              <motion.div className="relative z-10 max-w-xl md:max-w-2xl ml-0 md:ml-4 lg:ml-8"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
              >
                <span className="inline-block py-0.5 px-2.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[10px] md:text-xs font-semibold tracking-wider uppercase mb-2 md:mb-3 backdrop-blur-md">
                  Maths Point Exclusive
                </span>
                <h2 className="text-xl md:text-3xl lg:text-4xl font-extrabold mb-1.5 md:mb-3 leading-[1.1] tracking-tight text-white drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="mb-3 md:mb-5 text-slate-200 text-xs md:text-sm lg:text-base font-light max-w-md leading-snug">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-5">
                  <motion.a
                    href="#courses"
                    aria-label="Explore courses"
                    className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-sky-500 transition-all duration-300 px-5 py-2 md:px-6 md:py-2.5 rounded-full font-bold shadow-lg shadow-sky-500/25 text-white text-[12px] md:text-[14px]"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.35 + index * 0.05 }}
                  >
                    Explore Courses <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                  </motion.a>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, delay: 0.45 + index * 0.05 }}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link to="/register" aria-label="Get started - register" className="inline-flex items-center gap-2 border border-white/10 hover:border-sky-400 transition-all px-4 py-2 rounded-full text-white text-[12px] md:text-[14px]">
                        Get Started
                      </Link>
                    </motion.div>
                  </motion.div>
                  <span className="text-amber-400 font-semibold text-xs md:text-sm tracking-wide drop-shadow-sm">
                    {slide.price}
                  </span>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation Component directly invoking Swiper Hook */}
        <SwiperNavButtons />
      </Swiper>
      
      {/* Custom Styles overrides for Swiper elements to look more premium */}
      <style dangerouslySetInnerHTML={{__html: `
        .swiper-pagination-bullet { background-color: #fff; opacity: 0.5; width: 8px; height: 8px; transition: all 0.3s ease; }
        .swiper-pagination-bullet-active { background-color: #0ea5e9; opacity: 1; width: 32px; border-radius: 4px; }
        .swiper-pagination { bottom: 24px !important; }
      `}} />
    </section>
  );
}
