import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Mail } from 'lucide-react';
import SectionLabel from '../components/SectionLabel';

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const questions = [
    {
      q: "What is a Pod?",
      a: "A Pod is a small, aligned group of 2 to 6 individuals or households matched by BOMA who intend to co-own real estate together. Pods are formed based on shared financial goals, lifestyle compatibility, governance preferences, and a unified vision for living."
    },
    {
      q: "Is collaborative homeownership legally sound?",
      a: "Yes. Co-ownership of real estate using legal structures like LLCs, Tenancy-in-Common (TIC), or custom land trusts is a well-established legal path. BOMA provides pre-built legal agreement scaffolding and connects Pods with real estate attorneys to ensure ownership, equity split, exit strategies, and governance are legally binding."
    },
    {
      q: "What happens if I want to leave the Pod?",
      a: "BOMA's legal framework includes explicit exit clauses negotiated and agreed upon before purchase. Options typically include buy-outs by existing Pod members, selling your share to a new pre-approved member via BOMA's matching pool, or scheduled property sales under predefined conditions."
    },
    {
      q: "Do I have to already know my Pod members?",
      a: "No! Path A is specifically designed to match you with compatible co-buyers from our matching pool based on your Village Test results. However, if you already have friends, family, or a group, Path B allows you to register your existing Pod directly."
    },
    {
      q: "Is BOMA a real estate agent or brokerage?",
      a: "BOMA is a community matching, governance, and collaborative ownership platform. We provide the technology, readiness scoring, pod matching, and legal agreement scaffolding. For transactions, financing, and legal closing, BOMA connects Pods with vetted partner real estate agents, attorneys, and specialized lenders."
    },
    {
      q: "What if I'm not sure I'm ready?",
      a: "Taking the Village Test is free and carries zero obligation. It provides a detailed breakdown of your readiness score (Financial, Values, Governance, Lifestyle) so you know exactly what steps to take before committing."
    },
    {
      q: "What kinds of properties can a Pod buy?",
      a: "Pods can buy single-family homes with ADUs, multi-family properties (duplex, triplex, 4-plex), shared acreage/land for cohousing developments, or urban multi-unit condos, depending on the Pod's collective budget and vision."
    }
  ];

  const toggleIndex = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="bg-white py-12 md:py-16 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#2E2330] mb-5 leading-tight">
            Questions you're probably thinking
          </h2>
          <p className="text-[#7A746B] text-base leading-relaxed max-w-xl mx-auto">
            Collaborative homeownership is new territory for most. Here are the honest answers.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {questions.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-[#C46A4A] bg-[#F5F1EA]/60 shadow-md'
                    : 'border-[#2E2330]/10 bg-white hover:border-[#2E2330]/30'
                }`}
              >
                <button
                  onClick={() => toggleIndex(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-base sm:text-lg text-[#2E2330] leading-snug">
                    {item.q}
                  </span>
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? 'bg-[#C46A4A] text-white rotate-180'
                        : 'bg-[#F5F1EA] text-[#2E2330]'
                    }`}
                  >
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-2 text-sm text-[#7A746B] leading-relaxed border-t border-[#C46A4A]/20">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Direct Team Support Contact Box */}
        <div className="mt-14 text-center p-8 bg-[#F5F1EA] rounded-3xl border border-[#2E2330]/10">
          <p className="text-[#2E2330] font-semibold text-sm mb-3">
            Still have questions? We're a real team and we actually respond.
          </p>
          <a
            href="mailto:hello@boma-living.com"
            className="inline-flex items-center gap-2 text-[#C46A4A] font-bold text-sm hover:text-[#2E2330] transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>hello@boma-living.com →</span>
          </a>
        </div>

      </div>
    </section>
  );
};

export default FAQSection;
