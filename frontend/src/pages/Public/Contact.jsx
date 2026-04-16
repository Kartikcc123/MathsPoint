import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully! (Dummy Action)');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Get in <span className="text-amber-400">Touch</span></h1>
          <p className="text-gray-400 mb-10 text-lg">Have questions about our courses or admissions? We're here to help. Reach out to us today!</p>
          
          <div className="space-y-6 text-gray-300">
            <div className="flex items-center gap-4 p-4 glass rounded-xl">
              <div className="bg-amber-500/20 p-3 rounded-lg"><Phone className="text-amber-400" /></div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 glass rounded-xl">
              <div className="bg-amber-500/20 p-3 rounded-lg"><Mail className="text-amber-400" /></div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">info@academicplus.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 glass rounded-xl">
              <div className="bg-green-500/20 p-3 rounded-lg"><MapPin className="text-green-400" /></div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">123 Education Hub, Knowledge Park, India</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-8 md:p-10 rounded-3xl relative">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-amber-500/20 blur-2xl rounded-full"></div>
          <h2 className="text-2xl font-bold text-white mb-8">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
              <textarea 
                required
                rows="4"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-105 text-zinc-950 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition">
              Send Message <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
