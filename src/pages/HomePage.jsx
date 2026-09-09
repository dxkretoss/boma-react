import React, { useState } from 'react';
import { ChevronDown, ArrowRight, Users, ShieldCheck, Home, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HomePage({ openAuthModal, setActiveScreen, currentUser }) {
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleGetStarted = () => {
    if (currentUser) {
      setActiveScreen('profile');
    } else {
      if (openAuthModal) {
        openAuthModal('signup');
      } else {
        setActiveScreen('signup');
      }
    }
  };

  return (
    <div className="w-full animate-fade">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-6 max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-soft text-ink font-mono text-xs font-semibold uppercase tracking-wider mb-6 w-fit border border-border">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Community-Matching for Real Estate</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] text-navy-deep mb-6">
              Match the neighbors. <br />
              <span className="text-ink">Then build the neighborhood.</span>
            </h1>

            <p className="text-ink-dim text-lg leading-relaxed mb-8 max-w-[540px]">
              BOMA matches individuals and families who are genuinely compatible, groups them into collaborative Pods, and provides a shared space to build trust and governance agreements — before buying land or building homes.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={handleGetStarted}
                className="bg-amber text-white font-sans font-bold text-base px-8 py-3.5 rounded-full shadow-custom hover:bg-[#b05d3e] hover:-translate-y-[1px] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveScreen('how-it-works')}
                className="bg-white border border-border text-ink font-sans font-semibold text-base px-7 py-3.5 rounded-full hover:bg-panel-alt transition-all cursor-pointer shadow-sm"
              >
                See How It Works
              </button>
            </div>

            {/* Quick stats / trust signals */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
              <div>
                <div className="font-display text-2xl font-extrabold text-navy-deep">9-Step</div>
                <div className="text-xs font-sans text-ink-dim mt-0.5">Readiness Matching</div>
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold text-navy-deep">100%</div>
                <div className="text-xs font-sans text-ink-dim mt-0.5">No Financial Risk</div>
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold text-navy-deep">Collaborative</div>
                <div className="text-xs font-sans text-ink-dim mt-0.5">Pod Commons Space</div>
              </div>
            </div>
          </div>

          {/* Hero Image / Visual Showcase */}
          <div className="relative w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-custom-lg border border-border bg-white p-2">
              <img
                src="/assets/pod_community_realistic.png"
                alt="Community members collaborating"
                className="w-full h-[380px] sm:h-[440px] rounded-2xl object-cover"
                onError={(e) => {
                  e.target.src = '/hero.png';
                }}
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-border shadow-custom flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-soft text-teal flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-navy-deep font-display">Cedar Grove Pod</div>
                    <div className="text-xs text-ink-dim font-sans">Austin, TX • 4 of 5 Members Joined</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-sage/10 text-sage font-mono text-xs font-semibold">
                  87% Match
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Journey Cards */}
      <section className="py-16 px-6 bg-panel-alt/50 border-y border-border">
        <div className="max-w-[1240px] mx-auto text-center">
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-ink mb-3">
            Simple 3-Phase Process
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-deep mb-4">
            How BOMA Brings Neighbors Together
          </h2>
          <p className="text-ink-dim text-base max-w-2xl mx-auto mb-12">
            A structured path designed to establish mutual values, governance, and financial alignment before any long-term commitments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Step 1 */}
            <div className="bg-white border border-border rounded-2xl p-7 shadow-custom flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-soft text-teal flex items-center justify-center mb-5 font-display font-extrabold text-lg">
                  01
                </div>
                <h3 className="font-display font-bold text-xl text-navy-deep mb-2.5">
                  Match on Compatibility
                </h3>
                <p className="text-ink-dim text-sm leading-relaxed mb-6 font-sans">
                  Complete our readiness questionnaire covering lifestyle, values, budget range, and long-term commitments. Our algorithm finds your ideal peers.
                </p>
              </div>
              <div className="pt-4 border-t border-border flex items-center gap-2 text-xs font-mono text-ink font-semibold uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-sage" />
                <span>Readiness Algorithm</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-border rounded-2xl p-7 shadow-custom flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-soft text-ink flex items-center justify-center mb-5 font-display font-extrabold text-lg">
                  02
                </div>
                <h3 className="font-display font-bold text-xl text-navy-deep mb-2.5">
                  Bond in The Commons
                </h3>
                <p className="text-ink-dim text-sm leading-relaxed mb-6 font-sans">
                  Join your assigned Pod's private commons. Work through agreement scaffolding docs, discuss governance, and build authentic trust.
                </p>
              </div>
              <div className="pt-4 border-t border-border flex items-center gap-2 text-xs font-mono text-ink font-semibold uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-sage" />
                <span>Zero Financial Risk</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-border rounded-2xl p-7 shadow-custom flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sage/10 text-sage flex items-center justify-center mb-5 font-display font-extrabold text-lg">
                  03
                </div>
                <h3 className="font-display font-bold text-xl text-navy-deep mb-2.5">
                  Build the Neighborhood
                </h3>
                <p className="text-ink-dim text-sm leading-relaxed mb-6 font-sans">
                  Once fully aligned, transition as a unified group toward land acquisition, architecture selection, and cooperative financing.
                </p>
              </div>
              <div className="pt-4 border-t border-border flex items-center gap-2 text-xs font-mono text-ink font-semibold uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-sage" />
                <span>Co-Living Execution</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 max-w-[860px] mx-auto">
        <div className="text-center mb-12">
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-ink mb-2">
            Got Questions?
          </div>
          <h2 className="font-display text-3xl font-extrabold text-navy-deep">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'What is a BOMA Pod?',
              a: 'A Pod is a small, carefully matched group of 3 to 8 individuals or families who share aligned values, lifestyles, and financial timelines to explore shared co-living and community real estate.'
            },
            {
              q: 'Do I need to commit money right away?',
              a: 'No. BOMA is built specifically to eliminate early financial risk. You do not invest or buy land until your Pod has fully completed agreement scaffolding and all members vote to move forward.'
            },
            {
              q: 'How does the matching engine work?',
              a: 'Our 9-step readiness assessment evaluates lifestyle preferences, noise tolerance, decision-making styles, budget parameters, and location preferences to pair you with highest-compatibility neighbors.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-panel-alt/30 transition-colors"
              >
                <span className="font-display font-bold text-base sm:text-lg text-navy-deep">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-ink-dim transition-transform duration-200 shrink-0 ${
                    openFaq === idx ? 'rotate-180 text-ink' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-6 text-ink-dim text-sm sm:text-base leading-relaxed font-sans border-t border-border/50 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 px-6 max-w-[1240px] mx-auto mb-16">
        <div className="bg-navy-deep rounded-3xl p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-custom-lg">
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-4">
              Ready to find your future neighbors?
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-8">
              Take the 9-step survey today and get matched with compatible Pods in your preferred city.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-white text-navy-deep font-sans font-bold text-base px-8 py-4 rounded-full shadow-lg hover:bg-amber-soft hover:text-ink transition-all cursor-pointer"
            >
              Start Free Readiness Assessment
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
