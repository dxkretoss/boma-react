import React from 'react';


export default function OnboardingScore({ setActiveScreen }) {
  return (
    <div className="max-w-[480px] mx-auto text-center select-none py-10">
          <div className="w-full bg-white border border-border rounded-2xl p-10 shadow-custom flex flex-col items-center">
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-semibold">Readiness Score</div>
            
            {/* Score Ring */}
            <div className="w-[120px] h-[120px] rounded-full border-[8px] border-amber-soft flex items-center justify-center mb-6">
              <span className="font-display text-[42px] font-extrabold text-ink">82</span>
            </div>
            
            <h1 className="font-display text-[24px] font-extrabold text-ink mb-3 leading-none">You're Match-Ready</h1>
            
            <p className="text-ink-dim text-sm leading-relaxed mb-8 max-w-[360px]">
              Strong alignment across values and location. We'll notify you when a Pod match is ready to review.
            </p>
            
            <button 
              onClick={() => setActiveScreen('onboarding-approval')}
              className="w-full bg-amber text-white rounded-lg py-3 text-sm font-bold shadow-md hover:bg-[#2450C4] hover:-translate-y-[0.5px] transition-all cursor-pointer text-center"
            >
              Continue
            </button>
          </div>
        </div>
  );
}
