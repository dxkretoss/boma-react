import React from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function OnboardingCommitment({ commitmentTimeline, setCommitmentTimeline, setActiveScreen, stepProgressBar, options, isSavingStep }) {
  const commitmentOptions = (options && options.length > 0)
    ? options.map(opt => ({
        id: opt.label.toLowerCase(),
        label: opt.label
      }))
    : [
        { id: '2+ years', label: '2+ years' },
        { id: '5+ years', label: '5+ years' },
        { id: 'flexible', label: 'Flexible' }
      ];

  return (
    <div className="max-w-[660px] mx-auto ">
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
            {commitmentOptions.map(opt => {
              const cleanComm = (commitmentTimeline || '').toLowerCase().trim();
              const cleanId = (opt.id || '').toLowerCase().trim();
              const cleanLabel = (opt.label || '').toLowerCase().trim();
              const isSelected = commitmentTimeline && (
                cleanComm === cleanId || 
                cleanComm === cleanLabel || 
                cleanComm.includes(cleanId) || 
                cleanId.includes(cleanComm)
              );
              return (
                <div 
                  key={opt.id}
                  onClick={() => setCommitmentTimeline(opt.label)}
                  className={`flex flex-col items-center text-center p-4 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected 
                      ? 'border-2 border-amber bg-amber-soft/85 ring-2 ring-amber/20 shadow-md -translate-y-[1px]' 
                      : 'border border-border bg-white hover:border-amber/80 hover:-translate-y-[1px] shadow-sm'
                  }`}
                >
                  <div className={`text-[13px] leading-tight ${isSelected ? 'font-black text-ink' : 'font-extrabold text-ink'}`}>
                    {opt.label}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-ink-dim font-medium italic mb-7">
            This also sets your exit tolerance — how easily you'd want to leave a Pod if it's not working.
          </p>

          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => setActiveScreen('onboarding-intent')}
              disabled={isSavingStep}
              className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={() => setActiveScreen('onboarding-review')}
              disabled={isSavingStep}
              className="bg-amber text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#b05d3e] active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSavingStep ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
  );
}
