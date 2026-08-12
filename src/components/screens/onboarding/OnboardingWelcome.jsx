import React from 'react';
import { ArrowLeft, Users, Star } from 'lucide-react';

export default function OnboardingWelcome({ setActiveScreen }) {
  return (
    <div className="max-w-[540px]">
          <div className="w-12 h-12 rounded-xl bg-teal-soft flex items-center justify-center text-teal mb-4">
            <Users className="w-6 h-6" />
          </div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1.5 font-semibold">Onboarding</div>
          <h1 className="font-display text-[32px] font-extrabold text-ink leading-tight mb-4">Let's find your people</h1>
          <p className="text-ink-dim text-sm leading-relaxed mb-8">
            Nine short steps on lifestyle, location, and housing readiness. Takes about 8 minutes, and you can save and come back anytime.
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveScreen('onboarding-age')}
              className="bg-amber text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md hover:bg-[#2450C4] hover:-translate-y-[0.5px] active:scale-95 transition-all cursor-pointer"
            >
              Start onboarding
            </button>
            <button 
              onClick={() => setActiveScreen('profile')}
              className="bg-transparent border border-border text-ink font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to profile
            </button>
          </div>
        </div>
  );
}
