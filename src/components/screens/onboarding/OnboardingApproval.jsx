import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function OnboardingApproval({ setActiveScreen }) {
  return (
    <div className="max-w-[500px] mx-auto text-center select-none py-10">
          <div className="w-full bg-white border border-border rounded-2xl p-10 shadow-custom flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-teal-soft flex items-center justify-center text-teal mb-4">
              <RefreshCw className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-semibold">Under Review</div>
            
            <h1 className="font-display text-[24px] font-extrabold text-ink mb-4 leading-tight">Your profile is being reviewed</h1>
            
            <p className="text-ink-dim text-sm leading-relaxed mb-8 max-w-[420px]">
              An admin will review your onboarding responses and readiness score before you're added to the matching pool. This usually takes 1–2 business days — we'll notify you once you're approved.
            </p>
            
            <button 
              onClick={() => setActiveScreen('profile')}
              className="w-full bg-amber text-white rounded-lg py-3 text-sm font-bold shadow-md hover:bg-[#2450C4] hover:-translate-y-[0.5px] transition-all cursor-pointer text-center"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
  );
}
