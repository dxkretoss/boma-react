import React from 'react';
import { Sparkles, Users, Play } from 'lucide-react';

export default function LearningHub({
  currentUser,
  isUserOnboarded,
  isProfileApproved,
  isProfileUnderReview,
  isProfileRejected,
  openWhatsBomaModal,
  openVideoModal,
  setActiveScreen
}) {
  return (
    <div className="pad py-12 px-6 md:px-8">
      {/* Banner Hero Grid */}
      <div
        className="learning-hero text-white p-8 md:p-10 rounded-2xl mb-8 relative overflow-hidden shadow-custom-lg "
        style={{ background: 'linear-gradient(135deg, #0B1E38 0%, #132339 40%, #0E4C8C 100%)' }}
      >
        {/* Background SVG deco */}
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10 pointer-events-none">
          <Sparkles className="w-72 h-72" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center relative z-10">
          <div className="lg:col-span-3 text-left">
            <div className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-mono text-[#DCE6FB] mb-5 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-amber"></span>
              BOMA Member Learning Center
            </div>
            <h1 className="font-display font-extrabold text-[34px] text-white leading-tight mb-4">
              Welcome to BOMA!
            </h1>
            <p className="text-[#DCE6FB] text-[15px] leading-relaxed mb-7 max-w-[500px]">
              Your journey starts here. Discover how neighbor compatibility matching works, watch video tutorials, and complete your profile questions when you're ready to find your Pod.
            </p>

            <div className="flex gap-3 flex-wrap">
              {(!isUserOnboarded || isProfileRejected) ? (
                <button
                  onClick={() => setActiveScreen('entry-path')}
                  className="bg-amber text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md hover:bg-[#2450C4] hover:-translate-y-[0.5px] transition-all cursor-pointer"
                >
                  {isProfileRejected ? 'Update Onboarding Profile →' : 'Start Onboarding Questions →'}
                </button>
              ) : (
                <button
                  onClick={() => setActiveScreen(isProfileApproved ? 'profile' : 'onboarding-approval')}
                  className="bg-amber text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md hover:bg-[#2450C4] hover:-translate-y-[0.5px] transition-all cursor-pointer"
                >
                  {isProfileApproved ? 'Go to Dashboard →' : 'Check Review Status →'}
                </button>
              )}
              <button
                onClick={openWhatsBomaModal}
                className="bg-white/12 border border-white/30 text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-white/25 transition-all cursor-pointer"
              >
                What is BOMA?
              </button>
            </div>
          </div>

          {/* Profile Status Widget Card */}
          <div className="lg:col-span-2 bg-white/7 backdrop-blur-xl border border-white/15 rounded-2xl p-6 text-white text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#A5C4F3] font-semibold">
                Profile Readiness
              </span>
              <span
                style={{
                  backgroundColor: !isUserOnboarded
                    ? '#FFF3C4'
                    : isProfileRejected
                      ? '#FEE2E2'
                      : isProfileApproved
                        ? '#E1F5FE'
                        : '#CCFBF1',
                  color: !isUserOnboarded
                    ? '#8A5300'
                    : isProfileRejected
                      ? '#991B1B'
                      : isProfileApproved
                        ? '#0E4C8C'
                        : '#0F766E'
                }}
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full "
              >
                {!isUserOnboarded
                  ? 'Incomplete'
                  : isProfileRejected
                    ? 'Needs Attention'
                    : isProfileApproved
                      ? 'Match-Ready'
                      : 'Under Review'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-display text-[42px] font-extrabold text-white leading-none">
                {isUserOnboarded ? (currentUser?.readiness_score || 82) : '--'}
              </span>
              <span className="text-sm text-[#DCE6FB] font-medium">/ 100 Readiness Score</span>
            </div>

            <div className="h-1 bg-white/15 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-amber transition-all duration-300"
                style={{ width: isUserOnboarded ? '100%' : '15%' }}
              />
            </div>

            <p className="text-xs text-[#B9CDE9] leading-relaxed mb-5">
              {!isUserOnboarded
                ? 'Complete your 9 onboarding questions to calculate your Readiness Score and unlock Pod Matching & The Commons.'
                : isProfileRejected
                  ? `Feedback: ${currentUser?.rejection_reason || 'Please update your answers and resubmit.'}`
                  : isProfileApproved
                    ? `Profile approved! Your Readiness Score is ${currentUser?.readiness_score || 82}. All Pod Matching and Commons features are fully unlocked.`
                    : 'Your profile is under review by BOMA Admin. Access will unlock immediately once approved.'}
            </p>

            <button
              onClick={() => {
                if (!isUserOnboarded) {
                  setActiveScreen('entry-path');
                } else if (isProfileRejected) {
                  setActiveScreen('onboarding-approval');
                } else if (isProfileApproved) {
                  setActiveScreen('profile');
                } else {
                  setActiveScreen('onboarding-approval');
                }
              }}
              className="w-full bg-amber text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all text-center justify-center cursor-pointer shadow-md"
            >
              {!isUserOnboarded
                ? 'Complete Profile Now'
                : isProfileRejected
                  ? 'Update Profile'
                  : isProfileApproved
                    ? 'Go to Dashboard'
                    : 'Check Review Status'}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Learning grid */}
      <div className="mb-10 text-left">
        <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1.5 font-bold">Interactive Learning</div>
        <h2 className="font-display font-extrabold text-2xl text-ink mb-5">Everything you need to get started</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-200">
            <div>
              <div className="w-11 h-11 rounded-xl bg-amber-soft text-amber flex items-center justify-center mb-4">
                <Sparkles className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-ink mb-2">What's BOMA?</h3>
              <p className="text-ink-dim text-sm leading-relaxed mb-4">
                BOMA flips traditional real estate. We match neighbors based on values, lifestyle, and housing intent first — creating trusted Pods before any financial commitment.
              </p>
              <div className="flex gap-2 flex-wrap mb-5">
                <span className="bg-[#F0F4F8] text-navy-deep text-xs font-semibold px-2.5 py-1 rounded-full">Values Matching</span>
                <span className="bg-[#F0F4F8] text-navy-deep text-xs font-semibold px-2.5 py-1 rounded-full">Zero Escrow Upfront</span>
                <span className="bg-[#F0F4F8] text-navy-deep text-xs font-semibold px-2.5 py-1 rounded-full">Pod Commons</span>
              </div>
            </div>
            <button
              onClick={openWhatsBomaModal}
              className="w-full bg-transparent border border-border text-ink rounded-lg py-2.5 text-sm font-bold hover:bg-panel-alt transition-colors cursor-pointer text-center"
            >
              Read Full Vision &amp; Architecture →
            </button>
          </div>

          {/* Card 2 */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-200">
            <div>
              <div className="w-11 h-11 rounded-xl bg-teal-soft text-teal flex items-center justify-center mb-4">
                <Users className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-ink mb-2">How It Works</h3>
              <p className="text-ink-dim text-sm leading-relaxed mb-4">
                A simple 3-stage process designed to eliminate real estate friction and build lasting neighbor alignment.
              </p>

              <div className="flex flex-col gap-2.5 mb-5 font-semibold text-[13px] text-ink">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber text-white flex items-center justify-center font-bold text-[10.5px]">1</span>
                  <span>Learn &amp; Create Account</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-panel-alt text-ink-dim flex items-center justify-center font-bold text-[10.5px]">2</span>
                  <span className="text-ink-dim font-medium">Answer 9 Onboarding Questions</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-panel-alt text-ink-dim flex items-center justify-center font-bold text-[10.5px]">3</span>
                  <span className="text-ink-dim font-medium">Get Matched &amp; Join Pod Commons</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveScreen('how-it-works')}
              className="w-full bg-transparent border border-border text-ink rounded-lg py-2.5 text-sm font-bold hover:bg-panel-alt transition-colors cursor-pointer text-center"
            >
              Explore Full 3-Stage Guide →
            </button>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="mb-10 text-left">
        <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1.5 font-bold">Video Library</div>
        <h2 className="font-display font-extrabold text-2xl text-ink mb-2">Learning Videos &amp; Tutorials</h2>
        <p className="text-ink-dim text-[14.5px] leading-relaxed mb-6 max-w-[600px]">
          Watch short 2-minute video guides to understand co-housing dynamics, readiness metrics, and shared agreement scaffolding.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              title: 'Intro to BOMA Co-housing',
              thumb: '/assets/pod_community_realistic.png',
              duration: '2:30',
              tag: 'Getting Started',
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              desc: 'Learn why matching neighbors first creates resilient, vibrant communities without financial risks up front.'
            },
            {
              title: 'How Pod Matching Works',
              thumb: '/assets/pod_austin.png',
              duration: '3:15',
              tag: 'Matching Engine',
              url: '',
              desc: 'Discover how our transparent rules-based engine evaluates lifestyle, decision-making style, and metro radius.'
            },
            {
              title: 'Understanding Readiness Scores',
              thumb: '/assets/pod_denver.png',
              duration: '1:45',
              tag: 'Scoring Guide',
              url: '',
              desc: 'Learn how self-reported readiness tiers and commitment timelines build your transparent readiness score.'
            },
            {
              title: 'The Pod Commons & Agreements',
              thumb: '/assets/pod_charleston.png',
              duration: '4:00',
              tag: 'Community Commons',
              url: '',
              desc: 'Explore Pod chat, agreement scaffolding, and consensus decision making before moving to Phase 2.'
            }
          ].map((v, i) => (
            <div
              key={i}
              onClick={() => openVideoModal(v.title, v.url, v.desc)}
              className="border border-border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform duration-200 cursor-pointer"
            >
              <div className="relative h-40 bg-navy-deep flex items-center justify-center overflow-hidden">
                <img src={v.thumb} className="w-full h-full object-cover opacity-60" alt={v.title} />
                <div className="absolute w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all">
                  <Play className="w-5 h-5 text-navy-deep fill-navy-deep ml-0.5" />
                </div>
                <span className="absolute bottom-2.5 right-2.5 bg-black/75 text-white font-mono text-[10.5px] px-2 py-0.5 rounded">
                  {v.duration}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="bg-panel-alt text-navy-deep text-[10.5px] font-bold px-2 py-0.5 rounded-full w-fit mb-2">
                  {v.tag}
                </span>
                <h4 className="font-display font-bold text-sm text-navy-deep leading-snug mb-1">
                  {v.title}
                </h4>
                <p className="text-xs text-ink-dim leading-relaxed">
                  {v.desc.slice(0, 75)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
