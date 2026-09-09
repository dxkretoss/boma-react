import React from 'react';
import { motion } from 'framer-motion';
import SectionLabel from '../components/SectionLabel';
import PodConnectionGraphic from '../components/PodConnectionGraphic';
import CTAButton from '../components/CTAButton';

export const PodMatchingSection = () => {
  const points = [
    "AI-powered compatibility matching",
    "Shared financial goals",
    "Lifestyle & values alignment",
    "Admin-reviewed matches"
  ];

  return (
    <section className="bg-[#F5F1EA] py-12 md:py-16 relative overflow-hidden border-t border-[#2E2330]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <SectionLabel>Pod Matching</SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#2E2330] leading-tight mb-6">
            Meet the community you'd actually want to buy with
          </h2>
          <p className="text-[#7A746B] text-lg leading-relaxed font-light">
            BOMA's matching algorithm goes deep — beyond demographics to the real factors that determine whether a co-ownership arrangement works long-term. Your Pod is a small, curated group with aligned goals.
          </p>
        </div>

        {/* Pod Connection Vector Graphic */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <PodConnectionGraphic />
        </motion.div>

        {/* Supporting Points */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {points.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-5 rounded-2xl bg-white border border-[#2E2330]/10 shadow-sm flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-[#C46A4A]/10 text-[#C46A4A] flex items-center justify-center font-bold text-xs flex-shrink-0">
                0{idx + 1}
              </div>
              <span className="text-sm font-semibold text-[#2E2330]">{point}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <CTAButton variant="aubergine" size="md">
            Find Your Pod Matches
          </CTAButton>
        </div>

      </div>
    </section>
  );
};

export default PodMatchingSection;
