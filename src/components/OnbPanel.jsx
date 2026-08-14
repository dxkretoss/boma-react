import React from 'react';

const ONB_PANEL_CONFIG = {
  'verify-email': {
    eyebrow: 'One More Step',
    heading: "You're almost in",
    body: "Just confirm your email and we'll take you straight into onboarding — nine quick steps to build your BOMA profile."
  },
  'entry-path': {
    eyebrow: 'Get Started',
    heading: 'Two ways to begin',
    body: "Most people join the matching pool and let BOMA find aligned neighbors. If you already have your group, you can register together instead and skip matching entirely."
  },
  'onboarding-welcome': {
    eyebrow: 'Onboarding',
    heading: 'Nine short steps to find your people',
    body: "Lifestyle, location, and housing readiness — all in about 8 minutes. Nothing here is locked in; you can always come back and edit."
  },
  'onboarding-age': {
    eyebrow: 'Step 1 of 9',
    heading: 'One process, every generation',
    body: "BOMA adapts its language and examples to your life stage — the scoring underneath stays exactly the same for everyone."
  },
  'onboarding-lifestyle': {
    eyebrow: 'Step 2 of 9',
    heading: 'Lifestyle shapes everything',
    body: "These values are the single biggest input into your match — weighted more heavily than any other category in the engine."
  },
  'onboarding-community': {
    eyebrow: 'Step 3 of 9',
    heading: "How your Pod will decide together",
    body: "Pods with a shared decision-making style tend to stay stable longer — this helps us group you with people who'll agree on how to agree."
  },
  'onboarding-location': {
    eyebrow: 'Step 4 of 9',
    heading: "Where you'll put down roots",
    body: "Your metro area and radius set the geographic boundary for every Pod we could possibly match you into."
  },
  'onboarding-budget': {
    eyebrow: 'Step 5 of 9',
    heading: 'Readiness, not a bank account',
    body: "These are self-reported tiers only. No account is linked and no funds move in Phase 1 — this just tells us your financial starting point."
  },
  'onboarding-intent': {
    eyebrow: 'Step 6 of 9',
    heading: "What you're really here to do",
    body: "Buying a home, co-developing land, or something else entirely — this is the single biggest fork in how BOMA matches you."
  },
  'onboarding-commitment': {
    eyebrow: 'Step 7 of 9',
    heading: "How long you're in for",
    body: "This also sets your exit tolerance — how easily you'd want to leave a Pod if it turns out not to be the right fit."
  },
  'onboarding-review': {
    eyebrow: 'Step 8 of 9',
    heading: 'Almost there',
    body: "Take one more look before we calculate your readiness score — you can always come back and adjust any answer later."
  },
  'onboarding-score': {
    eyebrow: 'Step 9 of 9',
    heading: 'Your readiness, calculated',
    body: "A rules-based score built from everything you just answered — transparent, and never a black box."
  },
  'onboarding-approval': {
    eyebrow: 'Under Review',
    heading: 'A human double-checks every profile',
    body: "Before you enter the matching pool, an admin reviews your responses — that keeps the whole pool trustworthy for everyone in it."
  },
  'pod-create': {
    eyebrow: 'Register an Existing Pod',
    heading: 'Bring your people with you',
    body: "Already have your group? Skip matching entirely and go straight to setting up your shared space in the Commons."
  },
  'pod-invite': {
    eyebrow: 'Invite Members',
    heading: 'Everyone gets a seat at the table',
    body: "Each person you invite completes a short onboarding of their own before your Pod is verified and activated."
  },
  'pod-member-onboarding': {
    eyebrow: 'Member Onboarding',
    heading: 'Quick, since you already found each other',
    body: "No matching questions here — just enough for BOMA to understand readiness and commitment across your group."
  },
  'pod-review': {
    eyebrow: 'Submission Review',
    heading: 'One last check',
    body: "Confirm everything looks right — an admin will verify your Pod once it's submitted."
  },
  'pod-pending': {
    eyebrow: 'Under Review',
    heading: 'Real groups, verified by real people',
    body: "An admin confirms membership and readiness for every self-registered Pod before it goes live."
  }
};

const DEFAULT_PANEL = {
  eyebrow: 'Onboarding',
  heading: "Let's find your people",
  body: "A structured questionnaire on lifestyle, location, and housing readiness — built to match you with neighbors who actually fit."
};

export default function OnbPanel({ activeScreen }) {
  const cfg = ONB_PANEL_CONFIG[activeScreen] || DEFAULT_PANEL;

  return (
    <aside 
      className="p-12 text-white flex-shrink-0 flex flex-col justify-between h-auto min-h-[calc(100vh-64px-29px)] "
      style={{ background: 'linear-gradient(160deg, var(--navy-deep) 0%, var(--teal) 100%)' }}
    >
      <div>
        <div className="font-mono text-[11.5px] uppercase tracking-[.12em] text-amber-soft mb-3.5 font-semibold">
          {cfg.eyebrow}
        </div>
        <h2 className="font-display text-[28px] font-extrabold leading-tight text-white mb-5">
          {cfg.heading}
        </h2>
        <p className="text-[#A3B3C8] text-[14.5px] leading-relaxed mb-9">
          {cfg.body}
        </p>

        {/* Stats Row */}
        <div className="flex gap-6 border-t border-b border-white/10 py-6 mb-8 justify-between">
          <div>
            <div className="font-display text-[26px] font-extrabold text-white leading-tight">86</div>
            <div className="text-[10px] uppercase tracking-wider text-[#7F92B0] font-semibold mt-1">Active Pods</div>
          </div>
          <div>
            <div className="font-display text-[26px] font-extrabold text-white leading-tight">94%</div>
            <div className="text-[10px] uppercase tracking-wider text-[#7F92B0] font-semibold mt-1">Stability Rate</div>
          </div>
          <div>
            <div className="font-display text-[26px] font-extrabold text-white leading-tight">8 min</div>
            <div className="text-[10px] uppercase tracking-wider text-[#7F92B0] font-semibold mt-1">Avg. Time</div>
          </div>
        </div>
      </div>

      {/* Onboarding Testimonial */}
      <div className="bg-white/5 border border-white/8 rounded-xl p-5 text-[13.5px] text-[#D7E2EE] leading-normal mt-auto">
        <p className="italic text-[#D7E2EE] mb-3">
          "We found three families who wanted exactly what we wanted, in six weeks."
        </p>
        <div className="flex items-center gap-2.5">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            alt="Sam Rivera"
            className="w-8 h-8 rounded-full object-cover border border-white/20 flex-shrink-0"
          />
          <div>
            <b className="block text-white text-[12px]">Sam Rivera</b>
            <span className="text-[11px] text-[#7F92B0] font-medium">Cedar Grove Pod</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
