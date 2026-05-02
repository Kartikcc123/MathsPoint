import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  MonitorSmartphone,
  Rocket,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import heroImage from '../../assets/hero.png';
import storyImage from '../../assets/image.png';
import directorImage from '../../assets/Director.jpeg';

const storyPoints = [
  {
    title: 'Concept-driven teaching',
    description:
      'MathsPoint focuses on clarity first, then speed and accuracy, so students build confidence before they build marks.',
  },
  {
    title: 'Mentorship that stays personal',
    description:
      'Every batch is designed to feel guided, approachable, and accountable, with regular practice and progress tracking.',
  },
];

const missionVision = [
  {
    title: 'Our Mission',
    icon: Target,
    description:
      'To make mathematics simpler, structured, and more rewarding for every learner through disciplined teaching and meaningful support.',
  },
  {
    title: 'Our Vision',
    icon: Rocket,
    description:
      'To become a trusted learning destination where students and families rely on MathsPoint for academic excellence and long-term growth.',
  },
];

const values = [
  {
    title: 'Excellence',
    icon: GraduationCap,
    description: 'We hold every class, test, and interaction to a high academic standard.',
  },
  {
    title: 'Student First',
    icon: HeartHandshake,
    description: 'Teaching decisions are made around what helps learners understand and perform better.',
  },
  {
    title: 'Integrity',
    icon: ShieldCheck,
    description: 'We believe trust is built through honest guidance, consistency, and real outcomes.',
  },
  {
    title: 'Innovation',
    icon: Lightbulb,
    description: 'We combine classroom discipline with digital convenience to create a smoother learning journey.',
  },
];

const timeline = [
  {
    year: '2021',
    title: 'Foundation phase',
    description: 'The institute began with a clear goal: strong mathematics teaching with close student attention.',
  },
  {
    year: '2022',
    title: 'Program expansion',
    description: 'More structured batches, deeper practice support, and better exam-focused planning were introduced.',
  },
  {
    year: '2023',
    title: 'Community growth',
    description: 'The learning community grew through referrals, stronger parent trust, and visible student progress.',
  },
  {
    year: '2024-25',
    title: 'Digital presence',
    description: 'This website became a modern public-facing platform for discovery, communication, and student access.',
  },
];

const websiteHighlights = [
  {
    title: 'Public showcase',
    icon: MonitorSmartphone,
    description: 'Visitors can discover the institute, its programs, faculty strengths, and admission pathways in one place.',
  },
  {
    title: 'Course visibility',
    icon: BookOpen,
    description: 'The website presents academic offerings clearly so parents and students can compare and understand programs faster.',
  },
  {
    title: 'Operational support',
    icon: BriefcaseBusiness,
    description: 'It also supports the institute internally with login-based experiences for students and administrators.',
  },
  {
    title: 'Relationship building',
    icon: Users,
    description: 'The platform helps convert trust into action by making contact, enrollment, and follow-up simpler.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55 },
};

const About = () => {
  return (
    <div className="w-full overflow-hidden bg-white text-slate-800">
      <section className="relative isolate flex min-h-[380px] items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(15,23,42,0.88),rgba(15,23,42,0.55),rgba(2,132,199,0.3))]" />
        <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-20 text-white sm:px-6 lg:px-8"
        >
          <span className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-50">
            About MathsPoint
          </span>
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Built for students. Trusted by families. Designed to make mathematics click.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              This page introduces the client behind the platform and explains how the website supports discovery,
              trust, communication, and structured learning for the MathsPoint community.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-slate-900 transition hover:bg-sky-50"
            >
              Explore Courses <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 font-semibold text-white transition hover:bg-white/15"
            >
              Contact the Institute
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="relative bg-white py-20 sm:py-24">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sky-50 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:px-8">
          <motion.div {...fadeUp} className="space-y-6">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <img src={storyImage} alt="MathsPoint learning environment" className="h-[320px] w-full object-cover sm:h-[420px]" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <p className="text-3xl font-extrabold text-slate-900">1000+</p>
                <p className="mt-2 text-sm font-medium text-slate-600">Learners supported through focused academic guidance.</p>
              </div>
              <div className="rounded-[28px] border border-rose-100 bg-rose-50 p-6">
                <p className="text-3xl font-extrabold text-rose-700">High trust</p>
                <p className="mt-2 text-sm font-medium text-rose-700/80">Parent confidence grows when teaching stays transparent and disciplined.</p>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeUp} className="self-center">
            <span className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Our Story</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              A coaching institute with a practical, modern website presence.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              MathsPoint is presented as a performance-focused academic institute where students receive a stronger
              foundation in mathematics through clear explanation, careful practice, and consistent feedback. The
              website extends that identity online by giving families a reliable first impression and a simple way to
              understand the institute before reaching out.
            </p>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Instead of acting like a basic brochure, the site helps communicate the institute&apos;s values, showcase
              programs, support inquiries, and provide an access point for student-facing workflows. That makes the
              platform valuable both as a brand asset and as part of day-to-day operations.
            </p>

            <div className="mt-8 space-y-4">
              {storyPoints.map((point) => (
                <div key={point.title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">{point.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{point.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Mission & Vision</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">What drives the institute forward</h2>
          </motion.div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {missionVision.map((item) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  {...fadeUp}
                  className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">{item.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Core Values</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">The principles behind every learning experience</h2>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <motion.article
                  key={value.title}
                  {...fadeUp}
                  className="rounded-[28px] border border-slate-200 bg-slate-50 p-7 text-center shadow-sm"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{value.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{value.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Our Journey</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Milestones in the institute and website story</h2>
          </motion.div>

          <div className="relative mx-auto mt-14 max-w-4xl">
            <div className="absolute left-5 top-0 hidden h-full w-px bg-sky-200 md:block" />
            <div className="space-y-8">
              {timeline.map((item) => (
                <motion.div
                  key={item.year}
                  {...fadeUp}
                  className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[64px_minmax(0,1fr)] md:items-start"
                >
                  <div className="flex items-center md:justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900">
                      <span className="h-3 w-3 rounded-full bg-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-700">{item.year}</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_340px] lg:px-8">
          <motion.div {...fadeUp}>
            <span className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">About The Website</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              A digital platform that explains the brand and supports real institute workflows
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              The website is more than a promotional page. It serves as a structured touchpoint where prospective
              students can understand the institute, explore offerings, connect with the team, and continue into the
              right next step. It also prepares the ground for logged-in student and admin experiences already present
              in the project.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {websiteHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.aside
            {...fadeUp}
            className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-900 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
          >
            <img src={directorImage} alt="MathsPoint mentor" className="h-64 w-full object-cover" />
            <div className="space-y-4 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">Client Snapshot</p>
              <h3 className="text-2xl font-bold">MathsPoint</h3>
              <p className="text-sm leading-7 text-slate-300">
                A mathematics-focused education brand that wants its website to communicate trust, clarity, and a
                professional student journey from the first visit onward.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 transition hover:text-sky-200"
              >
                Start a conversation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.aside>
        </div>
      </section>
    </div>
  );
};

export default About;
