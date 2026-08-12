import React from 'react';


export default function AdminExistingPodQueue({ setActiveScreen }) {
  return (
    <div className="w-full text-left select-none">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Admin / Existing Pod Queue</div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-5">Existing Pod verification queue</h3>
          
          <div className="border border-border border-dashed rounded-2xl p-8 bg-panel-alt/25 text-center max-w-[560px] text-left">
            <p className="text-ink-dim text-sm font-semibold text-center">No self-registered pods waiting for verification.</p>
            <p className="text-xs text-ink-dim/75 mt-1 text-center">Formed groups will appear here once they complete registration and submit for community board approval.</p>
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
