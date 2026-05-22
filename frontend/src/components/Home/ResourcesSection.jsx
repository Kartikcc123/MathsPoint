import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookMarked, FileText, BookOpen } from 'lucide-react';

const resources = [
  {
    title: 'Reference Books',
    desc: 'Our experts have created thorough study materials that break down complicated concepts into easily understandable content.',
    bgColor: 'bg-[#f0f8ff]',
    icon: <BookMarked className="h-24 w-24 text-blue-500 drop-shadow-md" />,
    href: '/free-study-materials?section=reference-books',
    buttonTone: 'bg-sky-600 hover:bg-sky-700',
  },
  {
    title: 'NCERT Solutions',
    desc: "Unlock academic excellence with Maths Point's NCERT Solutions which provides you step-by-step solutions for thorough understanding.",
    bgColor: 'bg-[#fff8ee]',
    icon: <BookOpen className="h-24 w-24 text-orange-400 drop-shadow-md" />,
    href: '/free-study-materials?section=ncert-solutions',
    buttonTone: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    title: 'Notes',
    desc: "Use Maths Point's detailed study materials that simplify complex ideas into easily understandable language for faster revision.",
    bgColor: 'bg-[#eefcf2]',
    icon: <FileText className="h-24 w-24 text-emerald-500 drop-shadow-md" />,
    href: '/free-study-materials?section=notes',
    buttonTone: 'bg-emerald-600 hover:bg-emerald-700',
  },
];

const ResourcesSection = () => {
  return (
    <section className="border-b border-gray-100 bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="mb-4 text-[32px] font-extrabold tracking-tight text-[#1a202c] md:text-[40px]">
            Study Resources
          </h2>
          <p className="mx-auto max-w-2xl text-[17px] font-medium text-slate-500">
            A diverse array of learning materials to enhance your educational journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {resources.map((resource, idx) => (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`flex h-full flex-col rounded-2xl p-8 transition-transform hover:-translate-y-1 hover:shadow-md ${resource.bgColor}`}
            >
              <h3 className="mb-3 text-2xl font-bold text-slate-800">{resource.title}</h3>
              <p className="mb-8 text-[15px] font-medium leading-relaxed text-slate-600">
                {resource.desc}
              </p>

              <div className="mt-auto flex flex-col items-center justify-center">
                <div className="mb-6 transform transition-transform duration-300 hover:scale-105">
                  {resource.icon}
                </div>

                <Link
                  to={resource.href}
                  className={`inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-bold tracking-wide text-white transition-colors ${resource.buttonTone}`}
                >
                  Explore
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
