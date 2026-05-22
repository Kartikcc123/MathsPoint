import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Calculator, GraduationCap, School, Target } from 'lucide-react';

const categoryAds = [
  {
    label: 'Class 5-8',
    title: 'Junior Division Program',
    subtitle: 'Strong concepts for school success',
    description:
      'Concept-building classes for students from Class 5 to 8 with focused support in Maths, Science, English, and Social Science.',
    audience: 'Classes 5 to 8',
    highlights: ['Daily concept practice', 'School subject guidance', 'Confidence-first teaching'],
    cta: '/courses',
    gradient: 'from-amber-100 via-orange-50 to-white',
    accent: 'bg-amber-500',
    icon: School,
  },
  {
    label: 'Class 9',
    title: 'Class 9 Academic Batch',
    subtitle: 'Build the right foundation before board years',
    description:
      'A disciplined academic program for Class 9 students with regular practice, school alignment, and stronger problem-solving habits.',
    audience: 'Class 9',
    highlights: ['Maths and Science focus', 'Weekly progress review', 'Board-ready fundamentals'],
    cta: '/courses?category=class-9',
    gradient: 'from-rose-100 via-white to-rose-50',
    accent: 'bg-rose-500',
    icon: Calculator,
  },
  {
    label: 'Class 10',
    title: 'Class 10 Board Advertisement',
    subtitle: 'Prepare smarter for high-scoring board performance',
    description:
      'Targeted support for Class 10 learners with exam-oriented teaching, revision structure, and subject clarity for board success.',
    audience: 'Class 10',
    highlights: ['Board pattern preparation', 'Revision and test support', 'CBSE and school alignment'],
    cta: '/courses?category=class-10',
    gradient: 'from-sky-100 via-white to-cyan-50',
    accent: 'bg-sky-500',
    icon: BookOpen,
  },
  {
    label: 'Class 12',
    title: 'Class 12 Final Year Batch',
    subtitle: 'Focused preparation for boards and next-step goals',
    description:
      'A result-driven Class 12 program designed for strong board preparation, stream support, and confident final-year execution.',
    audience: 'Class 12',
    highlights: ['Board-focused learning', 'Important chapter strategy', 'Exam finishing support'],
    cta: '/courses?category=class-12',
    gradient: 'from-indigo-100 via-white to-violet-50',
    accent: 'bg-indigo-500',
    icon: GraduationCap,
  },
  {
    label: 'Class 11',
    title: 'Class 11 Stream Support',
    subtitle: 'A strong base for senior secondary learning',
    description:
      'Structured academic support for Class 11 students across major streams with careful attention to concept depth and continuity.',
    audience: 'Class 11',
    highlights: ['Stronger theory foundation', 'Maths stream support', 'Preparation for Class 12 flow'],
    cta: '/courses?category=class-11',
    gradient: 'from-emerald-100 via-white to-teal-50',
    accent: 'bg-emerald-500',
    icon: GraduationCap,
  },
  {
    label: 'IIT-JEE',
    title: 'IIT-JEE Preparation Program',
    subtitle: 'Competitive preparation for engineering aspirants',
    description:
      'Structured IIT-JEE preparation with concept depth, problem-solving discipline, and exam-focused practice for serious aspirants.',
    audience: 'IIT-JEE Aspirants',
    highlights: ['JEE-focused preparation', 'Advanced problem practice', 'Class 11, 12 and dropper support'],
    cta: '/courses?category=iit-jee',
    gradient: 'from-orange-100 via-white to-amber-50',
    accent: 'bg-orange-500',
    icon: Target,
  },
  {
    label: 'Boards',
    title: 'Boards Special Batch',
    subtitle: 'Combined advertisement for Class 10 and Class 12',
    description:
      'Special board-focused guidance for both Class 10 and Class 12 students with revision plans, score-improvement strategy, and exam confidence.',
    audience: 'Class 10 and Class 12',
    highlights: ['Class 10 board support', 'Class 12 board support', 'Revision, tests, and scoring strategy'],
    cta: '/courses?category=boards',
    gradient: 'from-fuchsia-100 via-white to-pink-50',
    accent: 'bg-fuchsia-500',
    icon: BookOpen,
  },
];

const ResultsSection = () => {
  const [activeTab, setActiveTab] = useState(categoryAds[0].label);

  const activeAd =
    categoryAds.find((category) => category.label === activeTab) || categoryAds[0];

  const ActiveIcon = activeAd.icon;

  return (
    <section className="overflow-hidden border-b border-gray-100 bg-white py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="mb-2 text-[32px] font-bold tracking-tight text-[#1a202c] md:text-[38px]">
            Academic Excellence : Results
          </h2>
          <p className="mx-auto max-w-2xl text-[16px] text-slate-500 md:text-[18px]">
            Choose a class category to open its advertisement and explore the learning path offered on the Home page.
          </p>
        </div>

        <div className="mb-8 flex flex-nowrap items-center justify-center gap-3 overflow-x-auto pb-3 scrollbar-hide md:flex-wrap">
          {categoryAds.map((category) => (
            <button
              key={category.label}
              type="button"
              onClick={() => setActiveTab(category.label)}
              className={`shrink-0 rounded-full border px-6 py-2 text-[13px] font-medium leading-none transition-all md:px-7 md:text-[14px] ${
                activeTab === category.label
                  ? 'border-indigo-500 text-indigo-500'
                  : 'border-gray-200 text-slate-600 hover:border-gray-300'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAd.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.3 }}
              className={`grid grid-cols-1 gap-8 bg-gradient-to-br ${activeAd.gradient} p-6 md:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10`}
            >
              <div className="flex flex-col justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-sm">
                    <span className={`h-2.5 w-2.5 rounded-full ${activeAd.accent}`} />
                    {activeAd.audience}
                  </div>
                  <h3 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                    {activeAd.title}
                  </h3>
                  <p className="mt-3 text-lg font-medium text-slate-700">{activeAd.subtitle}</p>
                  <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-600 md:text-base">
                    {activeAd.description}
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    to={activeAd.cta}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Explore Program
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="text-sm text-slate-500">
                    Click another category above to open a different advertisement.
                  </p>
                </div>
              </div>

              <div className="relative flex min-h-[280px] items-stretch">
                <div className="absolute inset-0 rounded-[24px] bg-white/55 backdrop-blur-sm" />
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/60 blur-2xl" />
                <div className="absolute -bottom-10 left-8 h-32 w-32 rounded-full bg-white/60 blur-2xl" />

                <div className="relative z-10 flex w-full flex-col rounded-[24px] border border-white/70 bg-white/80 p-6 shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Advertisement</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{activeAd.label}</p>
                    </div>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${activeAd.accent} text-white shadow-md`}>
                      <ActiveIcon className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {activeAd.highlights.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Best for</p>
                      <p className="mt-2 text-lg font-semibold">{activeAd.audience}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .scrollbar-hide::-webkit-scrollbar { display: none; }
          `,
        }}
      />
    </section>
  );
};

export default ResultsSection;
