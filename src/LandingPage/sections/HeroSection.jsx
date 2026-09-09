import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, HeartHandshake, TrendingUp } from 'lucide-react';
import CTAButton from '../components/CTAButton';
import { floatingAnimation, pulseGlow } from '../utils/animationUtils';

import heroBg from '../assets/hero_bg.jpg';
import avatarAmara from '../assets/avatar_amara.jpg';
import avatarDavid from '../assets/avatar_david.jpg';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#2E2330] text-[#F5F1EA] pt-28 pb-20 lg:pt-36 lg:pb-28 data-theme='dark'">

      {/* 1. Cinematic Architectural Photography Background with Multilayer Gradients */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          src={heroBg}
          alt="BOMA Living Modern Architectural Community"
          className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.1]"
        />

        {/* Dynamic Glowing Ambient Light Orbs */}
        <motion.div
          variants={pulseGlow}
          initial="initial"
          animate="animate"
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-radial from-[#B87333]/25 via-[#C46A4A]/10 to-transparent blur-3xl pointer-events-none"
        />
        <motion.div
          variants={pulseGlow}
          initial="initial"
          animate="animate"
          className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-radial from-[#C46A4A]/20 via-[#B87333]/10 to-transparent blur-3xl pointer-events-none"
        />

        {/* Multilayer Luxury Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E2330]/95 via-[#2E2330]/80 to-[#2E2330]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E2330] via-transparent to-[#2E2330]/40" />
        <div className="absolute inset-0 bg-grain-dark opacity-30 pointer-events-none" />
      </div>

      {/* 2. Main Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* LEFT COLUMN: Editorial Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-8">

            {/* Live Status Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="inline-flex items-center gap-2.5 bg-[#F5F1EA]/10 backdrop-blur-md border border-[#F5F1EA]/20 rounded-full px-4 py-2"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B87333] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#B87333]"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#F5F1EA]/90">
                A new way to own a home
              </span>
              {/* <span className="w-px h-3.5 bg-[#F5F1EA]/20" /> */}
              {/* <span className="text-xs text-[#D7A27A] font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3" /> King County, WA
              </span> */}
            </motion.div>

            {/* Sequential Kinetic Word-Reveal Headline */}
            <div className="space-y-2">
              <motion.h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.03] text-[#F5F1EA] tracking-tight">
                <motion.span
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="inline-block mr-4"
                >
                  Own
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="inline-block mr-4"
                >
                  a
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="inline-block mr-4"
                >
                  home
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="inline-block mr-4 text-[#C46A4A] italic font-normal drop-shadow-[0_2px_15px_rgba(196,106,74,0.3)]"
                >
                  Not
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="inline-block mr-4 text-[#C46A4A] italic font-normal drop-shadow-[0_2px_15px_rgba(196,106,74,0.3)]"
                >
                  alone
                </motion.span>
              </motion.h1>
            </div>

            {/* Subhead Narrative */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-[#F5F1EA]/85 text-lg sm:text-xl leading-relaxed max-w-xl font-light"
            >
              BOMA matches you with an aligned community, structures your shared ownership, and guides your Pod from first conversation to keys in hand.
            </motion.p>

            {/* Primary & Secondary Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <CTAButton size="lg" variant="primary">
                Get Started
              </CTAButton>
              <CTAButton size="lg" variant="outlineLight" href="#how-it-works">
                See How It Works
              </CTAButton>
            </motion.div>

            {/* Pilot Launch Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="pt-4"
            >
              <div className="inline-flex items-center gap-2 bg-[#F5F1EA]/10 backdrop-blur-md border border-[#F5F1EA]/20 rounded-full px-5 py-2.5 text-xs font-semibold text-[#F5F1EA] shadow-lg">
                <MapPin className="w-4 h-4 text-[#B87333]" />
                <span className="text-[#D7A27A]">
                  Pilot launching in <strong className="text-white font-bold">King County, WA</strong>
                </span>
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Interactive 3D/Glassmorphic Pod Preview Card & Stats */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            <motion.div
              variants={floatingAnimation}
              initial="initial"
              animate="animate"
              className="w-full max-w-md bg-[#1A141C]/80 backdrop-blur-xl rounded-3xl p-6 border border-[#F5F1EA]/15 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#B87333]/20 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F5F1EA]/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img
                      src={avatarAmara}
                      alt="Amara S."
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-[#2E2330] object-cover"
                    />
                    <img
                      src={avatarDavid}
                      alt="David K."
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-[#2E2330] object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F5F1EA]">Verified Pod #WA-042</h4>
                    <p className="text-[10px] text-[#D7A27A]">Redmond / Bellevue Sector</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-[#C46A4A]/20 text-[#C46A4A] px-2.5 py-1 rounded-full border border-[#C46A4A]/30">
                  Forming
                </span>
              </div>

              {/* Central Compatibility Ring Dial */}
              <div className="flex items-center gap-5 bg-[#2E2330]/60 p-4 rounded-2xl border border-[#F5F1EA]/10">
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/10"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#C46A4A]"
                      strokeDasharray="94, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute font-serif text-sm font-bold text-white">94%</span>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#B87333]" />
                    High Compatibility Match
                  </h5>
                  <p className="text-[11px] text-white/70 leading-normal mt-0.5">
                    Shared values, financial assessment & 4-unit housing vision aligned.
                  </p>
                </div>
              </div>

              {/* Pod Member Nodes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarAmara}
                      alt="Amara S."
                      className="w-8 h-8 rounded-full object-cover border border-[#C46A4A]/50 flex-shrink-0"
                    />
                    <div>
                      <span className="font-semibold text-white block leading-none">Amara S.</span>
                      <span className="text-[10px] text-white/60">Architect • Redmond</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#D7A27A] font-bold">96% Fit</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarDavid}
                      alt="David K."
                      className="w-8 h-8 rounded-full object-cover border border-[#B87333]/50 flex-shrink-0"
                    />
                    <div>
                      <span className="font-semibold text-white block leading-none">David K.</span>
                      <span className="text-[10px] text-white/60">Healthcare • Seattle</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#D7A27A] font-bold">92% Fit</span>
                </div>
              </div>

              {/* Bottom Target Indicator */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-white/70 border-t border-white/10">
                <span className="flex items-center gap-1 text-[#D7A27A] font-medium">
                  <HeartHandshake className="w-3.5 h-3.5" /> Shared Ownership Ready
                </span>
                <span className="font-bold text-white">Target: 4-Plex Compound</span>
              </div>
            </motion.div>

            {/* Live Trust Metrics Bar (Moved to Bottom Right) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="pt-5 mt-4 w-full max-w-md border-t border-[#F5F1EA]/15 grid grid-cols-3 gap-4 text-xs text-center"
            >
              <div>
                <span className="block font-serif text-2xl font-bold text-[#F5F1EA]">840+</span>
                <span className="text-[#F5F1EA]/60 font-medium">Village Test Takers</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold text-[#D7A27A]">94%</span>
                <span className="text-[#F5F1EA]/60 font-medium">Pod Alignment</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold text-[#C46A4A]">Phase 1</span>
                <span className="text-[#F5F1EA]/60 font-medium">King County Pilot</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F5F1EA] to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
