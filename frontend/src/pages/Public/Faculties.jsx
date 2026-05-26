import React from 'react';
import { motion } from 'framer-motion';
import { buildSrcSet } from '../../utils/image';
import { Award, BookOpen, BriefcaseBusiness, GraduationCap, Users } from 'lucide-react';
import directorImage from '../../assets/DirectorCutout.png';
import shruutiImg from '../../assets/Shruuti.jpeg';
import akankshaImg from '../../assets/Akanksha.jpeg';
import deepakImg from '../../assets/Deepak.jpeg';
import mansiImg from '../../assets/Mansi.jpeg';
import samdaniImg from '../../assets/Samdani.png';

const director = {
  name: 'Ashish Upadhyay',
  role: 'Director & Senior Faculty',
  expertise: 'B.Tech',
  experience: '12 Years Experience',
  image: directorImage,
  transparentImage: true,
  description:
    'With 12 years of experience and a B.Tech background, Ashish is known for simplifying mathematics through smart techniques, conceptual clarity, and result-oriented teaching for school and competitive exam students.',
  highlights: ['Academic leadership', 'Student-centered approach', 'Result-driven vision'],
};

const teachers = [
  {
    name: 'Deepak Sharma',
    role: 'Physics Expert',
    expertise: 'Physics',
    experience: '10 Years Experience',
    image: deepakImg,
    description: 'Dedicated to making Physics simple, conceptual, and interesting through practical understanding and result-oriented teaching methods.',
    bullets: ['Physics theories', 'Problem-solving', 'Board & competitive preparation'],
  },
  {
    name: 'Akanksha Gautam',
    role: 'Biology Expert',
    expertise: 'Biology',
    experience: '9 Years Experience',
    image: akankshaImg,
    description: 'Specialized in Biology, helping students build strong foundational knowledge and clear medical entrance exams.',
    bullets: ['Biology fundamentals', 'Exam readiness', 'Conceptual depth'],
  },
  {
    name: 'Mansi Acharya',
    role: 'Chemistry Catalyst',
    expertise: 'Chemistry',
    experience: '8 Years Experience',
    image: mansiImg,
    description: 'Expert in unraveling the complexities of Chemistry, simplifying organic and inorganic concepts for a competitive edge.',
    bullets: ['Chemistry mastery', 'Organic & Inorganic', 'Competitive focus'],
  },
  {
    name: 'CA Sudeep Samdani',
    role: 'Accountancy Expert',
    expertise: 'Accountancy (CA)',
    experience: 'Experienced Professional',
    image: samdaniImg,
    imagePosition: 'object-center',
    description: 'Dedicated to building strong fundamentals in Accountancy through practical learning, conceptual clarity, and result-oriented teaching.',
    bullets: ['Accountancy mastery', 'Practical approach', 'CA exam preparation'],
  },
  {
    name: 'Shruti Kharbanda',
    role: 'B.St Coach',
    expertise: 'Business Studies',
    experience: '18 yrs Experience',
    image: shruutiImg,
    imagePosition: 'object-center scale-110',
    description: 'Dedicated to making Business Studies easy, practical, and concept-oriented through interactive and student-friendly teaching methods.',
    bullets: ['Business Studies coaching', 'Concept clarity', 'Practical approach'],
  },
];

const heroFaculty = [
  {
    name: teachers[0]?.name,
    role: teachers[0]?.role,
    image: teachers[0]?.image,
    className:
      'left-[3%] top-[11%] z-10 hidden h-[170px] w-[130px] rotate-[-8deg] md:block lg:h-[205px] lg:w-[158px]',
  },
  {
    name: teachers[1]?.name,
    role: teachers[1]?.role,
    image: teachers[1]?.image,
    className:
      'left-[30%] top-[7%] z-20 h-[210px] w-[160px] rotate-[-3deg] md:h-[290px] md:w-[215px] lg:left-[24%] lg:h-[330px] lg:w-[245px]',
  },
  {
    name: teachers[2]?.name,
    role: teachers[2]?.role,
    image: teachers[2]?.image,
    className:
      'right-[5%] top-[11%] z-10 hidden h-[170px] w-[130px] rotate-[8deg] md:block lg:h-[205px] lg:w-[158px]',
  },
  {
    name: teachers[3]?.name,
    role: teachers[3]?.role,
    image: teachers[3]?.image,
    className:
      'left-[11%] bottom-[6%] z-10 hidden h-[150px] w-[120px] rotate-[-4deg] lg:block',
  }
];

const facultyHeroHighlights = [
  'Class 5-8 to senior secondary mentoring',
  'Concept-first teaching with practice discipline',
  'Guidance across IIT-JEE, boards, and other programs',
];

const facultyHeroStats = [
  { value: '6+', label: 'Faculty mentors' },
  { value: '5th-12th', label: 'Academic coverage' },
  { value: 'IIT-JEE + More', label: 'Program coverage' },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
};

const FacultyCard = ({ faculty, compact = false }) => (
  <motion.article
    {...fadeUp}
    className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm ${
      compact ? 'max-w-sm' : ''
    }`}
  >
    <div className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-5">
      <div
        className={`overflow-hidden rounded-[22px] border border-slate-200 ${
          faculty.transparentImage
            ? 'relative bg-[linear-gradient(180deg,#e0f2fe_0%,#f8fafc_45%,#ffffff_100%)]'
            : 'bg-slate-100'
        }`}
      >
        {faculty.transparentImage ? (
          <div className={`${compact ? 'h-[360px]' : 'h-[320px]'} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_34%)]" />
            <div className="absolute inset-x-10 bottom-0 h-16 rounded-t-[999px] bg-slate-900/8 blur-2xl" />
            <img
              src={faculty.image}
              alt={faculty.name}
              loading="lazy"
              decoding="async"
              className="absolute bottom-0 left-1/2 z-10 h-[112%] max-w-none -translate-x-1/2 object-contain object-bottom"
            />
          </div>
        ) : (
            <img
              src={faculty.image}
              alt={faculty.name}
              loading="lazy"
              decoding="async"
              className={`w-full object-cover ${faculty.imagePosition || 'object-top'} ${compact ? 'h-[280px]' : 'h-[260px]'}`}
            />
        )}
      </div>
    </div>
    <div className="border-t border-slate-100 px-5 pb-6 pt-4">
      <h3 className="text-lg font-bold text-slate-900">{faculty.name}</h3>
      <p className="mt-1 text-sm font-semibold text-rose-700">{faculty.role}</p>
      {faculty.expertise ? (
        <p className="mt-2 text-sm font-medium text-slate-600">{faculty.expertise}</p>
      ) : null}
      <p className="mt-4 text-sm leading-7 text-slate-600">{faculty.description}</p>
      {faculty.experience ? (
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
          <Award className="h-4 w-4 text-sky-700" /> {faculty.experience}
        </div>
      ) : null}
      {faculty.bullets ? (
        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
          {faculty.bullets.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  </motion.article>
);

const Faculties = () => {
  return (
    <div className="w-full bg-white text-slate-800">
      <section className="relative overflow-hidden bg-[#f4efe6]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0))]" />
        <div className="absolute left-[-8%] top-[-14%] h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-[-6%] bottom-[-10%] h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.15),transparent)]" />

        <div className="relative mx-auto grid min-h-[460px] max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative z-20 max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-700 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Faculty Team
            </div>
            <h1 className="mt-5 max-w-xl font-serif text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
              Faculty That Teaches With Structure, Care, and Consistency
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
Learn from experienced mentors dedicated to turning students into confident achievers and future toppers.            </p>

            <div className="mt-8 space-y-3">
              {facultyHeroHighlights.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {facultyHeroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[24px] border border-slate-200/80 bg-white/75 px-4 py-4 shadow-sm backdrop-blur"
                >
                  <p className="text-2xl font-bold text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="relative h-[360px] md:h-[460px] lg:h-[520px]"
          >
            <div className="absolute inset-x-[7%] top-[10%] bottom-[10%] rounded-[40px] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(241,245,249,0.8))] shadow-[0_35px_90px_rgba(15,23,42,0.12)]" />
            <div className="absolute left-[12%] top-[14%] right-[12%] h-[58%] rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(255,255,255,0.65),rgba(251,146,60,0.12))]" />
            <div className="absolute bottom-[11%] left-[18%] right-[18%] h-16 rounded-full bg-slate-900/10 blur-2xl" />
            <div className="absolute right-[3%] top-[18%] hidden rounded-[22px] border border-white/80 bg-white/85 px-4 py-3 text-right shadow-lg backdrop-blur lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Learning Focus</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">Clarity first. Practice next.</p>
            </div>
            <div className="absolute bottom-[14%] left-[1%] hidden rounded-[22px] border border-white/80 bg-slate-900 px-4 py-3 text-white shadow-lg lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Student Outcome</p>
              <p className="mt-2 text-sm font-semibold">Mentored for exams and beyond</p>
            </div>

            {heroFaculty.map((member) => (
              <div
                key={member.name}
                className={`absolute overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] ${member.className}`}
              >
                <img src={member.image} alt={member.name} srcSet={buildSrcSet(member.image)} sizes="(max-width:640px) 200px, (max-width:1024px) 300px, 420px" loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_34%,rgba(15,23,42,0.86)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-sm font-semibold">{member.name}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-sky-100">{member.role}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-slate-50 py-18 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">Director</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Visionary leadership and academic direction focused on disciplined learning and measurable outcomes.
            </p>
          </motion.div>

          <div className="mt-10 flex justify-center">
            <FacultyCard faculty={director} compact />
          </div>
        </div>
      </section>

      <section className="bg-white py-18 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-rose-700 shadow-sm">
              <BookOpen className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">Experienced & Dedicated Teachers</h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Our faculty supports junior classes, school academics, higher secondary programs, IIT-JEE preparation, boards, and other specialized courses with student-focused guidance.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {teachers.map((faculty) => (
              <FacultyCard key={faculty.name} faculty={faculty} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_100%)] p-8 text-center shadow-sm sm:p-10"
          >
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
              <Users className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">A Team That Supports The Whole Journey</h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-slate-600">
              From Class 5-8 foundation learning to IIT-JEE, boards, and other course categories, the Maths Point faculty ecosystem is designed to guide students with clarity, structure, and genuine academic care.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Faculties;
