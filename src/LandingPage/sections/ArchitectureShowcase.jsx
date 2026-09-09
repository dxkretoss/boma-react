import React from 'react';
import { motion } from 'framer-motion';
import heroBg from '../assets/hero_bg.jpg';

export const ArchitectureShowcase = () => {
  return (
    <section className="relative h-[75vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-[#2E2330] text-[#F5F1EA] data-theme='dark'">
      {/* Background Architectural Photo */}
      <motion.div
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        viewport={{ once: true }}
        className="absolute inset-0 z-0"
      >
        <img
          src={heroBg}
          alt="BOMA Living Architectural Modern Residential Community"
          className="w-full h-full object-cover object-center filter brightness-60 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E2330] via-[#2E2330]/40 to-[#2E2330]/60" />
      </motion.div>

      {/* Overlay Typography */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-[#D7A27A] mb-6 bg-[#2E2330]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10"
        >
          Architectural Vision
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          viewport={{ once: true }}
          className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#F5F1EA] leading-[1.1] mb-6"
        >
          Build a home.<br />
          Build a community.<br />
          <span className="text-[#C46A4A] italic font-normal">Build something that lasts.</span>
        </motion.h2>
      </div>
    </section>
  );
};

export default ArchitectureShowcase;
