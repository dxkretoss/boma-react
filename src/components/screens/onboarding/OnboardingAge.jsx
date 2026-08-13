import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function OnboardingAge({ ageGroup, handleAgeSelect, setActiveScreen, stepProgressBar }) {
  return (
    <div className="max-w-[660px] mx-auto">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-dim font-bold mb-1.5">
            Step 1 of 9 — Age Group
          </div>
          {stepProgressBar(1)}
          
          <h1 className="font-display text-[32px] font-extrabold text-ink mb-3 leading-tight">
            Select your <span className="text-teal">age group</span>
          </h1>
          <p className="text-ink-dim text-sm leading-relaxed mb-7">
            BOMA adapts its communication style and question examples to align with your generation's life stage, while keeping scoring identical.
          </p>
          
          <div className="flex flex-col gap-3.5 ">
            {[
              { label: '18–30 years', desc: 'Gen Z / Millennials • Nomads, Professionals & Creators' },
              { label: '31–60 years', desc: 'Gen X / Millennials • Families, Builders & Professionals' },
              { label: '61+ years', desc: 'Boomers / Seniors • Active Retirement & Community Elders' }
            ].map(age => (
              <div 
                key={age.label}
                onClick={() => handleAgeSelect(age.label)}
                className={`flex justify-between items-center border rounded-xl p-5 px-6 bg-white cursor-pointer shadow-sm transition-all duration-150 border-border hover:border-amber hover:-translate-y-[1px] ${
                  ageGroup === age.label ? 'ring-2 ring-amber/15 border-amber' : ''
                }`}
              >
                <div className="flex flex-col">
                  <b className="text-[15.5px] text-ink mb-0.5">{age.label}</b>
                  <span className="text-[12.5px] text-ink-dim font-medium">{age.desc}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-dim" />
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setActiveScreen('onboarding-welcome')}
            className="bg-transparent border border-border text-ink font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer mt-7"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
  );
}
