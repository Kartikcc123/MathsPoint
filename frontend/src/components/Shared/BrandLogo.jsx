import React from 'react';
import { Link } from 'react-router-dom';
import academicPlusLogo from '../../assets/image.png';

const BrandLogo = ({
  to = '/',
  onClick,
  tagline = 'Focused Learning Hub',
  imageClassName = 'h-11 w-11 sm:h-14 sm:w-14',
  titleClassName = 'font-serif text-xl font-bold tracking-tight sm:text-3xl',
  taglineClassName = 'hidden text-[10px] uppercase tracking-[0.28em] text-amber-100/70 sm:block sm:text-[11px] sm:tracking-[0.34em]',
  textClassName = 'min-w-0',
  className = 'flex items-center gap-2.5 sm:gap-3',
}) => {
  return (
    <Link to={to} className={className} onClick={onClick}>
      <img
        src={academicPlusLogo}
        alt="Academic Plus logo"
        className={`${imageClassName} rounded-xl object-contain`}
      />
      <div className={textClassName}>
        <span className={`block truncate ${titleClassName}`}>
          Academic<span className="text-amber-400">Plus</span>
        </span>
        {tagline ? <p className={taglineClassName}>{tagline}</p> : null}
      </div>
    </Link>
  );
};

export default BrandLogo;
