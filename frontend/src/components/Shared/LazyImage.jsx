import React, { useEffect, useRef, useState } from 'react';

// LazyImage: IntersectionObserver-based lazy loader with blur-up placeholder
// Props:
// - src, srcSet, sizes, alt, className, placeholder (low-res), width, height
const LazyImage = ({
  src,
  srcSet,
  sizes,
  alt = '',
  className = '',
  placeholder,
  width,
  height,
  style,
  ariaHidden = false,
  onLoad,
}) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (visible) return;
    if (!containerRef.current) return;

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              setVisible(true);
              obs.disconnect();
            }
          });
        },
        { rootMargin: '200px' }
      );
      obs.observe(containerRef.current);
      return () => obs.disconnect();
    }

    // Fallback: mark visible
    setVisible(true);
  }, [visible]);

  const handleLoad = (e) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  // Inline styles to support blur-up placeholder
  const placeholderStyle = placeholder
    ? {
        backgroundImage: `url(${placeholder})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <span
      ref={containerRef}
      aria-hidden={ariaHidden}
      style={{ display: 'inline-block', position: 'relative', overflow: 'hidden', width: width ? width : undefined, height: height ? height : undefined, ...style }}
      className={`lazy-image-wrapper ${className}`}
    >
      {placeholder && (
        <span
          aria-hidden
          className="lazy-image-placeholder"
          style={{
            position: 'absolute',
            inset: 0,
            transition: 'opacity 400ms ease',
            opacity: loaded ? 0 : 1,
            filter: 'blur(12px) saturate(0.95)',
            transform: 'scale(1.02)',
            backgroundRepeat: 'no-repeat',
            ...placeholderStyle,
            zIndex: 0,
          }}
        />
      )}

      {visible && (
        <img
          ref={imgRef}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          decoding="async"
          loading="eager"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'opacity 360ms ease, transform 360ms ease',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateZ(0) scale(1)' : 'scale(1.01)',
            zIndex: 1,
          }}
        />
      )}

      <style>{`
        .lazy-image-wrapper img { display: block; }
      `}</style>
    </span>
  );
};

export default LazyImage;
