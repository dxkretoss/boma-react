import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PodReview({ podRegName, podRegType, setActiveScreen }) {
  return (
    <div className="max-w-[660px] mx-auto select-none">
          <div className="w-full bg-white border border-border rounded-2xl p-8 shadow-custom">
            <h3 className="font-display font-extrabold text-[22px] text-ink mb-5 text-left">Review submission</h3>
            
            <div className="border border-border rounded-xl bg-white shadow-sm overflow-hidden mb-6">
              <div className="flex justify-between items-center border-b border-border/80 p-4 px-5 text-[13.5px]">
                <b className="text-ink-dim font-semibold">Pod name</b>
                <span className="text-ink font-bold">{podRegName || 'The Fourplex Founders'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/80 p-4 px-5 text-[13.5px]">
                <b className="text-ink-dim font-semibold">Group type</b>
                <span className="text-ink font-bold">{podRegType}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/80 p-4 px-5 text-[13.5px]">
                <b className="text-ink-dim font-semibold">Members onboarded</b>
                <span className="text-ink font-bold">3 of 4</span>
              </div>
              <div className="flex justify-between items-center p-4 px-5 text-[13.5px]">
                <b className="text-ink-dim font-semibold">Status</b>
                <span className="text-ink font-bold">Ready to submit</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <button 
                onClick={() => setActiveScreen('pod-member-onboarding')}
                className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={() => setActiveScreen('pod-pending')}
                className="bg-amber text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer shadow-md"
              >
                Submit for review
              </button>
            </div>
          </div>
        </div>
  );
}
