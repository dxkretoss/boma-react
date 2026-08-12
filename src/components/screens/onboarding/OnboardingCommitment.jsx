import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function OnboardingCommitment({ commitmentTimeline, setCommitmentTimeline, setActiveScreen, stepProgressBar }) {
  return (
    <div className="max-w-[660px] mx-auto select-none">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-dim font-bold mb-1.5">
            Step 7 of 9 — Commitment Duration
          </div>
          {stepProgressBar(7)}
          
          <div className="mb-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2 font-semibold">
              Minimum commitment timeline
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
            {[
              { id: '2+ years', label: '2+ years' },
              { id: '5+ years', label: '5+ years' },
              { id: 'flexible', label: 'Flexible' }
            ].map(opt => (
              <div 
                key={opt.id}
                onClick={() => setCommitmentTimeline(opt.id)}
                className={`flex flex-col items-center text-center p-4 rounded-xl border cursor-pointer shadow-sm transition-all duration-150 ${
                  commitmentTimeline === opt.id 
                    ? 'border-amber bg-amber-soft/85' 
                    : 'border-border bg-white hover:border-amber hover:-translate-y-[1px]'
                }`}
              >
                <div className="text-[13px] font-extrabold text-ink leading-tight select-none">
                  {opt.label}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-ink-dim font-medium italic mb-7">
            This also sets your exit tolerance — how easily you'd want to leave a Pod if it's not working.
          </p>

          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => setActiveScreen('onboarding-intent')}
              className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={() => setActiveScreen('onboarding-review')}
              className="bg-ink text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
  );
}
