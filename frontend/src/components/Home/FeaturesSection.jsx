import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Target, TrendingUp, Ribbon, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: Users,
    iconColor: "text-indigo-600",
    title: "Experienced Faculty",
    description: "Highly experienced mathematics subject experts dedicated to your success.",
  },
  {
    icon: BookOpen,
    iconColor: "text-red-600",
    title: "Comprehensive Study Material",
    description: "Well-researched and regularly updated content covering the entire syllabus.",
  },
  {
    icon: Target,
    iconColor: "text-blue-500",
    title: "Personalized Attention",
    description: "Small batch sizes ensuring individual focus and doubt clearing for every student.",
  },
  {
    icon: TrendingUp,
    iconColor: "text-emerald-500",
    title: "Regular Assessments",
    description: "Weekly tests and All India test series to continuously track and boost progress.",
  },
  {
    icon: Ribbon,
    iconColor: "text-rose-500",
    title: "Proven Results",
    description: "Consistent selections in IITs, NITs, and top board percentiles year after year.",
  },
  {
    icon: CheckCircle2,
    iconColor: "text-amber-500",
    title: "Focused Preparation",
    description: "A speed and accuracy driven approach perfectly tailored for competitive exams.",
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-slate-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Elements */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <div className="bg-[#fff1f2] text-[#9f1239] text-[13px] font-bold px-4 py-1.5 rounded-full mb-5">
            Why Choose Us
          </div>
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#1a202c] tracking-tight mb-4">
            Excellence in Every Aspect
          </h2>
          <p className="text-slate-500 text-[16px] max-w-3xl mx-auto leading-relaxed">
            At Maths Point, we continuously upgrade our teaching methodology to match the latest trends, combining profound mathematical knowledge with smart, exam-oriented strategies.
          </p>
        </motion.div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex flex-col"
              >
                
                {/* Icon Block */}
                <div className="w-14 h-14 bg-slate-100 rounded-[12px] flex items-center justify-center mb-6">
                  <IconComponent className={`w-6 h-6 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-[14px] text-slate-500 leading-relaxed font-medium">
                  {feature.description}
                </p>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
