import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Quote, Home, Search, Users, User } from 'lucide-react';
import whoFriends from '../assets/who_friends.jpg';
import Logo from '../components/Logo';
import CTAButton from '../components/CTAButton';

export const FounderQuote = () => {
  return (
    <section className="relative pt-16 pb-0 lg:pt-24 lg:pb-0 overflow-hidden border-y border-[#2E2330]/10">

      {/* FULL-WIDTH SECTION BACKGROUND: Authentic BOMA Co-Ownership Residential Compound */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.08 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          viewport={{ once: true }}
          src={whoFriends}
          alt="BOMA Living Authentic Community Home Compound"
          className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.08]"
        />
        {/* Soft Section Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-[#2E2330]/50 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-grain-dark opacity-30 pointer-events-none" />
      </div>

      {/* SECTION CONTENT CONTAINER: Grid Layout Aligned to Bottom */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end">

          {/* LEFT COLUMN: Compact / Tiny Review Quote Card */}
          <div className="lg:col-span-7 pb-12 lg:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="relative bg-[#F5F1EA]/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 md:p-12 border-2 border-[#2E2330]/15 shadow-2xl text-[#2E2330]"
            >
              {/* Decorative Double Quote Icon */}
              <div className="text-[#C46A4A] mb-4">
                <Quote className="w-10 h-10 opacity-80 rotate-180" />
              </div>

              <div className="space-y-6">
                <blockquote className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#2E2330] leading-snug">
                  "I spent <span className="text-[#C46A4A] italic font-normal">30 years</span> watching people rent who never had to. No one ever handed them a different tool. BOMA is that tool."
                </blockquote>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#2E2330]/15">
                  <div>
                    <h4 className="font-bold text-[#2E2330] text-base font-serif">Hether Morgan</h4>
                    <p className="text-[#7A746B] text-xs font-medium">Founder, BOMA Living — 30 years in rental housing</p>
                  </div>

                  <a
                    href="#how-it-works"
                    className="inline-flex items-center gap-2 text-[#C46A4A] text-xs font-semibold hover:text-[#2E2330] transition-colors group whitespace-nowrap"
                  >
                    <span>The bigger vision</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Floating Smartphone Device Mockup (Taller & Touching Section Bottom) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative w-full max-w-[330px] sm:max-w-[370px] lg:max-w-[390px] translate-y-2 lg:translate-y-4"
            >
              {/* Outer Phone Hardware Shell - Sleek Dark Metallic Frame */}
              <div className="relative bg-[#1A141C] rounded-t-[3rem] rounded-b-none p-3.5 pb-0 shadow-2xl border-4 border-b-0 border-white/20 hover:scale-[1.02] transition-transform duration-500">

                {/* Top Dynamic Island Notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#2E2330]/80" />
                </div>

                {/* Screen Content Container with Increased Height */}
                <div className="rounded-t-[2.4rem] rounded-b-none overflow-hidden bg-[#F5F1EA] pt-10 pb-8 px-5 text-center text-[#2E2330] space-y-5 shadow-inner relative z-10 min-h-[480px] sm:min-h-[530px] flex flex-col justify-between">

                  {/* Top Header Group */}
                  <div className="space-y-4">
                    {/* Logo */}
                    <div className="pt-2 flex justify-center">
                      <Logo variant="dark" useLogo1={true} className="h-9 w-auto" />
                    </div>

                    {/* Headline & Subhead */}
                    <div className="space-y-1.5">
                      <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2E2330] uppercase leading-tight">
                        Own Real Estate.<br />Together.
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-[#B87333] tracking-widest uppercase pt-0.5">
                        Match • Align • Build
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-1">
                      <CTAButton size="md" variant="copper" className="w-full text-xs sm:text-sm font-bold py-3 shadow-md">
                        FIND YOUR POD
                      </CTAButton>
                    </div>
                  </div>

                  {/* Taller Architectural Photo Card */}
                  <div className="rounded-2xl overflow-hidden h-52 sm:h-60 relative shadow-md border border-[#2E2330]/10 flex-1 my-2">
                    <img
                      src={whoFriends}
                      alt="BOMA Living Community Compound"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 text-center">
                      <span className="text-[10px] sm:text-xs font-bold text-[#F5F1EA] tracking-wider uppercase">
                        Co-Housing Community
                      </span>
                    </div>
                  </div>

                  {/* Bottom App Navigation Bar */}
                  <div className="flex justify-around items-center pt-3 border-t border-[#2E2330]/15 text-[#7A746B] text-[11px]">
                    <div className="flex flex-col items-center text-[#C46A4A] font-bold">
                      <Home className="w-4.5 h-4.5 mb-0.5" />
                      <span>Home</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Search className="w-4.5 h-4.5 mb-0.5" />
                      <span>Explore</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Users className="w-4.5 h-4.5 mb-0.5" />
                      <span>Pods</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <User className="w-4.5 h-4.5 mb-0.5" />
                      <span>Profile</span>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

    </section>
  );
};

export default FounderQuote;
