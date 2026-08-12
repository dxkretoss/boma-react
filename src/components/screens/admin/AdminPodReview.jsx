import React from 'react';

export default function AdminPodReview({ setActiveScreen }) {
  return (
    <div className="w-full text-left select-none animate-fade">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Admin / Pod Review</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-5">Suggested Pod review</h3>
      
      <div className="border border-border border-dashed rounded-2xl p-8 bg-panel-alt/25 text-center max-w-[560px]">
        <p className="text-ink-dim text-sm font-semibold">No suggested Pods waiting for approval.</p>
        <p className="text-xs text-ink-dim/75 mt-1">Run the Matching Engine to discover compatibility groupings among onboarded pool members.</p>
      </div>

      <button 
        onClick={() => setActiveScreen('admin-dashboard')}
        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
      >
        Back to dashboard
      </button>
    </div>
  );
}
