import React from 'react';


export default function PodPending({ setActiveScreen }) {
  return (
    <div className="max-w-[480px] mx-auto text-center  py-10">
          <div className="w-full bg-white border border-border rounded-2xl p-10 shadow-custom flex flex-col items-center">
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-semibold">Under Review</div>
            
            <h1 className="font-display text-[24px] font-extrabold text-ink mb-4 leading-tight">Your Pod is being verified</h1>
            
            <p className="text-ink-dim text-sm leading-relaxed mb-8 max-w-[380px]">
              An admin is confirming membership and readiness. This usually takes 1–2 business days.
            </p>
            
            <button 
              onClick={() => setActiveScreen('profile')}
              className="w-full bg-transparent border border-border text-ink rounded-lg py-2.5 text-sm font-bold hover:bg-panel-alt transition-all cursor-pointer text-center"
            >
              Back to profile
            </button>
          </div>
        </div>
  );
}
