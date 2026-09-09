import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import SectionLabel from '../components/SectionLabel';
import CTAButton from '../components/CTAButton';
import whoFriends from '../assets/who_friends.jpg';

export const FirstStepCTA = () => {
  const benefits = [
    "Your collaborative homeownership readiness score",
    "The housing model that suits your lifestyle best",
    "What kind of Pod members you'd match with",
    "Your next steps toward ownership"
  ];

  return (
    <section className="bg-[#2E2330] py-24 md:py-32 text-[#F5F1EA] relative overflow-hidden data-theme='dark'">
      {/* Background Architectural Photo with Deep Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={whoFriends}
          alt="BOMA Living Community Home"
          className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E2330]/95 via-[#2E2330]/90 to-[#2E2330]/80" />
        <div className="absolute inset-0 bg-grain-dark opacity-30 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Narrative */}
          <div className="lg:col-span-7 space-y-8">
            <SectionLabel light>Take the First Step</SectionLabel>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#F5F1EA]"
            >
              Find out where you really stand.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-[#F5F1EA]/80 text-lg leading-relaxed font-light max-w-xl"
            >
              The Village Test takes 5–10 minutes and gives you a personalized Readiness Score — showing how prepared you are to buy collaboratively and what kind of co-ownership community you're most compatible with.
            </motion.p>

            {/* Interactive Benefits Checklist */}
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-[#B87333]/40 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#B87333]/25 text-[#D7A27A] flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#F5F1EA]">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2"
            >
              <CTAButton size="lg" variant="primary">
                Get Started
              </CTAButton>
              <span className="text-xs text-[#F5F1EA]/60 font-medium italic">
                Free to take. No commitment required.
              </span>
            </motion.div>
          </div>

          {/* Right Column Floating Preview Card */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-[#1A141C]/90 backdrop-blur-xl rounded-3xl p-8 border border-white/15 shadow-2xl space-y-6 w-full max-w-sm text-center relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-full bg-[#B87333]/20 border border-[#B87333]/40 text-[#D7A27A] flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D7A27A] font-bold block mb-1">
                  Sample Readiness Report
                </span>
                <h4 className="font-serif text-2xl font-bold text-white">Score: 78 / 100</h4>
                <p className="text-xs text-white/70 mt-1">Pod-Ready Candidate • King County Sector</p>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white/80">Financial Assessment</span>
                  <span className="text-[#C46A4A] font-bold">84%</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white/80">Community Values</span>
                  <span className="text-[#D7A27A] font-bold">92%</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white/80">Governance Fit</span>
                  <span className="text-[#B87333] font-bold">76%</span>
                </div>
              </div>

              <div className="pt-2">
                <CTAButton fullWidth size="sm" variant="copper">
                  Get Your Readiness Score
                </CTAButton>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FirstStepCTA;
