import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Menu, X, ChevronDown, ChevronRight, LayoutGrid } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { livePrograms } from '../../data/livePrograms';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/courses', label: 'Programs' },
  { href: '/faculties', label: 'Faculties' },
  { href: '/contact', label: 'Contact' },
];

const categoryDescriptions = {
  Academic: 'School academics and stream-focused preparation',
  'Competitive Exams': 'Olympiad, scholarship, and entrance preparation',
  Professional: 'Professional-entry and commerce-oriented support',
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const exploreRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const closeTimerRef = useRef(null);

  const groupedPrograms = useMemo(() => {
    return livePrograms.reduce((accumulator, program) => {
      if (!accumulator[program.category]) {
        accumulator[program.category] = [];
      }

      accumulator[program.category].push(program);
      return accumulator;
    }, {});
  }, []);

  const categories = useMemo(() => Object.keys(groupedPrograms), [groupedPrograms]);
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'Academic');

  const toggleMenu = () => setIsOpen((current) => !current);
  const toggleExplore = () => setIsExploreOpen((current) => !current);
  const closeMenu = () => {
    setIsOpen(false);
    setIsExploreOpen(false);
  };

  useEffect(() => {
    if (!categories.includes(activeCategory) && categories.length) {
      setActiveCategory(categories[0]);
    }
  }, [activeCategory, categories]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If click is outside both the desktop explore dropdown and the mobile menu area, close explore
      const clickedInsideExplore = exploreRef.current && exploreRef.current.contains(event.target);
      const clickedInsideMobileMenu = mobileMenuRef.current && mobileMenuRef.current.contains(event.target);
      if (!clickedInsideExplore && !clickedInsideMobileMenu) {
        setIsExploreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const activePrograms = groupedPrograms[activeCategory] || [];

  const openExplore = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsExploreOpen(true);
  };

  const scheduleExploreClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setIsExploreOpen(false);
    }, 180);
  };

  const handleProgramNavigate = (programTitle) => {
    setIsExploreOpen(false);
    setIsOpen(false);
    navigate(`/courses?program=${encodeURIComponent(programTitle)}`);
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white font-sans shadow-sm">
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">

          {/* Logo and Explore Dropdown */}
          <div className="flex items-center gap-6">
            <BrandLogo
              onClick={closeMenu}
              className="flex items-center gap-2"
              taglineClassName="hidden text-[10px] uppercase tracking-[0.28em] text-slate-500 sm:block sm:text-[11px]"
              titleClassName="font-serif text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl"
            />

            <div className="hidden md:block h-8 w-px bg-slate-200 mx-2"></div>

            <div
              ref={exploreRef}
              className="relative hidden md:block"
              onMouseEnter={openExplore}
              onMouseLeave={scheduleExploreClose}
            >
              <button
                type="button"
                onClick={toggleExplore}
                className={`flex items-center whitespace-nowrap gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  isExploreOpen
                    ? 'border-sky-300 bg-sky-100 text-sky-800'
                    : 'border-sky-200 bg-sky-50/50 text-sky-700 hover:border-sky-300 hover:bg-sky-100'
                }`}
                aria-expanded={isExploreOpen}
                aria-haspopup="true"
              >
                <LayoutGrid className="h-4 w-4" />
                Explore Courses
                <ChevronDown className={`h-4 w-4 text-sky-600/70 transition-transform ${isExploreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExploreOpen && (
                <div className="absolute left-0 top-full z-50 w-[min(960px,calc(100vw-48px))] pt-[14px]">
                  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_36px_90px_-32px_rgba(15,23,42,0.36)]">
                    <div className="grid min-h-[420px] grid-cols-[300px_minmax(0,1fr)]">
                    <div className="border-r border-slate-200 bg-slate-50/80 p-4">
                      <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">All Course Groups</p>
                      <div className="space-y-2">
                        {categories.map((category) => {
                          const isActive = activeCategory === category;
                          return (
                            <button
                              key={category}
                              type="button"
                              onMouseEnter={() => setActiveCategory(category)}
                              onFocus={() => setActiveCategory(category)}
                              onClick={() => setActiveCategory(category)}
                              className={`flex w-full items-start justify-between rounded-2xl px-4 py-4 text-left transition ${
                                isActive ? 'bg-white shadow-sm' : 'hover:bg-white/70'
                              }`}
                            >
                              <div>
                                <p className={`text-base font-bold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>{category}</p>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                  {categoryDescriptions[category] || 'Explore available programs'}
                                </p>
                              </div>
                              <ChevronRight className={`mt-1 h-4 w-4 shrink-0 ${isActive ? 'text-sky-700' : 'text-slate-400'}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Live Programs</p>
                          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{activeCategory}</h3>
                        </div>
                        <Link
                          to="/courses"
                          onClick={() => setIsExploreOpen(false)}
                          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
                        >
                          View Full Courses
                        </Link>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {activePrograms.map((program) => {
                          const Icon = program.icon;
                          return (
                            <button
                              key={program.id}
                              type="button"
                              onClick={() => handleProgramNavigate(program.title)}
                              className="group rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                                  <Icon className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-lg font-bold text-slate-900 transition group-hover:text-sky-700">{program.title}</h4>
                                  <p className="mt-1 text-sm font-medium text-slate-500">{program.audience}</p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {program.highlights.slice(0, 3).map((item) => (
                                      <span
                                        key={item}
                                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                                      >
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex flex-1 items-center justify-end gap-3 xl:gap-7 pl-4 xl:pl-6">
            <div className="flex items-center gap-4 xl:gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="whitespace-nowrap text-[15px] font-semibold text-slate-600 transition hover:text-sky-600"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Auth/Profile Section */}
            <div className="ml-4 flex items-center pl-6">
              {user && user.role !== 'admin' ? (
                <div className="flex shrink-0 items-center gap-4">
                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                    className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[14px] font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-slate-50"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-sky-600 text-xs font-bold text-white shadow-inner">
                      {user.name?.charAt(0)}
                    </div>
                    <span>{user.name.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="rounded-lg bg-slate-100 px-5 py-2.5 text-[14px] font-bold text-slate-600 transition hover:bg-slate-200 hover:text-slate-800"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="shrink-0 rounded-lg bg-gradient-to-r from-sky-600 to-sky-600 px-6 py-2.5 text-[15px] font-bold text-white shadow-sm shadow-sky-500/20 transition hover:scale-[1.02] hover:shadow-md hover:shadow-sky-500/30"
                >
                  Login / Signup
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="-mr-2 flex lg:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-7 w-7 text-slate-600" /> : <Menu className="h-7 w-7 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div ref={mobileMenuRef} className="border-t border-slate-200 bg-white p-4 shadow-2xl lg:hidden">
          <div className="space-y-1">
            <button
              type="button"
              onClick={toggleExplore}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3.5 text-sm font-bold text-sky-700 hover:bg-sky-100"
            >
              <LayoutGrid className="h-4 w-4" />
              Explore Courses
              <ChevronDown className={`h-4 w-4 opacity-70 transition-transform ${isExploreOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExploreOpen && (
              <div className="mb-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                        activeCategory === category
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {activePrograms.map((program) => {
                    const Icon = program.icon;
                    return (
                      <button
                        key={program.id}
                        type="button"
                        onClick={() => handleProgramNavigate(program.title)}
                        className="block w-full rounded-2xl border border-slate-200 bg-white p-4 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{program.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{program.audience}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3.5 text-base font-bold text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-colors"
              >
                {link.label}
              </a>
            ))}

              {user && user.role !== 'admin' ? (
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-5">
                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-bold text-slate-700 hover:bg-slate-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-sky-600 text-sm font-extrabold text-white">
                    {user.name?.charAt(0)}
                  </div>
                  <span className="truncate">{user.name}</span>
                </Link>
                <button onClick={() => { closeMenu(); logout(); navigate('/'); }} className="block w-full rounded-xl bg-slate-100 px-4 py-3.5 text-center text-base font-bold text-slate-700 hover:bg-slate-200">
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="mt-5 block w-full rounded-xl bg-gradient-to-r from-sky-600 to-sky-600 px-4 py-3.5 text-center text-base font-bold text-white shadow-sm hover:opacity-90"
              >
                Login / Signup
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
