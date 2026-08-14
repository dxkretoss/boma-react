import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function OnboardingReview({ ageGroup, selectedLifestyles, decisionStyle, locationCity, locationRadius, settingPreference, budgetRange, downPaymentTier, housingIntent, commitmentTimeline, setActiveScreen, submitOnboarding }) {
  return (
    <div className="max-w-[660px] mx-auto ">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-dim font-bold mb-1.5">
            Step 8 of 9 — Review
          </div>
          <h3 className="font-display font-extrabold text-[22px] text-ink mb-5">Confirm your answers</h3>
          
          <div className="border border-border rounded-xl bg-white shadow-sm overflow-hidden mb-7">
            {[
              { label: 'Age group', val: ageGroup || 'Not specified' },
              { label: 'Values', val: (selectedLifestyles && selectedLifestyles.length > 0) ? selectedLifestyles.join(', ') : 'None selected' },
              { label: 'Decision style', val: decisionStyle ? (decisionStyle.charAt(0).toUpperCase() + decisionStyle.slice(1)) : 'Not specified' },
              { label: 'Location', val: locationCity ? `${locationCity} · ${locationRadius || 45} mi${settingPreference ? ' · ' + settingPreference.charAt(0).toUpperCase() + settingPreference.slice(1) : ''}` : 'Not specified' },
              { label: 'Budget tier', val: budgetRange ? `${budgetRange}${downPaymentTier ? ' · ' + downPaymentTier + ' down' : ''}` : 'Not specified' },
              { label: 'Housing intent', val: housingIntent === 'purchase' ? 'Purchase primary residence' : housingIntent === 'co-develop' ? 'Co-develop property' : housingIntent === 'investment' ? 'Investment hold' : housingIntent ? 'Lifestyle-based co-living' : 'Not specified' },
              { label: 'Commitment', val: commitmentTimeline || 'Not specified' }
            ].map((row, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-border/80 last:border-b-0 p-4 px-5 text-[13.5px]">
                <b className="text-ink-dim font-semibold">{row.label}</b>
                <span className="text-ink font-bold text-right pl-4">{row.val}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => setActiveScreen('onboarding-commitment')}
              className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={submitOnboarding}
              className="bg-amber text-white font-bold text-sm px-7 py-3 rounded-xl shadow-md hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer"
            >
              Submit
            </button>
          </div>
        </div>
  );
}
