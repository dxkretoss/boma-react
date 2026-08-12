import React from 'react';

export default function HowItWorks({ openAuthModal }) {
  return (
    <div className="animate-fade py-16 px-6 md:px-8 max-w-[900px] mx-auto text-left">
      <div className="font-mono text-[11.5px] uppercase tracking-wider text-amber mb-3.5 font-semibold">
        How It Works
      </div>
      <h1 className="font-display text-[32px] font-extrabold text-ink leading-tight mb-8">
        Three stages, one aligned community
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="border border-border rounded-custom p-6 bg-white shadow-custom">
          <h4 className="font-display font-extrabold text-base text-ink mb-2">1. Match</h4>
          <p className="text-ink-dim text-sm leading-relaxed">
            Answer a guided questionnaire on lifestyle, values, location, and housing intent. A rules-based engine matches you with aligned neighbors.
          </p>
        </div>
        <div className="border border-border rounded-custom p-6 bg-white shadow-custom">
          <h4 className="font-display font-extrabold text-base text-ink mb-2">2. Bond</h4>
          <p className="text-ink-dim text-sm leading-relaxed">
            Your Pod gets a shared dashboard, agreement scaffolding, and simple chat — a space to build trust before anything is financial.
          </p>
        </div>
        <div className="border border-border rounded-custom p-6 bg-white shadow-custom">
          <h4 className="font-display font-extrabold text-base text-ink mb-2">3. Build</h4>
          <p className="text-ink-dim text-sm leading-relaxed">
            Once bonded, your Pod moves into land, financing, and construction — supported by BOMA's vendor and partner network.
          </p>
        </div>
        <div className="border border-border rounded-custom p-6 bg-white shadow-custom">
          <h4 className="font-display font-extrabold text-base text-ink mb-2">Already know your group?</h4>
          <p className="text-ink-dim text-sm leading-relaxed">
            Register an Existing Pod and skip matching — go straight to the Commons with your own people.
          </p>
        </div>
      </div>

      <button
        onClick={() => openAuthModal('signup')}
        className="bg-amber text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md hover:bg-[#2450C4] hover:-translate-y-[0.5px] active:scale-95 transition-all cursor-pointer"
      >
        Get Started
      </button>
    </div>
  );
}
