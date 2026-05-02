import React from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, BriefcaseBusiness, GraduationCap, Users } from 'lucide-react';
import directorImage from '../../assets/Director.jpeg';

const director = {
  name: 'Poochika Soni',
  role: 'Director',
  image: directorImage,
  description:
    'The director leads Maths Point with a strong focus on disciplined academic planning, student-first mentoring, and meaningful long-term results.',
  highlights: ['Academic leadership', 'Student-centered approach', 'Result-driven vision'],
};

const teachers = [
  {
    name: 'Piyush Soni Sir',
    role: 'Senior Faculty',
    expertise: 'Foundation and School Academics',
    experience: '8+ Years Experience',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop',
    description:
      'Known for building strong fundamentals for junior and middle school learners through simple explanation and regular practice.',
    bullets: ['5th-8th support', 'Concept clarity', 'Classroom discipline'],
  },
  {
    name: 'Sujit Singh Rathore Sir',
    role: 'Academic Faculty',
    expertise: 'Secondary and Senior Secondary',
    experience: '10+ Years Experience',
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop',
    description:
      'Supports board-oriented preparation with balanced attention to subject depth, exam readiness, and scoring strategy.',
    bullets: ['9th-10th academics', '11th-12th guidance', 'Board preparation'],
  },
  {
    name: 'Hemendra Singh Sir',
    role: 'Competitive Mentor',
    expertise: 'Scholarship and Entrance Preparation',
    experience: '9+ Years Experience',
    image:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop',
    description:
      'Helps students prepare for olympiads, NTSE, KVPY, and other competitive tracks through focused mentoring and testing.',
    bullets: ['Olympiad foundation', 'NTSE and KVPY', 'Competitive mindset'],
  },
  {
    name: 'Anil Sharma Sir',
    role: 'Commerce and Career Faculty',
    expertise: 'CUET, CLAT, IPMAT, Bank, SSC',
    experience: '7+ Years Experience',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
    description:
      'Guides students toward university and career examinations with structured preparation, aptitude support, and exam strategy.',
    bullets: ['CUET and CLAT', 'IPMAT guidance', 'Bank and SSC prep'],
  },
  {
    name: 'Devendra Sen Sir',
    role: 'Professional Course Mentor',
    expertise: 'CA Foundation',
    experience: '6+ Years Experience',
    image:
      'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=1974&auto=format&fit=crop',
    description:
      'Provides clarity for commerce and professional-entry learners through systematic teaching and strong conceptual grounding.',
    bullets: ['CA Foundation', 'Commerce support', 'Professional readiness'],
  },
  {
    name: 'Rudrakshyam Prajapat Sir',
    role: 'Student Support Faculty',
    expertise: 'Mentoring and Practice Oversight',
    experience: '5+ Years Experience',
    image:
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?q=80&w=1974&auto=format&fit=crop',
    description:
      'Supports students with motivation, practice structure, and follow-up so classroom learning turns into measurable progress.',
    bullets: ['Practice monitoring', 'Motivation support', 'Performance tracking'],
  },
];

const administration = [
  {
    name: 'Rijju Prajapat',
    role: 'Administration',
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1974&auto=format&fit=crop',
    description:
      'Handles institute coordination, communication flow, and administrative support to keep academic operations organized and efficient.',
  },
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
      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-100">
        <img
          src={faculty.image}
          alt={faculty.name}
          className={`w-full object-cover ${compact ? 'h-[280px]' : 'h-[260px]'}`}
        />
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
      <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.75),rgba(14,165,233,0.22))]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 px-4 text-center text-white"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Our Expert Faculty</p>
          <h1 className="mt-4 font-serif text-4xl font-bold md:text-6xl">Meet The Team Behind Maths Point</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
            A dedicated faculty structure with academic leadership, experienced teachers, and administrative support working together for student success.
          </p>
        </motion.div>
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
              Our faculty supports school academics, higher secondary programs, olympiads, scholarship exams, career entrance exams, and professional tracks with student-focused guidance.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {teachers.map((faculty) => (
              <FacultyCard key={faculty.name} faculty={faculty} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-18 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
              <BriefcaseBusiness className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">Administration</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Strong administrative coordination helps the institute maintain communication, scheduling, and operational consistency.
            </p>
          </motion.div>

          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {administration.map((member) => (
              <FacultyCard key={member.name} faculty={member} compact />
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
              From junior academics to competitive exams and professional preparation, the Maths Point faculty ecosystem is designed to guide students with clarity, structure, and genuine academic care.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Faculties;
