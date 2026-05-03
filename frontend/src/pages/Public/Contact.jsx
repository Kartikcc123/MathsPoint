import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { livePrograms } from '../../data/livePrograms';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  program: '',
  message: '',
};

const contactCards = [
  {
    title: 'Visit Us',
    value: 'Krishi Mandi Road Near Fumes & Flames Old Majdur Chouraha RK Colony Bhilwara',
    icon: MapPin,
    accentClass: 'bg-sky-50 text-sky-700',
  },
  {
    title: 'Call Us',
    value: '+91 9413669776',
    icon: Phone,
    accentClass: 'bg-violet-50 text-violet-700',
  },
  {
    title: 'Email Us',
    value: 'jay001amera@gmail.com',
    icon: Mail,
    accentClass: 'bg-amber-50 text-amber-700',
  },
  {
    title: 'Admissions Support',
    value: 'New course inquiries are visible in your admin Manage Students panel.',
    icon: Sparkles,
    accentClass: 'bg-emerald-50 text-emerald-700',
  },
];

const Contact = () => {
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const groupedPrograms = useMemo(() => {
    return livePrograms.reduce((accumulator, program) => {
      if (!accumulator[program.category]) {
        accumulator[program.category] = [];
      }

      accumulator[program.category].push(program);
      return accumulator;
    }, {});
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        program: formData.program.trim(),
        message: formData.message.trim(),
      };

      const response = await api.post('/public/inquiry', payload);
      setSuccess(response.data?.message || 'Inquiry sent successfully.');
      setFormData(initialForm);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Failed to send inquiry.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="w-full bg-white text-slate-800">
      <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.76),rgba(14,165,233,0.24))]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 px-4 text-center text-white"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Contact Us</p>
          <h1 className="mt-4 font-serif text-4xl font-bold md:text-6xl">Admissions & Inquiries</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
            Send an inquiry for any program and it will appear in your admin panel as a new inquiry for follow-up.
          </p>
        </motion.div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {contactCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.accentClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-slate-900">{card.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_minmax(0,1.1fr)]">
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Program Cards</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Live offerings students inquire about</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                These cards are based on the live programs you shared, so parents and students can choose the right area before submitting the form.
              </p>

              <div className="mt-8 space-y-6">
                {Object.entries(groupedPrograms).map(([category, programs]) => (
                  <div key={category}>
                    <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">{category}</h3>
                    <div className="mt-3 grid gap-4">
                      {programs.map((program) => {
                        const Icon = program.icon;
                        return (
                          <div key={program.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
                                <Icon className="h-6 w-6" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-slate-900">{program.title}</h4>
                                <p className="mt-1 text-sm font-semibold text-sky-700">{program.audience}</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">{program.description}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {program.highlights.map((item) => (
                                    <span
                                      key={item}
                                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600"
                                    >
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Send Us A Message</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Create a new inquiry</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Submitted requests are saved to the backend and shown in your admin `Manage Students` page as new inquiries.
              </p>

              {success ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {success}
                </div>
              ) : null}

              {error ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Your Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Phone</label>
                    <input
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="+91 98xxxxxx"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Subject</label>
                    <input
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Admission inquiry"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Program</label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Select a program</option>
                    {livePrograms.map((program) => (
                      <option key={program.id} value={program.title}>
                        {program.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Message</label>
                  <textarea
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="I want details about the course, batch timings, fees, and admission process."
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? 'Sending...' : 'Send Message'} <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
