import React from 'react';
import { Link } from 'react-router-dom';
import mathsPointLogo from '../../assets/logo_transparent.png';

const BrandLogo = ({
  to = '/',
  onClick,
  tagline = 'By Er. Ashish Upadhyay',
  imageClassName = 'h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-md',
  titleClassName = 'font-serif text-xl font-bold tracking-tight sm:text-3xl text-[#1e1b4b]',
  taglineClassName = 'hidden text-[10px] uppercase tracking-[0.28em] text-sky-600/80 sm:block sm:text-[11px] sm:tracking-[0.34em]',
  textClassName = 'min-w-0',
  className = 'flex items-center gap-2.5 sm:gap-3',
}) => {
  return (
    <Link to={to} className={className} onClick={onClick}>
      <img
        src={mathsPointLogo}
        alt="Maths Point Elite Shield"
        loading="lazy"
        decoding="async"
        className={imageClassName}
      />
      <div className={textClassName}>
        <span className={`block truncate ${titleClassName}`}>
          Maths<span className="text-sky-400">Point</span>
        </span>
        {tagline ? <p className={taglineClassName}>{tagline}</p> : null}
      </div>
    </Link>
  );
};

export default BrandLogo;
