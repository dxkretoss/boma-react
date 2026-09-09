import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Users, Flag, ChevronRight, Sparkles, CheckCircle2, ShieldCheck, Paperclip, Smile, Send, FileCode } from 'lucide-react';

import avatarAmara from '../assets/avatar_amara.jpg';
import avatarDavid from '../assets/avatar_david.jpg';
import avatarSarah from '../assets/avatar_sarah.jpg';
import avatarElena from '../assets/avatar_elena.jpg';

export const CommonsDashboard = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessage, setChatMessage] = useState('');

  const tabs = [
    { id: 'chat', label: 'Group Chat', icon: MessageSquare },
    { id: 'agreements', label: 'Shared Agreements', icon: FileText },
    { id: 'members', label: 'Pod Members', icon: Users },
    { id: 'milestones', label: 'Milestones', icon: Flag }
  ];

  const membersList = [
    {
      name: "Amara S.",
      role: "Design & Spatial Lead • Architect",
      match: "96% Match",
      share: "25% Equity",
      status: "Verified Co-Buyer",
      avatar: avatarAmara,
      accent: "#C46A4A"
    },
    {
      name: "David K.",
      role: "Financial Audit Lead • Healthcare",
      match: "92% Match",
      share: "25% Equity",
      status: "Verified Co-Buyer",
      avatar: avatarDavid,
      accent: "#B87333"
    },
    {
      name: "Elena & Marcus",
      role: "Governance Lead • Educator / Eng.",
      match: "89% Match",
      share: "25% Equity",
      status: "Verified Co-Buyer",
      avatar: avatarSarah,
      accent: "#D7A27A"
    },
    {
      name: "Hether Morgan",
      role: "BOMA Advisor & Pod Facilitator",
      match: "Advisor",
      share: "Facilitator",
      status: "BOMA Lead",
      avatar: avatarElena,
      accent: "#C46A4A"
    }
  ];

  const milestonesList = [
    {
      number: "01",
      title: "Pod Formation & Values Alignment",
      description: "Village Test completed with 100% alignment across lifestyle, community rules, and housing vision.",
      status: "Completed",
      statusColor: "bg-[#C46A4A]/20 text-[#C46A4A] border-[#C46A4A]/30",
      isDone: true
    },
    {
      number: "02",
      title: "Legal Scaffolding & Exit Protocols",
      description: "LLC Operating Scaffolding v2.4 and pre-agreed 12-month exit notice rules signed by all 4 members.",
      status: "Completed",
      statusColor: "bg-[#C46A4A]/20 text-[#C46A4A] border-[#C46A4A]/30",
      isDone: true
    },
    {
      number: "03",
      title: "Site Selection & Zoning Audit",
      description: "4-unit residential compound plot identified in Redmond, WA. Municipal zoning pre-audit active.",
      status: "In Progress",
      statusColor: "bg-[#B87333]/25 text-[#D7A27A] border-[#B87333]/40 animate-pulse",
      isCurrent: true
    },
    {
      number: "04",
      title: "Fractional Mortgage Origination",
      description: "Submitting pooled credit and equity dossiers to BOMA certified lending partner network.",
      status: "Upcoming",
      statusColor: "bg-white/10 text-white/60 border-white/15",
      isUpcoming: true
    },
    {
      number: "05",
      title: "Closing & Keys in Hand",
      description: "Final contract signing, title transfer, and community move-in governance schedule.",
      status: "Phase 2 Target",
      statusColor: "bg-white/10 text-white/60 border-white/15",
      isUpcoming: true
    }
  ];

  return (
    <div className={`relative bg-[#1A141C] rounded-3xl p-4 sm:p-8 border border-[#E7DED0]/15 shadow-2xl overflow-hidden glass-dark ${className}`}>
      {/* Top Window Bar */}
      <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#E7DED0]/10 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-[#C46A4A]/80"></span>
            <span className="w-3 h-3 rounded-full bg-[#B87333]/80"></span>
            <span className="w-3 h-3 rounded-full bg-[#D7A27A]/80"></span>
          </div>
          <span className="text-xs font-mono text-[#D7A27A] tracking-wider uppercase ml-2">The Commons — Pod #WA-042</span>
        </div>

        <div className="flex items-center gap-2 bg-[#2E2330] p-1 rounded-full border border-[#E7DED0]/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#B87333] text-white shadow-md'
                    : 'text-[#F5F1EA]/60 hover:text-[#F5F1EA]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="min-h-[360px]">
        
        {/* TAB 1: GROUP CHAT (REALISTIC RICH CHAT INTERFACE) */}
        {activeTab === 'chat' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col h-full space-y-4"
          >
            {/* Chat Room Subheader */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2 text-[#F5F1EA]/80 font-medium">
                <span className="text-[#C46A4A] font-bold"># general-pod-chat</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                <span className="text-[11px] text-[#F5F1EA]/50">4 members active</span>
              </div>
              <div className="flex -space-x-2 overflow-hidden items-center">
                <img
                  src={avatarAmara}
                  alt="Amara S."
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-[#1A141C] object-cover"
                />
                <img
                  src={avatarDavid}
                  alt="David K."
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-[#1A141C] object-cover"
                />
                <img
                  src={avatarSarah}
                  alt="Elena & Marcus"
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-[#1A141C] object-cover"
                />
                <img
                  src={avatarElena}
                  alt="Hether Morgan"
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-[#1A141C] object-cover"
                />
              </div>
            </div>

            {/* Chat Messages Timeline */}
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
              
              {/* Message 1: Amara S */}
              <div className="flex gap-3 items-start">
                <img
                  src={avatarAmara}
                  alt="Amara S."
                  className="w-9 h-9 rounded-full object-cover border border-[#C46A4A]/50 flex-shrink-0 shadow-md"
                />
                <div className="space-y-1.5 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F5F1EA]">Amara S.</span>
                    <span className="text-[10px] text-[#D7A27A] font-semibold bg-[#C46A4A]/20 px-2 py-0.5 rounded-full">Architect</span>
                    <span className="text-[10px] text-[#F5F1EA]/40">10:14 AM</span>
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-xs bg-[#2E2330] border border-[#E7DED0]/10 text-xs text-[#F5F1EA]/90 leading-relaxed shadow-sm">
                    <p>I reviewed the 4-plex plot in Redmond! The solar orientation is perfect for our shared courtyard idea.</p>
                    
                    {/* File Attachment Card */}
                    <div className="mt-2.5 p-2 rounded-xl bg-black/20 border border-white/10 flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-[#C46A4A]/20 text-[#C46A4A]">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[#F5F1EA] truncate">redmond_4plex_siteplan.pdf</p>
                        <p className="text-[9px] text-[#F5F1EA]/50">12.4 MB • Architectural Plan</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 text-[10px]">
                    <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[#F5F1EA]/70">❤️ 2</span>
                    <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[#F5F1EA]/70">👍 2</span>
                  </div>
                </div>
              </div>

              {/* Message 2: Hether Morgan */}
              <div className="flex gap-3 items-start flex-row-reverse">
                <img
                  src={avatarElena}
                  alt="Hether Morgan"
                  className="w-9 h-9 rounded-full object-cover border border-[#B87333]/50 flex-shrink-0 shadow-md"
                />
                <div className="space-y-1.5 max-w-lg text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[10px] text-[#F5F1EA]/40">10:18 AM</span>
                    <span className="text-[10px] text-[#D7A27A] font-semibold bg-[#B87333]/20 px-2 py-0.5 rounded-full">BOMA Lead</span>
                    <span className="text-xs font-bold text-[#F5F1EA]">Hether Morgan</span>
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tr-xs bg-[#B87333]/20 border border-[#B87333]/30 text-xs text-[#F5F1EA]/90 leading-relaxed text-left shadow-sm">
                    <p>Awesome work Amara! Let's review the financing structure during our Thursday Commons session.</p>
                  </div>
                  <div className="flex gap-1 text-[10px] justify-end">
                    <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[#F5F1EA]/70">🙌 3</span>
                  </div>
                </div>
              </div>

              {/* Message 3: David K */}
              <div className="flex gap-3 items-start">
                <img
                  src={avatarDavid}
                  alt="David K."
                  className="w-9 h-9 rounded-full object-cover border border-[#B87333]/50 flex-shrink-0 shadow-md"
                />
                <div className="space-y-1.5 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F5F1EA]">David K.</span>
                    <span className="text-[10px] text-[#D7A27A] font-semibold bg-[#B87333]/20 px-2 py-0.5 rounded-full">Healthcare</span>
                    <span className="text-[10px] text-[#F5F1EA]/40">10:22 AM</span>
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-xs bg-[#2E2330] border border-[#E7DED0]/10 text-xs text-[#F5F1EA]/90 leading-relaxed shadow-sm">
                    <p>Financial dossier is 100% pre-audited. We're ready for fractional lender submission!</p>
                  </div>
                  <div className="flex gap-1 text-[10px]">
                    <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[#F5F1EA]/70">🚀 4</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Interactive Bottom Chat Input Box */}
            <div className="pt-2">
              <div className="flex items-center gap-2 bg-[#2E2330] border border-white/15 rounded-2xl p-2 pl-4 shadow-inner">
                <button className="text-[#F5F1EA]/50 hover:text-[#F5F1EA] transition-colors p-1">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message to Pod #WA-042..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="bg-transparent text-xs text-[#F5F1EA] placeholder-[#F5F1EA]/40 focus:outline-none flex-1"
                />
                <button className="text-[#F5F1EA]/50 hover:text-[#F5F1EA] transition-colors p-1 hidden sm:block">
                  <Smile className="w-4 h-4" />
                </button>
                <button className="bg-[#C46A4A] hover:bg-[#b05d3e] text-white p-2 rounded-xl transition-all duration-300 shadow-md cursor-pointer">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: SHARED AGREEMENTS */}
        {activeTab === 'agreements' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid sm:grid-cols-3 gap-4"
          >
            <div className="sm:col-span-2 space-y-3">
              <div className="p-4 rounded-2xl bg-[#2E2330]/80 border border-[#E7DED0]/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#C46A4A]/20 text-[#C46A4A]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-[#F5F1EA]">Equity Split & Capital Contributions</h5>
                    <p className="text-xs text-[#F5F1EA]/60">LLC Operating Scaffolding v2.4 • 4 Members Signed</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-[#B87333]/20 text-[#D7A27A] px-2.5 py-1 rounded-md border border-[#B87333]/30">
                  Verified
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#2E2330]/80 border border-[#E7DED0]/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#B87333]/20 text-[#D7A27A]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-[#F5F1EA]">Exit & Buy-Out Protocols</h5>
                    <p className="text-xs text-[#F5F1EA]/60">Pre-agreed 12-month notice window • 100% Alignment</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-[#B87333]/20 text-[#D7A27A] px-2.5 py-1 rounded-md border border-[#B87333]/30">
                  Verified
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#2E2330]/80 border border-[#E7DED0]/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#D7A27A]/20 text-[#D7A27A]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-[#F5F1EA]">Community Governance & Shared Space Rules</h5>
                    <p className="text-xs text-[#F5F1EA]/60">Consensus voting mechanism for major repairs</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-[#B87333]/20 text-[#D7A27A] px-2.5 py-1 rounded-md border border-[#B87333]/30">
                  Verified
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#2E2330]/60 border border-[#E7DED0]/10 space-y-4">
              <h6 className="text-xs font-semibold text-[#D7A27A] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Pod Status
              </h6>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[#F5F1EA]/80 pb-2 border-b border-[#E7DED0]/10">
                  <span>Target Location:</span>
                  <span className="font-semibold text-[#F5F1EA]">King County, WA</span>
                </div>
                <div className="flex justify-between text-[#F5F1EA]/80 pb-2 border-b border-[#E7DED0]/10">
                  <span>Target Budget:</span>
                  <span className="font-semibold text-[#D7A27A]">$1.4M ($350k/unit)</span>
                </div>
                <div className="flex justify-between text-[#F5F1EA]/80">
                  <span>Phase:</span>
                  <span className="font-semibold text-[#C46A4A]">Phase 1: Commons Bonding</span>
                </div>
              </div>

              <div className="pt-2">
                <button className="w-full text-xs font-semibold bg-[#B87333]/20 text-[#D7A27A] hover:bg-[#B87333] hover:text-white py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-1 border border-[#B87333]/30 cursor-pointer">
                  <span>View All Legal Files</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: POD MEMBERS */}
        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {membersList.map((member, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#2E2330]/80 border border-[#E7DED0]/10 flex items-center justify-between hover:border-[#B87333]/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#B87333]/40 flex-shrink-0 shadow-md"
                  />
                  <div>
                    <h5 className="text-sm font-bold text-[#F5F1EA] flex items-center gap-1.5">
                      <span>{member.name}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D7A27A]" />
                    </h5>
                    <p className="text-[11px] text-[#F5F1EA]/60">{member.role}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold text-[#D7A27A] bg-[#B87333]/20 px-2 py-0.5 rounded-md border border-[#B87333]/30">
                        {member.match}
                      </span>
                      <span className="text-[10px] font-medium text-[#F5F1EA]/80 bg-white/5 px-2 py-0.5 rounded-md">
                        {member.share}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-[#C46A4A] bg-[#C46A4A]/15 px-2.5 py-1 rounded-full border border-[#C46A4A]/25 whitespace-nowrap">
                  {member.status}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* TAB 4: MILESTONES */}
        {activeTab === 'milestones' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            {milestonesList.map((ms, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#2E2330]/70 border border-[#E7DED0]/10 flex items-start justify-between gap-4 hover:border-[#B87333]/40 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    ms.isDone
                      ? 'bg-[#C46A4A] text-white shadow-md'
                      : ms.isCurrent
                      ? 'bg-[#B87333] text-white shadow-md animate-pulse'
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {ms.isDone ? <CheckCircle2 className="w-4 h-4" /> : ms.number}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#F5F1EA] flex items-center gap-2">
                      <span>{ms.title}</span>
                    </h5>
                    <p className="text-xs text-[#F5F1EA]/70 mt-0.5 leading-relaxed">{ms.description}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border whitespace-nowrap ${ms.statusColor}`}>
                  {ms.status}
                </span>
              </div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default CommonsDashboard;
