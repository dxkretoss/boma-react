import React, { useState, useEffect } from 'react';

export default function OnboardingScore({ setActiveScreen, currentUser }) {
  const score = currentUser?.readiness_score || 82;
  const [offset, setOffset] = useState(314.16);

  useEffect(() => {
    // Small delay to trigger the transition on mount
    const timer = setTimeout(() => {
      const targetOffset = 314.16 * (1 - score / 100);
      setOffset(targetOffset);
    }, 150);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="max-w-[480px] mx-auto text-center py-10">
      <div className="w-full bg-white border border-border rounded-2xl p-10 shadow-custom flex flex-col items-center animate-fade">
        <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-semibold">Readiness Score</div>
        
        {/* Score Ring */}
        <div className="relative w-[130px] h-[130px] flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="65"
              cy="65"
              r="50"
              className="stroke-amber-soft"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated Front Circle */}
            <circle
              cx="65"
              cy="65"
              r="50"
              className="stroke-amber"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="314.16"
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-display text-[42px] font-extrabold text-ink leading-none">{score}</span>
          </div>
        </div>
        
        <h1 className="font-display text-[24px] font-extrabold text-ink mb-3 leading-none">
          {score >= 70 ? "You're Match-Ready" : "Profile Submitted"}
        </h1>
        
        <p className="text-ink-dim text-sm leading-relaxed mb-8 max-w-[360px]">
          Strong alignment across values and location. We'll notify you when a Pod match is ready to review.
        </p>
        
        <button 
          onClick={() => setActiveScreen('onboarding-approval')}
          className="w-full bg-amber text-white rounded-lg py-3 text-sm font-bold shadow-md hover:bg-[#2450C4] hover:-translate-y-[0.5px] transition-all cursor-pointer text-center"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
