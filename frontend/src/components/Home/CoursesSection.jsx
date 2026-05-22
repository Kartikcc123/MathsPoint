import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, GraduationCap, LineChart, Target, BookOpen, School } from 'lucide-react';
import { motion } from 'framer-motion';

const examCategories = [
  {
    title: "Class 5-8th",
    tags: ["Junior Division", "Concept Building", "School Support"],
    path: "/courses?category=class-5-8",
    colorClass: "bg-lime-50",
    icon: <School className="w-12 h-12 text-lime-500 drop-shadow-sm" />
  },
  {
    title: "Class 9th",
    tags: ["CBSE", "ICSE", "State Boards"],
    path: "/courses?category=class-9",
    colorClass: "bg-red-50",
    icon: <Calculator className="w-12 h-12 text-red-400 drop-shadow-sm" />
  },
  {
    title: "Class 10th",
    tags: ["CBSE", "ICSE", "State Boards"],
    path: "/courses?category=class-10",
    colorClass: "bg-amber-50",
    icon: <BookOpen className="w-12 h-12 text-amber-500 drop-shadow-sm" />
  },
  {
    title: "Class 11th",
    tags: ["Core Maths", "Applied Maths"],
    path: "/courses?category=class-11",
    colorClass: "bg-sky-50",
    icon: <LineChart className="w-12 h-12 text-sky-500 drop-shadow-sm" />
  },
  {
    title: "Class 12th",
    tags: ["Core Maths", "Applied Maths", "Boards"],
    path: "/courses?category=class-12",
    colorClass: "bg-indigo-50",
    icon: <GraduationCap className="w-12 h-12 text-indigo-500 drop-shadow-sm" />
  },
  {
    title: "IIT-JEE",
    tags: ["class 11", "class 12", "Dropper"],
    path: "/courses?category=iit-jee",
    colorClass: "bg-orange-50",
    icon: <Target className="w-12 h-12 text-orange-500 drop-shadow-sm" />
  }
];

const CoursesSection = () => {
  return (
    <section id="courses" className="bg-white py-16 md:py-24 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header exact match to screenshot style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 flex flex-col items-center text-center"
        >
          <h2 className="text-[32px] md:text-[40px] font-bold text-slate-900 tracking-tight mb-3">
            Exam Categories
          </h2>
          <p className="text-[15px] md:text-base text-slate-600 max-w-2xl font-medium">
            Maths Point is preparing students for multiple academic benchmarks. Scroll down to find the one you are preparing for
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examCategories.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="relative bg-white rounded-xl border border-gray-200 p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow group h-[240px] cursor-pointer"
            >
              
              {/* Soft right corner curve background */}
              <div 
                className={`absolute top-0 right-0 bottom-0 w-[45%] rounded-l-[100px] ${category.colorClass} opacity-80 translate-x-4 md:translate-x-6 transition-transform group-hover:scale-105`}
              ></div>
              
              {/* Floating icon on the right */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-24 h-24 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>

              {/* Card Content (Left Aligned) */}
              <div className="relative z-10 -mt-1 max-w-[65%]">
                <h3 className="text-xl md:text-[22px] font-bold text-slate-900 mb-5">{category.title}</h3>
                
                {/* Pill Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {category.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-3.5 py-1 box-border bg-white border border-gray-200 rounded-full text-[12px] text-gray-500 font-medium whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Explore Link at Bottom */}
              <div className="relative z-10 mt-auto">
                <Link 
                  to={category.path} 
                  className="inline-flex items-center gap-3 text-[14px] font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Explore Category 
                  <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </span>
                </Link>
              </div>
              
            </motion.div>
          ))}
        </div>

        {/* Bottom Link */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/courses"
            className="text-[15px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-indigo-600 after:border-b after:border-dashed after:border-indigo-600 inline-block px-1"
            style={{ textDecoration: 'none', borderBottom: '1px dashed currentColor' }}
          >
            View All Categories (6)
          </Link>
        </div>

      </div>
    </section>
  );
};

export default CoursesSection;
