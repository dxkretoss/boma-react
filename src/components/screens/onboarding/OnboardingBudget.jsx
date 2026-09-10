import React from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function OnboardingBudget({ 
  budgetRange, 
  setBudgetRange, 
  downPaymentTier, 
  setDownPaymentTier, 
  financingPreference, 
  setFinancingPreference, 
  setActiveScreen, 
  stepProgressBar,
  downPaymentOptions,
  financingOptions,
  isSavingStep
}) {
  const finalDownPaymentOptions = (downPaymentOptions && downPaymentOptions.length > 0)
    ? downPaymentOptions.map(opt => opt.label)
    : ['0–5%', '5–10%', '10–20%', '20%+'];

  const finalFinancingOptions = (financingOptions && financingOptions.length > 0)
    ? financingOptions.map(opt => ({
        id: opt.label.toLowerCase(),
        label: opt.label
      }))
    : [
        { id: 'traditional', label: 'Traditional mortgage' },
        { id: 'shared', label: 'Shared equity' },
        { id: 'co-dev', label: 'Co-development' },
        { id: 'undecided', label: 'Undecided' }
      ];

  return (
    <div className="max-w-[660px] mx-auto ">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-dim font-bold mb-1.5">
            Step 5 of 9 — Budget &amp; Financing Readiness
          </div>
          {stepProgressBar(5)}
          
          <div className="mb-5">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">
              Estimated purchase budget range
            </label>
            <input 
              type="text" 
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              placeholder="e.g. $350,000 – $450,000" 
              className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2 font-semibold">
              Down payment readiness tier
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {finalDownPaymentOptions.map(opt => (
              <div 
                key={opt}
                onClick={() => setDownPaymentTier(opt)}
                className={`flex flex-col items-center text-center p-3.5 rounded-xl border cursor-pointer shadow-sm transition-all duration-150 ${
                  downPaymentTier === opt 
                    ? 'border-amber bg-amber-soft/85' 
                    : 'border-border bg-white hover:border-amber hover:-translate-y-[1px]'
                }`}
              >
                <div className="text-[12.5px] font-extrabold text-ink leading-tight ">
                  {opt}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2 font-semibold">
              Financing preference
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {finalFinancingOptions.map(opt => (
              <div 
                key={opt.id}
                onClick={() => setFinancingPreference(opt.id)}
                className={`flex flex-col items-center text-center p-3.5 rounded-xl border cursor-pointer shadow-sm transition-all duration-150 ${
                  financingPreference === opt.id 
                    ? 'border-amber bg-amber-soft/85' 
                    : 'border-border bg-white hover:border-amber hover:-translate-y-[1px]'
                }`}
              >
                <div className="text-[11.5px] font-extrabold text-ink leading-tight ">
                  {opt.label}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-ink-dim font-medium italic mb-7">
            This is a preference range only — no accounts or funds are connected in Phase 1.
          </p>

          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => setActiveScreen('onboarding-location')}
              disabled={isSavingStep}
              className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={() => setActiveScreen('onboarding-intent')}
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
