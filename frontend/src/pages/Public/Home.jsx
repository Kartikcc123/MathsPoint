import React from 'react';
import HeroSection from '../../components/Home/HeroSection';
import AboutSection from '../../components/Home/AboutSection';
import CoursesSection from '../../components/Home/CoursesSection';
import FeaturesSection from '../../components/Home/FeaturesSection';
import FacultiesSection from '../../components/Home/FacultiesSection';
import ResultsSection from '../../components/Home/ResultsSection';
import GallerySection from '../../components/Home/GallerySection';
import TestimonialsSection from '../../components/Home/TestimonialsSection';
import ContactSection from '../../components/Home/ContactSection';

const Home = () => {
  return (
    <div className="w-full text-gray-800">
      <HeroSection />
      <AboutSection />
      <CoursesSection />
      <FeaturesSection />
      <FacultiesSection />
      <ResultsSection />
      <GallerySection />
      <TestimonialsSection />
      <ContactSection />
    </div>
  );
};

export default Home;
