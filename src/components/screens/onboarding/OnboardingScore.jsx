import React, { useState, useEffect } from 'react';
import { getReadinessScoreBreakdown } from '../../../api/onboarding';

export default function OnboardingScore({ setActiveScreen, currentUser }) {
  const score = currentUser?.readiness_score || 82;
  const [offset, setOffset] = useState(314.16);
  const [breakdown, setBreakdown] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(true);

  useEffect(() => {
    async function loadBreakdown() {
      if (!currentUser?.id) {
        setLoadingBreakdown(false);
        return;
      }
      try {
        setLoadingBreakdown(true);
        const data = await getReadinessScoreBreakdown(currentUser.id);
        setBreakdown(data);
      } catch (err) {
        console.error('Error loading readiness score breakdown:', err);
      } finally {
        setLoadingBreakdown(false);
      }
    }
    loadBreakdown();
  }, [currentUser]);

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
        
        <p className="text-ink-dim text-sm leading-relaxed mb-6 max-w-[360px]">
          Strong alignment across values and location. We'll notify you when a Pod match is ready to review.
        </p>

        {breakdown && breakdown.appliedSteps && breakdown.appliedSteps.length > 0 && (
          <div className="w-full mt-2 mb-7 pt-5 border-t border-border/70 text-left space-y-3">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-ink-dim font-bold text-center mb-1">
              Readiness Breakdown (Steps 3, 5 & 7)
            </h4>
            
            <div className="space-y-2.5">
              {[3, 5, 7].map(stepNum => {
                const steps = breakdown.appliedSteps.filter(s => s.stepNumber === stepNum);
                const stepLabel = stepNum === 3 ? "Step 3: Community Preferences" : stepNum === 5 ? "Step 5: Budget & Financing" : "Step 7: Commitment Duration";
                
                if (steps.length === 0) {
                  return (
                    <div key={stepNum} className="flex justify-between items-center text-[11.5px] bg-[#F8FAFC] p-2.5 rounded-lg border border-border/50">
                      <span className="font-bold text-ink-dim">{stepLabel}</span>
                      <span className="font-mono font-bold text-slate-400">0 pts</span>
                    </div>
                  );
                }

                const totalPoints = steps.reduce((sum, s) => sum + s.points, 0);
                const avgPoints = Math.round(totalPoints / steps.length);

                return (
                  <div key={stepNum} className="bg-[#F8FAFC]/80 p-3 rounded-xl border border-border/50 space-y-1">
                    <div className="flex justify-between items-center text-[11.5px] font-bold text-ink mb-0.5">
                      <span>{stepLabel}</span>
                      <span className="font-mono text-teal font-extrabold">{avgPoints} pts</span>
                    </div>
                    <div className="space-y-0.5 pl-0.5">
                      {steps.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10.5px] text-ink-dim font-medium">
                          <span className="truncate max-w-[240px]">{s.selectedOption}</span>
                          <span className="font-mono text-teal/70 shrink-0">{s.points} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
