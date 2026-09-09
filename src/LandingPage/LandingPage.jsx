import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Header from './components/Header';
import Footer from './sections/Footer';
import HeroSection from './sections/HeroSection';
import ProblemSection from './sections/ProblemSection';
import FounderQuote from './sections/FounderQuote';
import HowItWorksSection from './sections/HowItWorksSection';
import VillageTestSection from './sections/VillageTestSection';
import PodMatchingSection from './sections/PodMatchingSection';
import CommonsSection from './sections/CommonsSection';
import JoinPathsSection from './sections/JoinPathsSection';
import WhoItsForSection from './sections/WhoItsForSection';
import ArchitectureShowcase from './sections/ArchitectureShowcase';
import FirstStepCTA from './sections/FirstStepCTA';
import WaitlistSection from './sections/WaitlistSection';
import FAQSection from './sections/FAQSection';
import FinalCTASection from './sections/FinalCTASection';
import { LandingAuthProvider } from './context/LandingAuthContext';

export default function LandingPage({ openAuthModal, setActiveScreen, currentUser }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && window.location.hash) {
      const hash = window.location.hash;
      const targetId = hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId) || document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <LandingAuthProvider value={{ openAuthModal, setActiveScreen, currentUser }}>
      <div className="w-full min-h-screen bg-[#F5F1EA] text-[#2E2330] selection:bg-[#C46A4A] selection:text-white flex flex-col justify-between overflow-x-hidden relative">
        {/* Initial Luxury Splash / Loading Screen */}
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}

        {/* Luxury Navigation Header */}
        <Header />

        {/* Main Landing Sections */}
        <main className="flex-1 overflow-x-hidden">
          <HeroSection />
          <ProblemSection />
          <FounderQuote />
          <HowItWorksSection />
          <VillageTestSection />
          <PodMatchingSection />
          <CommonsSection />
          <JoinPathsSection />
          <ArchitectureShowcase />
          <WhoItsForSection />
          <FirstStepCTA />
          <FAQSection />
          {/* <FinalCTASection /> */}
        </main>

        {/* Luxury Brand Footer */}
        <Footer />
      </div>
    </LandingAuthProvider>
  );
}
