import React from 'react';

export default function ReadinessDetail({
  currentUser,
  breakdown,
  getCategoryScores,
  setActiveScreen
}) {
  return (
    <div className="pad py-12 px-6 md:px-8 text-left ">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Profile / Readiness Breakdown</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-1.5">Readiness breakdown</h3>
      <p className="text-ink-dim text-[14px] leading-relaxed mb-6 max-w-[480px]">
        A rules-based score across four alignment categories. This updates automatically as you edit your preferences.
      </p>

      <div className="border border-border rounded-2xl p-6 bg-white shadow-sm max-w-[520px] space-y-5">
        {(() => {
          const scores = getCategoryScores(currentUser, breakdown);
          return [
            { label: 'Lifestyle alignment', val: scores.lifestyle },
            { label: 'Location flexibility', val: scores.location },
            { label: 'Financial readiness tier', val: scores.financial },
            { label: 'Commitment clarity', val: scores.commitment }
          ];
        })().map((cat, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
              <span>{cat.label}</span>
              <span className="font-mono text-xs">{cat.val} / 100</span>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-amber transition-all duration-300" style={{ width: `${cat.val}%` }} />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setActiveScreen('profile')}
        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
      >
        Back to profile
      </button>
    </div>
  );
}
