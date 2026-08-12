import React from 'react';
import { ArrowLeft, Star } from 'lucide-react';

export default function EntryPath({ setActiveScreen }) {
  return (
    <div className="w-full">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-7 border-b border-border pb-6">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-semibold">Get Started</div>
              <h1 className="font-display text-[28px] font-extrabold text-ink leading-tight">How would you like to begin?</h1>
            </div>
            <button 
              onClick={() => setActiveScreen('learning')}
              className="bg-transparent border border-border text-ink rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Learning Hub
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="border border-border rounded-custom p-8 bg-white shadow-custom flex flex-col justify-between">
              <div>
                <h4 className="font-display font-extrabold text-lg text-ink mb-2">Join the Matching Pool</h4>
                <p className="text-ink-dim text-sm leading-relaxed mb-6">
                  Create a profile and get matched with aligned neighbors through BOMA's readiness scoring and matching engine.
                </p>
              </div>
              <button 
                onClick={() => setActiveScreen('onboarding-welcome')}
                className="bg-amber text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md hover:bg-[#2450C4] hover:-translate-y-[0.5px] active:scale-95 transition-all cursor-pointer w-fit"
              >
                Join the Matching Pool
              </button>
            </div>
            
            <div className="border border-border rounded-custom p-8 bg-white shadow-custom flex flex-col justify-between">
              <div>
                <h4 className="font-display font-extrabold text-lg text-ink mb-2">Register an Existing Pod</h4>
                <p className="text-ink-dim text-sm leading-relaxed mb-6">
                  Already have your group — friends, family, or a small development team? Register together and skip matching.
                </p>
              </div>
              <button 
                onClick={() => setActiveScreen('pod-create')}
                className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-3 rounded-xl hover:bg-panel-alt transition-all cursor-pointer w-fit"
              >
                Register an Existing Pod
              </button>
            </div>
          </div>
        </div>
  );
}
