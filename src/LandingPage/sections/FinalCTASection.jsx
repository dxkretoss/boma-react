import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import CTAButton from '../components/CTAButton';

export const FinalCTASection = () => {
  const headlineWords1 = "Own real estate.".split(" ");
  const headlineWords2 = "Together.".split(" ");

  return (
    <section className="bg-white py-12 md:py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Luxury Architectural Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-[#E7DED0] via-[#F5F1EA] to-[#E7DED0] rounded-3xl p-10 sm:p-16 lg:p-24 border-2 border-[#2E2330]/15 shadow-2xl text-center overflow-hidden"
        >
          {/* Subtle Metallic Glow Background Orbs */}
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#C46A4A]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#B87333]/15 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-grain-dark opacity-10 pointer-events-none" />

          {/* Top Floating Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#2E2330]/5 border border-[#2E2330]/10 rounded-full px-4 py-1.5 mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C46A4A]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2E2330]/80">
              Start Your Path Today
            </span>
          </motion.div>

          {/* Centered Dark BOMA Logo Variant */}
          {/* <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex justify-center mb-8"
          >
            <Logo variant="dark" className="h-12 sm:h-16 md:h-20 w-auto" />
          </motion.div> */}

          {/* Kinetic Word-Reveal Editorial Headline */}
          <div className="mb-6 max-w-4xl mx-auto">
            <motion.h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] text-[#2E2330]">
              {headlineWords1.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.08 }}
                  viewport={{ once: true }}
                  className="inline-block mr-3"
                >
                  {word}
                </motion.span>
              ))}
              <br />
              {headlineWords2.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 + i * 0.08 }}
                  viewport={{ once: true }}
                  className="inline-block text-[#C46A4A] italic font-normal"
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>
          </div>

          {/* Supporting Narrative */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-[#7A746B] text-base sm:text-xl leading-relaxed max-w-md mx-auto font-light mb-10"
          >
            Build the community you've been looking for.
          </motion.p>

          {/* Glowing Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <CTAButton size="lg" variant="primary">
              Get Started
            </CTAButton>
          </motion.div>

          {/* Trust Footnote */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#7A746B] font-semibold"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#B87333]" /> Verified Matching Engine
            </span>
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-[#C46A4A]" /> King County Pilot Active
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2E2330]" /> 100% Free & Private
            </span>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
};

export default FinalCTASection;
