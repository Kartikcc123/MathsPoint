import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { livePrograms } from '../../data/livePrograms';

const ContactSection = () => {
  const featuredPrograms = livePrograms.slice(0, 4);

  return (
    <section id="contact" className="relative overflow-hidden py-24 md:py-32">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2070&auto=format&fit=crop')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030b26]/95 via-[#0f1538]/90 to-[#590e18]/85" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[36px] border border-white/10 bg-white/8 p-6 shadow-[0_28px_80px_-28px_rgba(15,23,42,0.8)] backdrop-blur-md sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Live Courses</p>
              <h2 className="mt-4 text-[32px] font-extrabold leading-tight tracking-tight text-white md:text-[44px] lg:text-[52px]">
                Programs students are joining right now
              </h2>
              <p className="mt-5 max-w-2xl text-[16px] font-medium leading-relaxed text-slate-200 md:text-[18px]">
                From Junior Division academics to Olympiads, CUET, CLAT, IPMAT, Bank, SSC, and CA Foundation,
                Maths Point supports both school learning and competitive goals through a card-based, easy-to-browse format.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#9f1239] px-8 py-3.5 font-bold text-white transition-all hover:bg-[#880d30]"
                >
                  Enquire For Admission <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="tel:+919413669776"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/8 px-8 py-3.5 font-bold text-white transition-all hover:bg-white/12"
                >
                  <Phone className="w-4 h-4 text-slate-200" /> Call Us Now
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {featuredPrograms.map((program, index) => {
                const Icon = program.icon;
                return (
                  <motion.article
                    key={program.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="rounded-[28px] border border-white/12 bg-white/10 p-5 text-white shadow-lg backdrop-blur-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14 text-sky-100">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200/85">
                      {program.category}
                    </p>
                    <h3 className="mt-2 text-lg font-bold leading-snug">{program.title}</h3>
                    <p className="mt-2 text-sm font-medium text-slate-200">{program.audience}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {program.highlights.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold text-slate-100"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
