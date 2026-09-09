import React from 'react';
import { motion } from 'framer-motion';
import SectionLabel from '../components/SectionLabel';
import CommonsDashboard from '../components/CommonsDashboard';
import CTAButton from '../components/CTAButton';

export const CommonsSection = () => {
  const points = [
    "Group chat & coordination",
    "Shared ownership agreements",
    "Member profiles & roles",
    "Milestone tracking"
  ];

  return (
    <section className="bg-[#2E2330] py-12 md:py-16 text-[#F5F1EA] relative overflow-hidden data-theme='dark'">
      {/* Glow Backdrops */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-[#B87333]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#C46A4A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        
        {/* Section Title */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <SectionLabel light>The Commons</SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold leading-tight text-[#F5F1EA] mb-6">
            Your community hub — from match to move-in
          </h2>
          <p className="text-[#F5F1EA]/80 text-lg leading-relaxed font-light max-w-2xl mx-auto">
            Once your Pod forms, The Commons becomes your shared planning space. Chat, review your co-ownership agreement, track timelines, manage member details, and stay aligned — all in one place.
          </p>
        </div>

        {/* Floating Glassmorphic Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <CommonsDashboard />
        </motion.div>

        {/* Feature Highlights Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {points.map((pt, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-[#B87333]/20 text-[#D7A27A] flex items-center justify-center font-bold text-xs flex-shrink-0">
                ✓
              </div>
              <span className="text-sm font-semibold text-[#F5F1EA]">{pt}</span>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <CTAButton variant="primary" size="lg">
            Explore The Commons Hub
          </CTAButton>
        </div>

      </div>
    </section>
  );
};

export default CommonsSection;
