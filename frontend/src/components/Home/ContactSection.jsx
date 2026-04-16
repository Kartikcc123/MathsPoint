import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

const ContactSection = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <section id="contact" className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Get In Touch</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">Have questions? Reach out to us or visit our campus.</p>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-12 bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
          
          <div className="w-full lg:w-1/2 p-8 md:p-12">
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Send a Message</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none transition focus:border-transparent focus:ring-2 focus:ring-amber-500" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input type="tel" className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none transition focus:border-transparent focus:ring-2 focus:ring-amber-500" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows="4" className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none transition focus:border-transparent focus:ring-2 focus:ring-amber-500" placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 py-4 font-bold text-zinc-950 transition duration-300 hover:brightness-105">
                Send Message <Send className="w-5 h-5" />
              </button>
              <p className="text-sm text-gray-500">Quick response hours: Monday to Saturday, 8:00 AM to 8:00 PM.</p>
            </form>
          </div>
          
          <div className="w-full lg:w-1/2 bg-zinc-950 text-white p-8 md:p-12 relative flex flex-col justify-center">
            {/* Map Placeholder or direct embed */}
            <h3 className="text-2xl font-serif font-bold mb-8">Contact Information</h3>
            
            <div className="space-y-8 mb-12 relative z-10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                  <MapPin className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-lg font-bold">Location</h4>
                  <p className="text-gray-400 mt-1">123 Education Hub, Knowledge Park<br/>New Delhi, India 110001</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                  <Phone className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-lg font-bold">Call Us</h4>
                  <p className="text-gray-400 mt-1">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                  <Mail className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-lg font-bold">Email Us</h4>
                  <p className="text-gray-400 mt-1">info@academicplus.com</p>
                </div>
              </div>
            </div>

            {/* Faux generic map background for visual styling */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
