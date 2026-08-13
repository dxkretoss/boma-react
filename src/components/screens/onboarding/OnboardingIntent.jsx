import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function OnboardingIntent({ housingIntent, setHousingIntent, setActiveScreen, stepProgressBar }) {
  return (
    <div className="max-w-[660px] mx-auto ">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-dim font-bold mb-1.5">
            Step 6 of 9 — Primary Housing Intent
          </div>
          {stepProgressBar(6)}
          
          <h3 className="font-display font-bold text-[18px] text-ink mb-5">
            What are your goals for this community housing?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
            {[
              { id: 'purchase', label: 'Purchase primary residence', sub: "Where you'll live day to day" },
              { id: 'co-develop', label: 'Co-develop property', sub: 'Build alongside your Pod' },
              { id: 'investment', label: 'Investment hold', sub: 'Not your primary home' },
              { id: 'co-living', label: 'Lifestyle-based co-living', sub: 'Shared spaces, shared living' }
            ].map(opt => (
              <div 
                key={opt.id}
                onClick={() => setHousingIntent(opt.id)}
                className={`flex items-center gap-3.5 p-4.5 rounded-xl border cursor-pointer shadow-sm transition-all duration-150 text-left ${
                  housingIntent === opt.id 
                    ? 'border-amber bg-amber-soft/85' 
                    : 'border-border bg-white hover:border-amber hover:-translate-y-[1px]'
                }`}
              >
                <div className="flex flex-col leading-tight ">
                  <span className="text-[13.5px] font-extrabold text-ink mb-1">{opt.label}</span>
                  <span className="text-[11px] text-ink-dim font-medium">{opt.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => setActiveScreen('onboarding-budget')}
              className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={() => setActiveScreen('onboarding-commitment')}
              className="bg-ink text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
  );
}
