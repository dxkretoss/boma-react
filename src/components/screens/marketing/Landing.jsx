import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Landing({ openAuthModal, setActiveScreen }) {
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="animate-fade">
      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center py-16 px-6 md:px-8 max-w-[1180px] mx-auto">
        <div className="flex flex-col text-left">
          <div className="font-mono text-[11.5px] uppercase tracking-wider text-amber mb-3.5 font-semibold">
            Community-Matching for Real Estate
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold leading-tight text-ink mb-6">
            Match the neighbors. Then build the neighborhood.
          </h1>
          <p className="text-ink-dim text-lg leading-relaxed mb-8 max-w-[540px]">
            BOMA finds people who are genuinely compatible as neighbors, groups them into a Pod, and gives that Pod a shared space to build trust — before any land, escrow, or construction enters the picture.
          </p>
          <div className="flex items-center gap-3.5 flex-wrap">
            <button
              onClick={() => openAuthModal('signup')}
              className="bg-amber text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md hover:bg-[#2450C4] hover:-translate-y-[0.5px] active:scale-95 transition-all cursor-pointer"
            >
              Get Started
            </button>
            <button
              onClick={() => setActiveScreen('how-it-works')}
              className="bg-transparent border border-border text-ink font-bold text-sm px-6 py-3 rounded-xl hover:bg-panel-alt transition-all cursor-pointer"
            >
              See how it works
            </button>
          </div>
        </div>

        <div className="w-full max-w-[500px] md:max-w-none mx-auto">
          <img
            src="/assets/pod_community_realistic.png"
            alt="Community pod planning a neighborhood"
            className="w-full h-[340px] rounded-2xl object-cover shadow-custom-lg border border-border/5"
          />
        </div>
      </div>

      {/* Three Stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] mx-8 mb-5 relative ">
        {/* Stage 1 */}
        <div className="border border-border rounded-custom p-6 bg-panel shadow-custom flex flex-col relative text-left">
          <div className="w-[42px] h-[42px] rounded-xl bg-teal-soft flex items-center justify-center mb-3.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a5 5 0 105 5 5 5 0 00-5-5zm0 8a3 3 0 113-3 3 3 0 01-3 3zm9 11v-1a7 7 0 00-7-7h-4a7 7 0 00-7 7v1h2v-1a5 5 0 015-5h4a5 5 0 015 5v1z" fill="#0E4C8C" />
            </svg>
          </div>
          <h4 className="font-display font-extrabold text-[17px] text-teal mb-2">1. Match on Compatibility</h4>
          <p className="text-ink-dim text-sm leading-relaxed mb-4">
            Take a 9-step survey on lifestyle, budget, location, and long-term values. Our engine groups compatible users.
          </p>
          <span className="text-[12px] font-mono text-ink-dim mt-auto font-semibold uppercase tracking-wider">Scoring Active</span>
        </div>

        {/* Stage 2 */}
        <div className="border border-border rounded-custom p-6 bg-panel shadow-custom flex flex-col relative text-left">
          <div className="w-[42px] h-[42px] rounded-xl bg-teal-soft flex items-center justify-center mb-3.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 21a9 9 0 119-9 9 9 0 01-9 9zm0-16a7 7 0 107 7 7 7 0 00-7-7zm-1 3h2v5h-2zm0 7h2v2h-2z" fill="#0E4C8C" />
            </svg>
          </div>
          <h4 className="font-display font-extrabold text-[17px] text-teal mb-2">2. Bond in The Commons</h4>
          <p className="text-ink-dim text-sm leading-relaxed mb-4">
            Enter a shared space. Scaffolding questions, lifestyle check-ins, and group chats help you build deep trust before spending money.
          </p>
          <span className="text-[12px] font-mono text-ink-dim mt-auto font-semibold uppercase tracking-wider">No Financial Risk</span>
        </div>

        {/* Stage 3 */}
        <div className="border border-border rounded-custom p-6 bg-panel shadow-custom flex flex-col relative text-left">
          <div className="w-[42px] h-[42px] rounded-xl bg-teal-soft flex items-center justify-center mb-3.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2zM5 5v14h14V5zM12 6l5 4v6h-3v-3h-4v3H7v-6z" fill="#0E4C8C" />
            </svg>
          </div>
          <h4 className="font-display font-extrabold text-[17px] text-teal mb-2">3. Build the Neighborhood</h4>
          <p className="text-ink-dim text-sm leading-relaxed mb-4">
            Once aligned, transition together to land acquisition, layout planning, and financing as a unified entity.
          </p>
          <span className="text-[12px] font-mono text-[#D97706] mt-auto font-semibold uppercase tracking-wider">Phase 2 Coming Soon</span>
        </div>
      </div>

      {/* Core Features */}
      <div className="py-16 px-6 md:px-8 max-w-[1180px] mx-auto text-left">
        <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-12 items-start mb-10">
          <div className="max-w-[340px]">
            <h2 className="font-display text-3xl font-extrabold text-ink mb-4">Why people choose BOMA</h2>
            <p className="text-ink-dim text-[15px] leading-relaxed">
              Most co-housing and intentional-community projects don't fail on construction or financing — they fail because the people were never truly aligned.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="flex flex-col p-2 text-left">
              <div className="w-11 h-11 rounded-xl bg-teal-soft flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="6" cy="6" r="3" fill="#0E4C8C" />
                  <circle cx="14" cy="6" r="3" fill="#0E4C8C" />
                  <path d="M2 17c0-3 2-5 4-5s4 2 4 5M10 17c0-3 2-5 4-5s4 2 4 5" stroke="#0E4C8C" strokeWidth="1.6" fill="none" />
                </svg>
              </div>
              <h4 className="font-display font-extrabold text-[17px] text-teal mb-2">Real alignment, not luck</h4>
              <p className="text-ink-dim text-sm leading-relaxed">
                A structured questionnaire and rules-based scoring replace guesswork with signal.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col p-2 text-left">
              <div className="w-11 h-11 rounded-xl bg-teal-soft flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="8" width="14" height="9" rx="2" fill="#0E4C8C" />
                  <path d="M6 8V6a4 4 0 018 0v2" stroke="#0E4C8C" strokeWidth="1.6" fill="none" />
                </svg>
              </div>
              <h4 className="font-display font-extrabold text-[17px] text-teal mb-2">Trust before commitment</h4>
              <p className="text-ink-dim text-sm leading-relaxed">
                The Commons is a low-stakes space to bond before anyone signs anything.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col p-2 text-left">
              <div className="w-11 h-11 rounded-xl bg-teal-soft flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 17V9l6-5 6 5v8" stroke="#0E4C8C" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
                  <path d="M8 17v-5h4v5" stroke="#0E4C8C" strokeWidth="1.6" fill="none" />
                </svg>
              </div>
              <h4 className="font-display font-extrabold text-[17px] text-teal mb-2">A path already built for groups</h4>
              <p className="text-ink-dim text-sm leading-relaxed">
                Already have your people? Register an Existing Pod and skip matching entirely.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Band (Parallax Banner Style) */}
      <div className="relative w-full rounded-2xl overflow-hidden h-[380px] mb-16 shadow-custom-lg max-w-[1180px] mx-auto border border-border/5 ">
        <img src="/assets/commons_gathering.png" className="w-full h-full object-cover" alt="Community gathering" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 via-navy-deep/60 to-transparent p-8 md:p-12 flex items-center text-left">
          <div className="max-w-[480px] text-white">
            <h2 className="font-display text-[26px] font-extrabold mb-3 leading-tight">
              Real neighbors. Real trust. Before anything's built.
            </h2>
            <p className="text-[#A3B3C8] text-[14px] leading-relaxed">
              The Commons gives every Pod a place to actually get to know each other — long before land, escrow, or contracts enter the picture.
            </p>
          </div>
        </div>
      </div>

      {/* Active Pods Photo Grid */}
      <div className="py-8 px-6 md:px-8 max-w-[1180px] mx-auto text-left">
        <div className="text-center max-w-[640px] mx-auto mb-12">
          <h2 className="font-display text-3xl font-extrabold text-ink mb-4">Pods forming across the country</h2>
          <p className="text-ink-dim text-[15px] leading-relaxed">A glimpse at communities coming together through BOMA.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <figure className="relative h-[220px] rounded-custom overflow-hidden shadow-custom m-0">
            <img src="/assets/pod_austin.png" className="w-full h-full object-cover block" alt="Suburban homes in Austin, TX" />
            <figcaption className="absolute bottom-0 left-0 right-0 p-3.5 px-4 bg-gradient-to-t from-navy-deep/85 to-transparent text-white text-[12.5px] font-mono">
              Cedar Grove Pod · Austin, TX
            </figcaption>
          </figure>

          <figure className="relative h-[220px] rounded-custom overflow-hidden shadow-custom m-0">
            <img src="/assets/pod_denver.png" className="w-full h-full object-cover block" alt="Neighborhood houses in Denver, CO" />
            <figcaption className="absolute bottom-0 left-0 right-0 p-3.5 px-4 bg-gradient-to-t from-navy-deep/85 to-transparent text-white text-[12.5px] font-mono">
              Willow Creek Pod · Denver, CO
            </figcaption>
          </figure>

          <figure className="relative h-[220px] rounded-custom overflow-hidden shadow-custom m-0">
            <img src="/assets/pod_charleston.png" className="w-full h-full object-cover block" alt="Modern suburban street in Charleston, SC" />
            <figcaption className="absolute bottom-0 left-0 right-0 p-3.5 px-4 bg-gradient-to-t from-navy-deep/85 to-transparent text-white text-[12.5px] font-mono">
              Harbor View Pod · Charleston, SC
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 px-6 md:px-8 max-w-[1180px] mx-auto border-t border-border mt-12 text-left">
        <div className="text-center max-w-[640px] mx-auto mb-12">
          <h2 className="font-display text-3xl font-extrabold text-ink">What early members are saying</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-border rounded-custom p-6 bg-white shadow-custom flex flex-col justify-between">
            <div>
              <div className="text-amber text-sm font-semibold mb-3">★★★★★</div>
              <p className="text-ink font-medium italic text-[14px] leading-relaxed mb-6">
                "We'd been trying to find people to co-buy land with for two years. BOMA's onboarding surfaced three families who wanted exactly what we wanted, in six weeks."
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-border pt-4 mt-auto">
              <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display border border-border flex-shrink-0">
                S
              </div>
              <div className="flex flex-col leading-tight">
                <b className="font-bold text-[13.5px] text-ink">Sam Rivera</b>
                <span className="text-[11.5px] text-ink-dim font-medium">Cedar Grove Pod, Austin TX</span>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-custom p-6 bg-white shadow-custom flex flex-col justify-between">
            <div>
              <div className="text-amber text-sm font-semibold mb-3">★★★★★</div>
              <p className="text-ink font-medium italic text-[14px] leading-relaxed mb-6">
                "The Commons made it low-pressure. We could tell within a month whether this group actually worked together, before any money was on the table."
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-border pt-4 mt-auto">
              <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display border border-border flex-shrink-0">
                M
              </div>
              <div className="flex flex-col leading-tight">
                <b className="font-bold text-[13.5px] text-ink">Morgan Chen</b>
                <span className="text-[11.5px] text-ink-dim font-medium">Cedar Grove Pod, Austin TX</span>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-custom p-6 bg-white shadow-custom flex flex-col justify-between">
            <div>
              <div className="text-amber text-sm font-semibold mb-3">★★★★★</div>
              <p className="text-ink font-medium italic text-[14px] leading-relaxed mb-6">
                "Four of us already knew each other and wanted to buy a fourplex together. Registering as an existing Pod let us skip matching and go straight to planning."
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-border pt-4 mt-auto">
              <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display border border-border flex-shrink-0">
                T
              </div>
              <div className="flex flex-col leading-tight">
                <b className="font-bold text-[13.5px] text-ink">Taylor Kim</b>
                <span className="text-[11.5px] text-ink-dim font-medium">The Fourplex Founders</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Founding Thesis Banner */}
      <div className="max-w-[1180px] mx-auto px-6 md:px-8 py-16 text-center  text-white rounded-2xl shadow-custom-lg mb-16 border border-white/5"
        style={{
          background: `linear-gradient(rgba(37, 99, 235, 0.85), rgba(37, 99, 235, 0.85)), url('/assets/quote_bg.png') center/cover no-repeat`
        }}
      >
        <blockquote className="font-display font-extrabold text-[28px] md:text-[34px] leading-tight mb-2">
          "Match neighbors before building the neighborhood."
        </blockquote>
        <cite className="block text-white/80 font-mono text-sm not-italic mt-4">— BOMA's founding thesis</cite>
      </div>

      {/* FAQs */}
      <div className="py-16 px-6 md:px-8 max-w-[800px] mx-auto text-left">
        <div className="text-center max-w-[640px] mx-auto mb-10">
          <h2 className="font-display text-3xl font-extrabold text-ink">Frequently asked questions</h2>
        </div>

        <div className="flex flex-col gap-4">
          {[
            {
              q: "Is BOMA a dating app?",
              a: "No. BOMA uses similar matching mechanics, but the goal is neighbor compatibility — lifestyle, values, location, and housing readiness — not romance."
            },
            {
              q: "Do I need money set aside before I join?",
              a: "No. Budget fields in onboarding are self-reported readiness tiers, not linked accounts. No funds or escrow are involved in this phase."
            },
            {
              q: "What if my Pod doesn't work out?",
              a: "You can exit any Pod and return to the matching pool to be matched again — no penalty, no lock-in."
            },
            {
              q: "I already have a group — can we skip matching?",
              a: "Yes. Use \"Register an Existing Pod\" to bring your own group directly into the Commons after a short verification step."
            },
            {
              q: "What happens after our Pod bonds?",
              a: "Phase 2 (in development) adds escrow, vendor coordination, land acquisition, construction tracking, and HOA management."
            }
          ].map((faq, idx) => (
            <div key={idx} className="border border-border rounded-xl overflow-hidden bg-white shadow-custom">
              <div
                onClick={() => toggleFaq(idx)}
                className="flex justify-between items-center px-5 py-4 font-bold text-[15px] text-ink cursor-pointer hover:bg-panel-alt/50  transition-colors"
              >
                <span>{faq.q}</span>
                <span className={`transform transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-4 h-4 text-ink-dim" />
                </span>
              </div>
              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1.5 text-ink-dim text-[13.5px] leading-relaxed border-t border-border/15 animate-fade">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section Bottom */}
      <div className="py-16 px-6 md:px-8 text-center max-w-[800px] mx-auto border border-border rounded-2xl bg-white shadow-custom mb-16 ">
        <h2 className="font-display text-3xl font-extrabold text-ink mb-8">Ready to find your people?</h2>
        <div className="flex items-center gap-3.5 justify-center flex-wrap">
          <button
            onClick={() => openAuthModal('signup')}
            className="bg-amber text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md hover:bg-[#2450C4] hover:-translate-y-[0.5px] active:scale-95 transition-all cursor-pointer"
          >
            Get Started
          </button>
          <button
            onClick={() => setActiveScreen('entry-path')}
            className="bg-transparent border border-border text-ink font-bold text-sm px-6 py-3 rounded-xl hover:bg-panel-alt transition-all cursor-pointer"
          >
            Register an Existing Pod
          </button>
        </div>
      </div>
    </div>
  );
}
