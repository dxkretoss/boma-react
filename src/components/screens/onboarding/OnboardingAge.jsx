import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export default function OnboardingAge({ 
  ageGroup, 
  setAgeGroup, 
  setActiveScreen, 
  stepProgressBar, 
  options, 
  isSavingStep 
}) {
  const ageOptions = (options && options.length > 0) ? options : [
    { label: '18–30 years', desc: 'Gen Z / Millennials • Nomads, Professionals & Creators' },
    { label: '31–60 years', desc: 'Gen X / Millennials • Families, Builders & Professionals' },
    { label: '61+ years', desc: 'Boomers / Seniors • Active Retirement & Community Elders' }
  ];

  const handleSelect = (label) => {
    if (isSavingStep) return;
    if (setAgeGroup) {
      setAgeGroup(label);
    }
  };

  return (
    <div className="max-w-[660px] mx-auto">
      <div className="text-xs font-mono uppercase tracking-wider text-ink-dim font-bold mb-1.5">
        Step 1 of 9 — Age Group
      </div>
      {stepProgressBar(1)}
      
      <h1 className="font-display text-[32px] font-extrabold text-ink mb-3 leading-tight">
        Select your <span className="text-amber">age group</span>
      </h1>
      <p className="text-ink-dim text-sm leading-relaxed mb-7">
        BOMA adapts its communication style and question examples to align with your generation's life stage, while keeping scoring identical.
      </p>
      
      <div className="flex flex-col gap-3.5 mb-8">
        {ageOptions.map((age, idx) => {
          const isSelected = ageGroup === age.label;
          return (
            <div 
              key={age.id || age.label || idx}
              onClick={() => handleSelect(age.label)}
              className={`flex justify-between items-center rounded-xl p-5 px-6 cursor-pointer transition-all duration-150 ${
                isSelected 
                  ? 'border-2 border-amber bg-amber-soft/85 ring-2 ring-amber/20 shadow-md -translate-y-[1px]' 
                  : 'border border-border bg-white hover:border-amber/80 hover:-translate-y-[1px] shadow-sm'
              } ${isSavingStep ? 'cursor-wait opacity-90' : ''}`}
            >
              <div className="flex flex-col text-left">
                <b className={`text-[15.5px] mb-0.5 ${isSelected ? 'text-ink font-black' : 'text-ink font-bold'}`}>
                  {age.label}
                </b>
                {age.desc && (
                  <span className={`text-[12.5px] font-medium ${isSelected ? 'text-ink-dim' : 'text-ink-dim'}`}>
                    {age.desc}
                  </span>
                )}
              </div>
              {isSelected ? (
                <div className="w-6 h-6 rounded-full bg-amber text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 fill-amber text-white" />
                </div>
              ) : (
                <ArrowRight className="w-4 h-4 text-ink-dim flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center gap-3.5">
        <button 
          onClick={() => setActiveScreen('onboarding-welcome')}
          disabled={isSavingStep}
          className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button 
          onClick={() => setActiveScreen('onboarding-lifestyle')}
          disabled={isSavingStep || !ageGroup}
          className="bg-amber text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#b05d3e] active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
