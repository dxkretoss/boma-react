import React from 'react';
import { motion } from 'framer-motion';
import SectionLabel from '../components/SectionLabel';
import CTAButton from '../components/CTAButton';
import ReadinessScoreCard from '../components/ReadinessScoreCard';

export const VillageTestSection = () => {
  const points = [
    "Financial readiness check",
    "Values & lifestyle alignment",
    "Governance preferences",
    "Community vision mapping"
  ];

  return (
    <section id="village-test" className="bg-[#2E2330] py-24 md:py-32 text-[#F5F1EA] relative overflow-hidden data-theme='dark'">
      {/* Decorative Metallic Ambient Glow */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#B87333]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C46A4A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Editorial Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:col-span-6 space-y-6"
          >
            <SectionLabel light>Village Test</SectionLabel>
            
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#F5F1EA]">
              Know your readiness before you commit
            </h2>

            <p className="text-[#F5F1EA]/80 text-lg leading-relaxed font-light">
              The Village Test is BOMA's signature onboarding experience. It evaluates your financial situation, lifestyle preferences, governance style, and community values — then produces a Readiness Score that tells you exactly where you stand.
            </p>

            {/* Evaluated Vector Checklist */}
            <div className="grid sm:grid-cols-2 gap-3 py-4">
              {points.map((pt, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#B87333]/30 text-[#D7A27A] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-[#F5F1EA]">{pt}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <CTAButton size="lg" variant="primary">
                Get Started
              </CTAButton>
              <span className="text-xs text-[#F5F1EA]/60 italic">
                Takes 5–10 mins • 100% Free & Private
              </span>
            </div>
          </motion.div>

          {/* Right Readiness Score UI Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-6"
          >
            <ReadinessScoreCard />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default VillageTestSection;
