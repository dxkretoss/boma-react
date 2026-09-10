import React from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function OnboardingCommunity({ 
  decisionStyle, 
  setDecisionStyle, 
  podSize, 
  setPodSize, 
  setActiveScreen, 
  stepProgressBar,
  decisionOptions,
  podSizeOptions,
  isSavingStep
}) {
  const finalDecisionOptions = (decisionOptions && decisionOptions.length > 0)
    ? decisionOptions.map(opt => ({
        id: opt.label.toLowerCase(),
        label: opt.label,
        sub: opt.desc || ''
      }))
    : [
        { id: 'consensus', label: 'Consensus', sub: 'Everyone weighs in' },
        { id: 'delegated', label: 'Delegated', sub: 'A few people lead' },
        { id: 'flexible', label: 'Flexible', sub: 'Depends on the topic' }
      ];

  const finalPodSizeOptions = (podSizeOptions && podSizeOptions.length > 0)
    ? podSizeOptions.map(opt => ({
        id: opt.label.toLowerCase(),
        label: opt.label
      }))
    : [
        { id: '4–6', label: '4–6 households' },
        { id: '7–10', label: '7–10 households' },
        { id: '10+', label: '10+ households' }
      ];

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
            {finalDecisionOptions.map(opt => {
              const isSelected = decisionStyle && (
                decisionStyle.toLowerCase() === opt.id.toLowerCase() || 
                decisionStyle.toLowerCase() === opt.label.toLowerCase()
              );
              return (
                <div 
                  key={opt.id}
                  onClick={() => setDecisionStyle(opt.id)}
                  className={`flex flex-col items-center text-center p-4.5 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected 
                      ? 'border-2 border-amber bg-amber-soft/85 ring-2 ring-amber/20 shadow-md -translate-y-[1px]' 
                      : 'border border-border bg-white hover:border-amber/80 hover:-translate-y-[1px] shadow-sm'
                  }`}
                >
                  <div className={`font-display text-sm font-extrabold mb-1 ${isSelected ? 'text-ink font-black' : 'text-ink'}`}>
                    {opt.label}
                  </div>
                  {opt.sub && (
                    <div className="text-[11px] text-ink-dim font-medium ">
                      {opt.sub}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mb-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2.5 font-semibold">
              Preferred Pod size
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8">
            {finalPodSizeOptions.map(opt => {
              const cleanPod = (podSize || '').replace(/–/g, '-').toLowerCase();
              const cleanOptId = (opt.id || '').replace(/–/g, '-').toLowerCase();
              const cleanOptLabel = (opt.label || '').replace(/–/g, '-').toLowerCase();
              const isSelected = podSize && (
                cleanPod === cleanOptId || 
                cleanPod === cleanOptLabel || 
                cleanPod.includes(cleanOptId) || 
                cleanOptLabel.includes(cleanPod)
              );
              return (
                <div 
                  key={opt.id}
                  onClick={() => setPodSize(opt.label)}
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
          
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => setActiveScreen('onboarding-lifestyle')}
              disabled={isSavingStep}
              className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={() => setActiveScreen('onboarding-location')}
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
