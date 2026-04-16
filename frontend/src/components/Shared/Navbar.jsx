import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';
import BrandLogo from './BrandLogo';

const navLinks = [
  { href: '/#hero', label: 'Home' },
  { href: '/#about', label: 'About' },
  { href: '/#courses', label: 'Courses' },
  { href: '/#faculties', label: 'Faculties' },
  { href: '/#contact', label: 'Contact' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen((current) => !current);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-amber-300/10 bg-zinc-950/90 text-white font-sans backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(234,179,8,0.18),transparent_35%)]"></div>
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          <div className="flex items-center">
            <BrandLogo onClick={closeMenu} />
          </div>

          <div className="hidden md:flex lg:hidden flex-1 items-center justify-end gap-3 pl-6">
            <div className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-full border border-amber-300/10 bg-white/5 px-2 py-1.5 shadow-lg shadow-black/30">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium text-stone-100/85 transition hover:bg-white/10 hover:text-amber-300"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {user ? (
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                  className="flex items-center gap-2 rounded-full border border-amber-300/10 bg-white/5 px-3 py-2 text-sm font-medium text-stone-100/85 hover:bg-white/10"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-zinc-950 font-semibold">
                    {user.name?.charAt(0)}
                  </div>
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-2 text-sm font-semibold text-zinc-950"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="shrink-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/20"
              >
                Login
              </Link>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="ml-6 flex items-center gap-2 rounded-full border border-amber-300/10 bg-white/5 px-3 py-2 shadow-lg shadow-black/30 xl:ml-10">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-stone-100/85 transition hover:bg-white/10 hover:text-amber-300"
                >
                  {link.label}
                </a>
              ))}
              {user ? (
                <div className="ml-2 flex items-center gap-3">
                  <Link to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-stone-100/85 hover:bg-white/10">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-amber-500 text-zinc-950 font-semibold">{user.name?.charAt(0)}</div>
                    <span className="hidden xl:inline">{user.name}</span>
                  </Link>
                  <button onClick={() => { logout(); navigate('/'); }} className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950">Logout</button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="ml-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 px-6 py-2.5 font-semibold text-zinc-950 transition hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/20"
                >
                  Login and Signup
                </Link>
              )}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-xl border border-amber-300/10 bg-white/5 p-2.5 text-stone-300 hover:bg-zinc-800/60 hover:text-white focus:outline-none"
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="relative mx-3 mb-3 rounded-3xl border border-amber-300/10 bg-zinc-900/95 p-3 shadow-2xl shadow-black/40 sm:mx-4 sm:mb-4 md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="block rounded-2xl px-4 py-3 text-base font-medium text-stone-100/90 hover:bg-white/8 hover:text-amber-200"
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} onClick={closeMenu} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium text-stone-100/90 hover:bg-white/8 hover:text-amber-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold text-zinc-950">
                    {user.name?.charAt(0)}
                  </div>
                  <span className="truncate">{user.name}</span>
                </Link>
                <button onClick={() => { closeMenu(); logout(); navigate('/'); }} className="block w-full rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-3 text-base font-semibold text-zinc-950">
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="mt-3 block rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 px-4 py-3 text-center text-base font-semibold text-zinc-950 shadow-lg shadow-amber-950/20"
              >
                Login and Signup
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
