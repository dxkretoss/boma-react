import React from 'react';
import { motion } from 'framer-motion';
import { Users, Home, CheckCircle2 } from 'lucide-react';
import SectionLabel from '../components/SectionLabel';
import CTAButton from '../components/CTAButton';

export const JoinPathsSection = () => {
  const pathAFeatures = [
    "Full onboarding questionnaire",
    "Rules-based readiness scoring",
    "Admin-reviewed Pod suggestions",
    "Decline and rematch at any time"
  ];

  const pathBFeatures = [
    "Skip matching — go straight to The Commons",
    "Designed for friends, families & development groups",
    "Works for nonprofits & workforce housing teams",
    "Short per-member verification step"
  ];

  return (
    <section className="bg-white py-12 md:py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <SectionLabel>Two Ways to Join</SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#2E2330] mb-6 leading-tight">
            Whether you have your community or need to find it — BOMA works
          </h2>
          <p className="text-[#7A746B] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Most who come to BOMA are looking for a compatible community to buy with. Some already have their group. We built a path for both.
          </p>
        </div>

        {/* Split Screen Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* PATH A: Matching Pool */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="group relative rounded-3xl overflow-hidden border-2 border-[#2E2330]/15 bg-[#F5F1EA] p-8 sm:p-12 flex flex-col justify-between transition-all duration-500 hover:shadow-2xl hover:border-[#C46A4A]"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#2E2330] text-white flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-[#D7A27A]" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#C46A4A] bg-[#C46A4A]/10 px-3 py-1 rounded-full border border-[#C46A4A]/20">
                  Path A
                </span>
              </div>

              <h3 className="font-serif text-3xl font-bold text-[#2E2330] leading-snug">
                Join the Matching Pool
              </h3>

              <p className="text-[#7A746B] text-sm sm:text-base leading-relaxed">
                Complete the Village Test, get your Readiness Score, and BOMA's matching engine finds a community genuinely aligned with your values, lifestyle, location, and housing vision. You review the suggested Pod before committing — and can decline and re-enter the pool if it's not the right fit.
              </p>

              <div className="space-y-3 pt-2">
                {pathAFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-[#2E2330] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#C46A4A] flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10">
              <CTAButton variant="aubergine" fullWidth size="md">
                Get Started
              </CTAButton>
            </div>
          </motion.div>

          {/* PATH B: Register Existing Pod */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="group relative rounded-3xl overflow-hidden border-2 border-[#B87333]/30 bg-[#E7DED0]/50 p-8 sm:p-12 flex flex-col justify-between transition-all duration-500 hover:shadow-2xl hover:border-[#B87333]"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#B87333] text-white flex items-center justify-center shadow-md">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#B87333] bg-[#B87333]/15 px-3 py-1 rounded-full border border-[#B87333]/30">
                  Path B
                </span>
              </div>

              <h3 className="font-serif text-3xl font-bold text-[#2E2330] leading-snug">
                Register an Existing Pod
              </h3>

              <p className="text-[#7A746B] text-sm sm:text-base leading-relaxed">
                Already have your community? Friends, family, a small development group, or a workforce housing team — if your group is already formed, you can register together and skip matching entirely. A short verification step activates your Pod and takes you straight into The Commons.
              </p>

              <div className="space-y-3 pt-2">
                {pathBFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-[#2E2330] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#B87333] flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10">
              <CTAButton variant="copper" fullWidth size="md">
                Register Your Pod
              </CTAButton>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default JoinPathsSection;
