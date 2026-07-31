import React, { useEffect, useRef, useState } from 'react';
import { trackImpression, trackClick } from '../../services/advertisementService';

const ResponsiveBanner = ({ ad, className = '' }) => {
  const containerRef = useRef(null);
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    if (!ad || hasTracked) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackImpression(ad._id);
          setHasTracked(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 } // Trigger when 50% visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [ad, hasTracked]);

  if (!ad) return null;

  const handleClick = () => {
    trackClick(ad._id);
    if (ad.redirectLink) {
      window.open(ad.redirectLink, '_blank');
    }
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleClick}
      className={`relative w-full rounded-2xl overflow-hidden cursor-pointer group ${className} ${ad.type === 'text-card' ? ad.backgroundColor + ' aspect-[16/9] md:aspect-[21/9] lg:aspect-[32/9] flex items-center justify-center p-6 md:p-12 text-center' : ''}`}
    >
      {ad.type === 'text-card' ? (
        <div className={`flex flex-col items-center justify-center max-w-4xl mx-auto z-10 ${ad.backgroundColor?.includes('gray-100') ? 'text-gray-900' : 'text-white'}`}>
          {ad.title && <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight drop-shadow-sm">{ad.title}</h2>}
          {ad.description && <p className="text-base md:text-xl opacity-90 mb-8 max-w-2xl leading-relaxed">{ad.description}</p>}
          {ad.buttonText && (
            <button className={`px-8 py-3 rounded-full font-bold text-base md:text-lg transition-transform hover:scale-105 shadow-lg ${ad.backgroundColor?.includes('gray-100') ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-900 hover:bg-gray-50'}`}>
              {ad.buttonText}
            </button>
          )}
        </div>
      ) : (
        <>
          <picture>
            {/* Desktop >= 1200px */}
            <source media="(min-width: 1200px)" srcSet={ad.desktopImage} type="image/webp" />
            
            {/* Tablet >= 768px */}
            <source media="(min-width: 768px)" srcSet={ad.tabletImage} type="image/webp" />
            
            {/* Mobile < 768px (Fallback to mobile Image) */}
            <img 
              src={ad.mobileImage} 
              alt={ad.title || 'Advertisement'} 
              loading="lazy"
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </picture>
          
          {/* Optional Gradient Overlay for text if needed */}
          {(ad.title || ad.buttonText) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
              {ad.title && <h3 className="text-white text-xl md:text-2xl font-bold mb-2">{ad.title}</h3>}
              {ad.description && <p className="text-white/80 text-sm md:text-base mb-4 line-clamp-2">{ad.description}</p>}
              {ad.buttonText && (
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium w-fit transition-colors">
                  {ad.buttonText}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResponsiveBanner;
