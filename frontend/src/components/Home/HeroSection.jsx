import React from 'react';
import LazyImage from '../Shared/LazyImage';
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { resolveMediaUrl } from '../../utils/media';

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

export default function HeroSection({ ads = [] }) {
  const dynamicSlides = ads.length
    ? ads
        .filter((ad) => ad.imageUrl)
        .map((ad, index) => ({
          img: resolveMediaUrl(ad.imageUrl),
          alt: ad.title || `Maths Point advertisement poster ${index + 1}`,
        }))
    : [];
  const slides = dynamicSlides;

  if (!slides.length) {
    return null;
  }

  return (
    <section id="hero" className="w-full relative bg-slate-950">
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        effect="fade"
        pagination={{ clickable: true }}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        loop={true}
        className="w-full aspect-[16/7] min-h-[220px] max-h-[560px] group"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="w-full h-full relative bg-slate-950">
              <LazyImage
                src={slide.img}
                alt={slide.alt}
                placeholder={slide.img}
                className="absolute inset-0 w-full h-full"
                imgClassName="bg-slate-950"
                imgStyle={{ objectFit: 'contain', objectPosition: 'center' }}
                style={{ position: 'absolute', inset: 0 }}
              />
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
        .swiper-pagination { bottom: 16px !important; }
      `}} />
    </section>
  );
}
