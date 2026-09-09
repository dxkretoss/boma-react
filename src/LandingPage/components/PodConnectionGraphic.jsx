import React from 'react';
import { motion } from 'framer-motion';
import { Home, Users, Sparkles, HeartHandshake } from 'lucide-react';

import avatarAmara from '../assets/avatar_amara.jpg';
import avatarDavid from '../assets/avatar_david.jpg';
import avatarSarah from '../assets/avatar_sarah.jpg';

export const PodConnectionGraphic = ({ className = "" }) => {
  const nodes = [
    {
      id: 1,
      name: "Amara S.",
      role: "Creative / Remote",
      score: "94% Match",
      avatar: avatarAmara,
      delay: 0
    },
    {
      id: 2,
      name: "David K.",
      role: "Healthcare Worker",
      score: "91% Match",
      avatar: avatarDavid,
      delay: 0.2
    },
    {
      id: 3,
      name: "Elena & Marcus",
      role: "Educator / Engineer",
      score: "89% Match",
      avatar: avatarSarah,
      delay: 0.4
    }
  ];

  return (
    <div className={`relative bg-[#F5F1EA] rounded-3xl p-6 sm:p-10 border border-[#2E2330]/10 shadow-xl overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#D7A27A]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center max-w-sm mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C46A4A] bg-[#C46A4A]/10 px-3 py-1 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Pod Alignment Vector
        </span>
        <h4 className="font-serif text-lg font-bold text-[#2E2330]">Individuals → Compatible Pod → Home</h4>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-center relative">
        {/* Left: Individual Member Cards with Real Face Avatars */}
        <div className="space-y-3">
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: node.delay }}
              className="p-3.5 rounded-2xl bg-white border border-[#2E2330]/10 shadow-sm flex items-center justify-between hover:border-[#C46A4A]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={node.avatar}
                  alt={node.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#C46A4A]/40 flex-shrink-0"
                />
                <div>
                  <h5 className="text-xs font-bold text-[#2E2330]">{node.name}</h5>
                  <p className="text-[11px] text-[#7A746B]">{node.role}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#C46A4A] bg-[#C46A4A]/10 px-2 py-0.5 rounded-md">
                {node.score}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Center: BOMA Matching Engine & Connecting Pulse */}
        <div className="flex flex-col items-center justify-center py-4 relative">
          {/* Animated pulsing connector ring */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-24 h-24 rounded-full border-2 border-dashed border-[#B87333]/60 absolute pointer-events-none"
          />
          
          <div className="w-16 h-16 rounded-2xl bg-[#2E2330] text-[#F5F1EA] flex flex-col items-center justify-center shadow-lg border border-[#B87333]/40 z-10">
            <Users className="w-7 h-7 text-[#B87333]" />
          </div>
          <span className="text-[11px] font-bold text-[#2E2330] mt-3 uppercase tracking-wider">
            Verified Pod #042
          </span>
          <span className="text-[10px] text-[#7A746B]">Values & Capital Aligned</span>
        </div>

        {/* Right: Collective Home / Co-ownership Outcome */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="p-6 rounded-2xl bg-[#2E2330] text-[#F5F1EA] shadow-xl border border-[#B87333]/30 text-center relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-full bg-[#B87333]/20 border border-[#B87333]/40 text-[#D7A27A] flex items-center justify-center mx-auto mb-3">
            <Home className="w-6 h-6" />
          </div>
          <h5 className="font-serif text-base font-bold text-[#F5F1EA] mb-1">Modern Co-Owned Home</h5>
          <p className="text-xs text-[#F5F1EA]/70 mb-3">4-Unit Residential Compound in King County, WA</p>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#D7A27A] bg-[#B87333]/20 px-3 py-1 rounded-full border border-[#B87333]/30">
            <HeartHandshake className="w-3.5 h-3.5" /> Shared Wealth & Equity
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PodConnectionGraphic;
