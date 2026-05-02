import React from 'react';
import HeroSection from '../../components/Home/HeroSection';
import AboutSection from '../../components/Home/AboutSection';
import CoursesSection from '../../components/Home/CoursesSection';
import FacultiesSection from '../../components/Home/FacultiesSection';
import ResultsSection from '../../components/Home/ResultsSection';
import ResourcesSection from '../../components/Home/ResourcesSection';
import TestimonialsSection from '../../components/Home/TestimonialsSection';
import AppHighlightSection from '../../components/Home/AppHighlightSection';
import ContactSection from '../../components/Home/ContactSection';

const Home = () => {
  return (
    <div className="w-full text-gray-800">
      <HeroSection />
      <AboutSection />
      <CoursesSection />
      <FacultiesSection />
      <ResultsSection />
      <ResourcesSection />
      <TestimonialsSection />
      <AppHighlightSection />
      <ContactSection />
    </div>
  );
};

export default Home;
