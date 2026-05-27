import React from 'react';
import { motion } from 'framer-motion';
import { Database, Eye, Lock, Mail, ShieldCheck } from 'lucide-react';

const effectiveDate = 'May 27, 2026';

const sections = [
  {
    title: 'Information We Collect',
    icon: Database,
    points: [
      'We may collect personal information such as your name, phone number, email address, class details, and course preferences when you contact us, register, or use our services.',
      'We may also collect limited technical information such as browser type, device information, and usage activity to improve website performance and user experience.',
    ],
  },
  {
    title: 'How Information Is Shared',
    icon: Eye,
    points: [
      'We do not sell student or parent information. Data may only be shared with trusted service providers when it is necessary to operate admissions, communication, payments, or platform access.',
      'Information may also be disclosed when required by law, to protect institute operations, or to respond to valid regulatory requests.',
    ],
  },
  {
    title: 'How We Use Information',
    icon: ShieldCheck,
    points: [
      'Your information is used to provide academic support, manage registrations, respond to enquiries, process course-related requests, and improve our educational services.',
      'We may use your contact details to share important updates about courses, schedules, admissions, student access, and institute-related communication.',
    ],
  },
  {
    title: 'Data Protection',
    icon: Lock,
    points: [
      'We take reasonable administrative and technical measures to protect your information from unauthorized access, misuse, or disclosure.',
      'While we work to safeguard your data, no internet-based platform can guarantee complete security in every situation.',
    ],
  },
  {
    title: 'Contact And Requests',
    icon: Mail,
    points: [
      'If you would like to update your information, request clarification about data usage, or raise a privacy concern, you can contact MathsPoint Institute directly.',
      'Privacy-related questions can be shared through our official email and contact channels listed on the website.',
    ],
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
};

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#082f49_0%,#0f172a_48%,#172554_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.26),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.2),transparent_26%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-18 sm:px-6 lg:px-8 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-sky-100">
              Privacy Policy
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">
              Respecting student and parent data with clarity and care
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
              This Privacy Policy explains how MathsPoint Institute collects, uses, and protects
              information shared through our website, enquiry forms, and student-facing services.
            </p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-sky-100/80">
              Effective Date: {effectiveDate}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <motion.article
                  key={section.title}
                  {...fadeUp}
                  className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
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
            className="mt-8 rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm"
          >
            <h2 className="text-xl font-extrabold text-slate-900">Third-Party Services</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Some features of our website may use third-party tools, payment services, hosting
                platforms, or analytics services to support operations. These providers may process
                data according to their own policies and legal obligations.
              </p>
              <p>
                By using the website, you acknowledge that such operational services may be required
                to deliver student access, communication, and platform reliability.
              </p>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="mt-8 rounded-[28px] border border-slate-200 bg-slate-900 p-7 text-white shadow-sm"
          >
            <h2 className="text-xl font-extrabold">Contact For Privacy Questions</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <p>
                If you have questions about this policy or want to request an update to your
                personal information, please contact MathsPoint Institute.
              </p>
              <p>
                Email: mathspoint2015@gmail.com
              </p>
              <p>
                Phone: +91 97851 38220
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
