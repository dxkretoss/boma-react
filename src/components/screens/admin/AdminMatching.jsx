import React from 'react';


export default function AdminMatching({ lifestyleWeight, setLifestyleWeight, locationWeight, setLocationWeight, budgetWeight, setBudgetWeight, commitmentWeight, setCommitmentWeight, setActiveScreen }) {
  return (
    <div className="w-full text-left select-none">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Admin / Matching Engine</div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-2">Matching engine control</h3>
          <p className="text-ink-dim text-sm leading-relaxed mb-6 max-w-[480px]">
            Adjust variable weighting without a code change, then run the engine against the current pool.
          </p>

          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm max-w-[520px] space-y-6">
            <div className="flex flex-col">
              <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
                <span>Lifestyle &amp; values</span>
                <span className="font-mono text-xs">{lifestyleWeight}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={lifestyleWeight}
                onChange={(e) => setLifestyleWeight(parseInt(e.target.value))}
                className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-amber" 
              />
            </div>
            
            <div className="flex flex-col">
              <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
                <span>Location alignment</span>
                <span className="font-mono text-xs">{locationWeight}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={locationWeight}
                onChange={(e) => setLocationWeight(parseInt(e.target.value))}
                className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-amber" 
              />
            </div>
            
            <div className="flex flex-col">
              <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
                <span>Financial readiness</span>
                <span className="font-mono text-xs">{budgetWeight}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={budgetWeight}
                onChange={(e) => setBudgetWeight(parseInt(e.target.value))}
                className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-amber" 
              />
            </div>
            
            <div className="flex flex-col">
              <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
                <span>Commitment alignment</span>
                <span className="font-mono text-xs">{commitmentWeight}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={commitmentWeight}
                onChange={(e) => setCommitmentWeight(parseInt(e.target.value))}
                className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-amber" 
              />
            </div>
          </div>

          <div className="flex gap-3.5 mt-6">
            <button 
              onClick={() => setActiveScreen('admin-dashboard')}
              className="bg-transparent border border-border text-ink rounded-lg py-2.5 px-5 text-sm font-bold hover:bg-panel-alt transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={() => setActiveScreen('admin-pod-review')}
              className="bg-amber text-white rounded-lg py-2.5 px-5 text-sm font-bold hover:bg-[#2450C4] transition-all cursor-pointer shadow-md"
            >
              Run matching engine
            </button>
          </div>
        </div>
  );
}
