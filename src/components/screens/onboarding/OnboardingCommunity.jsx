import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function OnboardingCommunity({ decisionStyle, setDecisionStyle, podSize, setPodSize, setActiveScreen, stepProgressBar }) {
  return (
    <div className="max-w-[660px] mx-auto ">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-dim font-bold mb-1.5">
            Step 3 of 9 — Community Preferences
          </div>
          {stepProgressBar(3)}
          
          <h1 className="font-display text-[26px] font-extrabold text-ink mb-6">
            How do you like to make group decisions?
          </h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
            {[
              { id: 'consensus', label: 'Consensus', sub: 'Everyone weighs in' },
              { id: 'delegated', label: 'Delegated', sub: 'A few people lead' },
              { id: 'flexible', label: 'Flexible', sub: 'Depends on the topic' }
            ].map(opt => (
              <div 
                key={opt.id}
                onClick={() => setDecisionStyle(opt.id)}
                className={`flex flex-col items-center text-center p-4.5 rounded-xl border cursor-pointer shadow-sm transition-all duration-150 ${
                  decisionStyle === opt.id 
                    ? 'border-amber bg-amber-soft/85' 
                    : 'border-border bg-white hover:border-amber hover:-translate-y-[1px]'
                }`}
              >
                <div className="font-display text-sm font-extrabold text-ink mb-1 ">
                  {opt.label}
                </div>
                <div className="text-[11px] text-ink-dim font-medium ">
                  {opt.sub}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2.5 font-semibold">
              Preferred Pod size
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8">
            {[
              { id: '4–6', label: '4–6 households' },
              { id: '7–10', label: '7–10 households' },
              { id: '10+', label: '10+ households' }
            ].map(opt => (
              <div 
                key={opt.id}
                onClick={() => setPodSize(opt.id)}
                className={`flex flex-col items-center text-center p-4 rounded-xl border cursor-pointer shadow-sm transition-all duration-150 ${
                  podSize === opt.id 
                    ? 'border-amber bg-amber-soft/85' 
                    : 'border-border bg-white hover:border-amber hover:-translate-y-[1px]'
                }`}
              >
                <div className="text-[13px] font-extrabold text-ink leading-tight ">
                  {opt.label}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => setActiveScreen('onboarding-lifestyle')}
              className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={() => setActiveScreen('onboarding-location')}
              className="bg-ink text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
  );
}
