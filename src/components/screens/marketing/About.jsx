import React from 'react';

export default function About({ setActiveScreen }) {
  return (
    <div className="animate-fade py-16 px-6 md:px-8 max-w-[720px] mx-auto text-left">
      <div className="font-mono text-[11.5px] uppercase tracking-wider text-amber mb-3.5 font-semibold">
        About
      </div>
      <h1 className="font-display text-[32px] font-extrabold text-ink leading-tight mb-5">
        Neighbors first, structures second
      </h1>
      <p className="text-ink-dim text-base leading-relaxed mb-8">
        Most co-housing and intentional-community projects don't fail on construction or financing — they fail because the people were never truly aligned. BOMA moves alignment to step one, so every later step starts on solid ground.
      </p>
      <button
        onClick={() => setActiveScreen('contact')}
        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-3 rounded-xl hover:bg-panel-alt transition-all cursor-pointer"
      >
        Contact us
      </button>
    </div>
  );
}
