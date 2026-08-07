import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertTriangle, ShieldCheck, Mail, Database } from 'lucide-react';

const effectiveDate = 'August 7, 2026';

const sections = [
  {
    title: 'Data Deletion Request',
    icon: Trash2,
    points: [
      'You have the right to request the deletion of your personal data associated with your MathsPoint Institute account.',
      'Upon receiving a valid request, we will initiate the process to securely remove your data from our active databases.',
    ],
  },
  {
    title: 'What Gets Deleted',
    icon: Database,
    points: [
      'Your personal profile information, including your name, contact details, and account preferences.',
      'Records of your communications with us that are not required to be retained for legal or regulatory reasons.',
    ],
  },
  {
    title: 'What We Retain',
    icon: ShieldCheck,
    points: [
      'We may retain certain information as required by law, such as payment records and academic transcripts.',
      'Data necessary to resolve disputes, enforce our agreements, or protect our legal rights may also be preserved.',
    ],
  },
  {
    title: 'Important Considerations',
    icon: AlertTriangle,
    points: [
      'Account deletion is irreversible. Once processed, you will lose access to purchased courses, materials, and your student history.',
      'Please ensure you have downloaded any necessary certificates or study materials before requesting deletion.',
    ],
  },
  {
    title: 'How to Request Deletion',
    icon: Mail,
    points: [
      'To request account and data deletion, please send an email to our support team from your registered email address.',
      'Please include "Data Deletion Request" in the subject line to help us process your request promptly.',
    ],
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
};

const AccountDeletion = () => {
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
              Account Deletion
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">
              Your Data, Your Control
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
              This page outlines the procedure and implications of requesting the deletion of your account and personal data from MathsPoint Institute.
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
            className="mt-8 rounded-[28px] border border-slate-200 bg-slate-900 p-7 text-white shadow-sm"
          >
            <h2 className="text-xl font-extrabold">Contact For Deletion Requests</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <p>
                To proceed with deleting your account, please contact MathsPoint Institute directly via email. Ensure you write from your registered email address.
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

export default AccountDeletion;
