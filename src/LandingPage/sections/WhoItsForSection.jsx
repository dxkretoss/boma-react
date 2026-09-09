import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Leaf, Users, Laptop, Palette } from 'lucide-react';
import SectionLabel from '../components/SectionLabel';

import whoFamilies from '../assets/who_families.jpg';
import whoFriends from '../assets/who_friends.jpg';
import whoSingles from '../assets/who_singles.jpg';
import whoIntergenerational from '../assets/who_intergenerational.jpg';
import whoCreatives from '../assets/who_creatives.jpg';

export const WhoItsForSection = () => {
  const [isPaused, setIsPaused] = useState(false);

  const categories = [
    {
      icon: GraduationCap,
      category: "Locked-Out Professionals",
      headline: "You earn enough. You just can't buy alone.",
      description: "Teachers, nurses, social workers, and creatives pool buying power with an aligned community to achieve homeownership.",
      tags: ["Stable income", "Priced out solo", "Wants stability + community"],
      image: whoFamilies
    },
    {
      icon: Leaf,
      category: "Intentional Living Seekers",
      headline: "You want more than a mortgage. You want a way of life.",
      description: "Cohousing, shared land, sustainability, and multi-family living structured with a compatible community that shares your vision.",
      tags: ["Cohousing interest", "Sustainability-focused", "Values-driven living"],
      image: whoFriends
    },
    {
      icon: Users,
      category: "Multi-Generational Families",
      headline: "Family support systems built into where you live.",
      description: "Aging parents, adult siblings, or extended family planning shared compounds and co-owned properties to keep family close.",
      tags: ["Family planning", "Aging-in-place", "Shared land goals"],
      image: whoSingles
    },
    {
      icon: Laptop,
      category: "Remote & Flexible Workers",
      headline: "You're rethinking where — and how — you live.",
      description: "Remote workers seeking land, slower living, and a real sense of belonging without city commutes and isolation.",
      tags: ["Location-flexible", "Seeking community", "Rethinking city life"],
      image: whoIntergenerational
    },
    {
      icon: Palette,
      category: "Alternative & Creative",
      headline: "Your lifestyle is specific. Your community should be too.",
      description: "Artists, musicians, gamers, and creative households finding a community that genuinely shares your world without judgment.",
      tags: ["Alternative lifestyles", "Creative communities", "Values-first matching"],
      image: whoCreatives
    }
  ];

  // Double the items for seamless infinite marquee loop
  const marqueeItems = [...categories, ...categories];

  return (
    <section id="who" className="bg-[#F5F1EA] py-14 md:py-20 relative overflow-hidden border-t border-[#2E2330]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-10 text-center">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto">
          <SectionLabel>Who It's For</SectionLabel>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E2330] mb-4 leading-tight">
            If you can imagine the community, BOMA can help you build it
          </h2>
          <p className="text-[#7A746B] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            BOMA's matching works for any intentional group — conventional or not. You don't have to fit a mold. You just have to know what you value.
          </p>
        </div>
      </div>

      {/* Infinite Marquee Track Container with gradient fade edges */}
      <div 
        className="relative w-full overflow-hidden py-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left & Right Soft Fade Gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#F5F1EA] to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#F5F1EA] to-transparent z-20" />

        {/* Animated Row */}
        <motion.div
          className="flex gap-6 w-max"
          animate={isPaused ? {} : { x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 32,
            repeat: Infinity,
          }}
        >
          {marqueeItems.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={`${cat.category}-${idx}`}
                className="w-[330px] sm:w-[370px] flex-shrink-0 group bg-white rounded-3xl overflow-hidden border border-[#2E2330]/10 shadow-sm hover:shadow-xl hover:border-[#C46A4A]/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Header */}
                <div className="relative h-44 sm:h-48 overflow-hidden bg-[#2E2330]">
                  <img
                    src={cat.image}
                    alt={cat.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#2E2330]/80 via-transparent to-[#2E2330]/40" />

                  {/* Top Badge & Icon */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
                    <div className="p-2 rounded-xl bg-[#2E2330]/85 backdrop-blur-md border border-white/20 text-[#D7A27A] flex-shrink-0 shadow-md">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#D7A27A] bg-[#2E2330]/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 whitespace-nowrap shadow-md">
                      {cat.category}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2E2330] leading-snug mb-2 group-hover:text-[#C46A4A] transition-colors">
                      {cat.headline}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#7A746B] leading-relaxed line-clamp-2 font-sans">
                      {cat.description}
                    </p>
                  </div>

                  {/* Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#2E2330]/10">
                    {cat.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10.5px] font-medium bg-[#F5F1EA] text-[#2E2330] px-2.5 py-0.5 rounded-full border border-[#2E2330]/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Footnote */}
      <div className="text-center max-w-xl mx-auto pt-6 px-6">
        <p className="text-xs text-[#7A746B] font-medium italic">
          "BOMA is built on collaboration, shared agreements, and long-term thinking. It's not the right fit for everyone — and that's intentional."
        </p>
      </div>
    </section>
  );
};

export default WhoItsForSection;
