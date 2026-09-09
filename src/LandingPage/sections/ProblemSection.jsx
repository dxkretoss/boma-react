import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Wrench, Leaf } from 'lucide-react';
import SectionLabel from '../components/SectionLabel';
import AnimatedCounter from '../components/AnimatedCounter';

export const ProblemSection = () => {
  const stats = [
    { number: "64%", label: "of Americans say homeownership feels out of reach" },
    { number: "1 in 3", label: "adults report feeling seriously lonely or isolated" },
    { number: "$400K+", label: "median home price in most major U.S. cities" }
  ];

  const points = [
    {
      icon: Building2,
      title: "Collaborative ownership isn't new",
      description: "Humans have always shared resources. We just lost the structure for it."
    },
    {
      icon: Wrench,
      title: "What was missing was a system",
      description: "BOMA provides the matching, planning tools, and legal framework to do it right."
    },
    {
      icon: Leaf,
      title: "Community first, transaction second",
      description: "You don't start with a house. You start with your community."
    }
  ];

  return (
    <section className="bg-[#F5F1EA] py-12 md:py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <SectionLabel>The Problem</SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2E2330] leading-[1.1]">
            The housing market was designed for a world that no longer exists.
          </h2>
        </div>

        {/* Statistics Architectural Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-0 mb-20 border border-[#2E2330]/10 rounded-3xl overflow-hidden bg-white shadow-sm">
          {stats.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: idx * 0.15 }}
              viewport={{ once: true }}
              className={`p-8 sm:p-12 ${
                idx < stats.length - 1 ? 'md:border-r border-b md:border-b-0 border-[#2E2330]/10' : ''
              }`}
            >
              <div className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-[#C46A4A] mb-4 leading-none">
                <AnimatedCounter value={item.number} />
              </div>
              <p className="text-[#7A746B] text-base leading-relaxed font-medium">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Community First Dark Aubergine Highlight Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-[#2E2330] text-[#F5F1EA] rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl border border-[#E7DED0]/10 data-theme='dark'"
        >
          {/* Decorative Grid Texture */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#B87333]/15 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-grain-dark opacity-40 pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F1EA] leading-tight mb-6">
                Most of us want community.<br />
                <span className="text-[#D7A27A] italic font-normal">Most of us can't afford to buy alone.</span>
              </h3>
              <p className="text-[#C46A4A] text-xl font-semibold tracking-wide border-l-2 border-[#C46A4A] pl-4">
                BOMA solves both — at once.
              </p>
            </div>

            <div className="space-y-6">
              {points.map((pt, index) => {
                const IconComponent = pt.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    viewport={{ once: true }}
                    className="flex gap-4 items-start p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-[#B87333]/40 transition-colors"
                  >
                    <div className="p-2.5 bg-white/10 rounded-xl flex-shrink-0 text-[#D7A27A]">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#F5F1EA] text-base mb-1">{pt.title}</h4>
                      <p className="text-[#F5F1EA]/70 text-sm leading-relaxed">{pt.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ProblemSection;
