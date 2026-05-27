import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, BookOpen, CreditCard, RefreshCcw, Scale } from 'lucide-react';

const effectiveDate = 'May 27, 2026';

const sections = [
  {
    title: 'Use Of Website',
    icon: BookOpen,
    points: [
      'This website is provided for information, communication, course discovery, student access, and related educational services offered by MathsPoint Institute.',
      'Users agree to use the website lawfully and not misuse forms, login areas, content, or communication channels.',
    ],
  },
  {
    title: 'Admissions And Enrolment',
    icon: BadgeCheck,
    points: [
      'Course admissions, batch availability, timings, fee structures, and institute policies may change from time to time based on academic or operational needs.',
      'Submitting an enquiry or registration request does not guarantee admission until confirmation is provided by the institute.',
    ],
  },
  {
    title: 'Payments And Refunds',
    icon: CreditCard,
    points: [
      'Fees for courses, learning resources, or other institute services must be paid according to the terms communicated during admission or purchase.',
      'Any refund, transfer, or cancellation request will be subject to the institute\'s applicable policies and case-based review.',
    ],
  },
  {
    title: 'Limitation And Responsibility',
    icon: Scale,
    points: [
      'MathsPoint Institute aims to keep information accurate and services reliable, but does not guarantee uninterrupted website availability at all times.',
      'The institute reserves the right to update website content, academic information, and policy pages whenever necessary without prior notice.',
    ],
  },
  {
    title: 'Policy Updates',
    icon: RefreshCcw,
    points: [
      'MathsPoint Institute may revise these terms from time to time to reflect academic, operational, legal, or technology-related changes.',
      'Users are encouraged to review this page periodically. Continued use of the website after updates indicates acceptance of the revised terms.',
    ],
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
};

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#451a03_0%,#7c2d12_46%,#111827_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.18),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-18 sm:px-6 lg:px-8 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-amber-100">
              Terms & Conditions
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">
              Clear terms for using the MathsPoint Institute platform and services
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-stone-200 md:text-lg">
              These Terms and Conditions describe the basic rules, responsibilities, and service
              expectations that apply when you use our website or interact with our courses.
            </p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-amber-100/80">
              Effective Date: {effectiveDate}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#fffaf5] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <motion.article
                  key={section.title}
                  {...fadeUp}
                  className="rounded-[28px] border border-orange-100 bg-white p-7 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">{section.title}</h2>
                  </div>

                  <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                    {section.points.map((point) => (
                      <p key={point}>{point}</p>
                    ))}
                  </div>
                </motion.article>
              );
            })}
          </div>

          <motion.div
            {...fadeUp}
            className="mt-8 rounded-[28px] border border-orange-100 bg-white p-7 shadow-sm"
          >
            <h2 className="text-xl font-extrabold text-slate-900">Intellectual Property</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Website content, branding, academic descriptions, graphics, and learning materials
                presented by MathsPoint Institute should not be copied, republished, or distributed
                without appropriate permission.
              </p>
              <p>
                Continued use of the website after policy updates will be treated as acceptance of
                the revised terms to the extent permitted by applicable rules and institute policy.
              </p>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="mt-8 rounded-[28px] border border-orange-100 bg-slate-900 p-7 text-white shadow-sm"
          >
            <h2 className="text-xl font-extrabold">Questions About These Terms</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <p>
                If you need clarification about admission rules, payment expectations, or website
                usage terms, please reach out to MathsPoint Institute before enrolling or making a purchase.
              </p>
              <p>Email: mathspoint2015@gmail.com</p>
              <p>Phone: +91 97851 38220</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditions;
