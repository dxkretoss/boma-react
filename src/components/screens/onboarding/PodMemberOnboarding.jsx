import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PodMemberOnboarding({ setActiveScreen }) {
  return (
    <div className="max-w-[660px] mx-auto select-none">
          <div className="w-full bg-white border border-border rounded-2xl p-8 shadow-custom">
            <div className="text-xs font-mono uppercase tracking-wider text-ink-dim font-bold mb-1.5">
              Short Onboarding — For Existing Pod Members
            </div>
            
            <div className="mb-4 text-left">
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2 font-semibold">Primary housing intent</label>
              <select className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber cursor-pointer font-semibold">
                <option>Co-develop property</option>
                <option>Purchase primary residence</option>
                <option>Investment hold</option>
              </select>
            </div>

            <div className="mb-4 text-left">
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2 font-semibold">Minimum commitment timeline</label>
              <select className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber cursor-pointer font-semibold">
                <option>2+ years</option>
                <option>5+ years</option>
                <option>Flexible</option>
              </select>
            </div>

            <p className="text-xs text-ink-dim font-medium italic mb-6 text-left">
              Location and matching questions are skipped — your group is already formed.
            </p>

            <div className="flex items-center gap-3.5">
              <button 
                onClick={() => setActiveScreen('pod-invite')}
                className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={() => setActiveScreen('pod-review')}
                className="bg-ink text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
  );
}
