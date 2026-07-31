import React, { useEffect, useState } from 'react';
import HeroSection from '../../components/Home/HeroSection';
import AboutSection from '../../components/Home/AboutSection';
import CoursesSection from '../../components/Home/CoursesSection';
import FacultiesSection from '../../components/Home/FacultiesSection';
import GallerySection from '../../components/Home/GallerySection';
import ResultsSection from '../../components/Home/ResultsSection';
import ResourcesSection from '../../components/Home/ResourcesSection';
import TestimonialsSection from '../../components/Home/TestimonialsSection';
import AppHighlightSection from '../../components/Home/AppHighlightSection';
import ContactSection from '../../components/Home/ContactSection';
import api from '../../services/api';

const defaultHomeContent = {
  heroAds: [],
  studentSpotlight: {},
  galleryImages: [],
  faculties: [],
};

const Home = () => {
  const [homeContent, setHomeContent] = useState(defaultHomeContent);

  useEffect(() => {
    let active = true;

    const fetchHomeContent = async () => {
      try {
        const res = await api.get('/public/home-content');
        if (active) {
          setHomeContent(res.data || defaultHomeContent);
        }
      } catch (error) {
        if (!active) return;

        if (error?.response?.status === 404) {
          setHomeContent(defaultHomeContent);
          console.warn('Home content endpoint returned 404. Falling back to default home page sections.');
          return;
        }

        console.error('Failed to load home page content', error);
        setHomeContent(defaultHomeContent);
      }
    };

    fetchHomeContent();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full text-gray-800">
      <HeroSection ads={homeContent?.heroAds} />
      <AboutSection studentSpotlight={homeContent?.studentSpotlight} />
      <CoursesSection />
      <GallerySection images={homeContent?.galleryImages} />
      <FacultiesSection facultyItems={homeContent?.faculties} />
      <ResultsSection />
      <ResourcesSection />
      <TestimonialsSection />
      <AppHighlightSection />
      <ContactSection />
    </div>
  );
};

export default Home;
