import React from 'react';

export default function LandingPage2({ openAuthModal, setActiveScreen, currentUser }) {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-3xl w-full p-8 rounded-3xl bg-white border border-border shadow-custom flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-soft text-ink font-mono text-xs font-semibold uppercase tracking-wider mb-4 border border-border">
          <span>Landing Page 2 (Demo Version)</span>
        </div>
        
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-navy-deep mb-4">
          New Landing Page Design
        </h1>
        
        <p className="text-ink-dim text-lg mb-8 max-w-xl">
          This is your new <strong>/landing2</strong> route. Paste or share your custom landing page sections here, and they will render right below the Header.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => setActiveScreen('landing')}
            className="px-6 py-3 rounded-full border border-border bg-white text-ink font-semibold hover:bg-panel-alt transition-all cursor-pointer"
          >
            ← View Original Home (/)
          </button>
          <button
            onClick={() => openAuthModal ? openAuthModal('signup') : setActiveScreen('signup')}
            className="px-6 py-3 rounded-full bg-ink text-white font-semibold hover:bg-[#201822] transition-all cursor-pointer"
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}
