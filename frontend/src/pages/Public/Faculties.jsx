import React from 'react';
import { Award, GraduationCap } from 'lucide-react';

const faculties = [
  { id: 1, name: 'Dr. Vivek Sharma', subject: 'Pharmaceutics', exp: '15+ Years', desc: 'Expert in dosage forms, dispensing systems, and pharmaceutical formulation concepts.' },
  { id: 2, name: 'Mr. Anil Kumar', subject: 'Pharmaceutical Chemistry', exp: '10+ Years', desc: 'Specializes in medicinal chemistry, organic chemistry, and drug structure fundamentals.' },
  { id: 3, name: 'Mrs. Sunita Verma', subject: 'Pharmacology', exp: '12+ Years', desc: 'Known for clear teaching in drug action, therapeutic use, and clinical application.' },
];

const Faculties = () => {
  return (
    <div className="min-h-screen bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Our <span className="text-purple-400">Expert Faculties</span></h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Learn from experienced pharmacy educators who bring clinical relevance, subject mastery, and student-focused mentoring to every class.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {faculties.map((faculty) => (
            <div key={faculty.id} className="glass p-8 rounded-3xl text-center hover:shadow-purple-500/10 transition-shadow">
              <div className="w-32 h-32 rounded-full mx-auto bg-slate-800 border-4 border-slate-700 flex items-center justify-center overflow-hidden mb-6">
                <GraduationCap className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{faculty.name}</h3>
              <p className="text-blue-400 font-medium mb-4">{faculty.subject}</p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4 bg-slate-800/50 py-2 rounded-full w-max mx-auto px-4">
                <Award className="w-4 h-4 text-yellow-500" />
                <span>{faculty.exp} Experience</span>
              </div>
              
              <p className="text-gray-300 text-sm">
                "{faculty.desc}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faculties;
