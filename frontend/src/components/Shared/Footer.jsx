import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';
import BrandLogo from './BrandLogo';

const Footer = () => {
  return (
    <footer className="border-t border-amber-300/10 bg-zinc-950 py-12 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 space-y-4 md:col-span-1">
            <BrandLogo
              className="flex items-center gap-3"
              imageClassName="h-14 w-14"
              titleClassName="font-serif text-3xl font-bold tracking-tight text-white"
              taglineClassName="text-[11px] uppercase tracking-[0.34em] text-sky-100/70"
              textClassName=""
            />
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Empowering students to achieve academic excellence through quality education,
              experienced faculties, and modern teaching methodologies.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="transition hover:text-sky-400">About Us</Link></li>
              <li><Link to="/courses" className="transition hover:text-sky-400">Courses</Link></li>
              <li><Link to="/faculties" className="transition hover:text-sky-400">Our Faculties</Link></li>
              <li><Link to="/contact" className="transition hover:text-sky-400">Contact Us</Link></li>
              <li><Link to="/login" className="transition hover:text-sky-400">Student Portal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
                <span className="text-sm">Krishi Mandi Road Near Fumes & Flames Old Majdur Chouraha RK Colony Bhilwara</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-sky-400" />
                <span className="text-sm">+91 9413669776</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-sky-400" />
                <span className="text-sm">jay001amera@gmail.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Follow Us</h3>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/academicplus_/" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-sky-500 hover:text-zinc-950">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/academicplus_/" aria-label="Twitter" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-sky-500 hover:text-zinc-950">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/academicplus_/" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-sky-500 hover:text-zinc-950">
                <FaInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} MathsPoint Institute. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
