import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PodCreate({ podRegName, setPodRegName, podRegDescription, setPodRegDescription, podRegType, setPodRegType, setActiveScreen }) {
  return (
    <div className="max-w-[480px] mx-auto">
          <div className="w-full p-8 border border-border rounded-2xl bg-white shadow-custom flex flex-col text-left select-none">
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1.5 font-bold">Register an Existing Pod</div>
            <h3 className="font-display font-extrabold text-[22px] text-ink mb-6">
              Set up your group
            </h3>

            <div className="mb-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Pod name</label>
              <input 
                type="text"
                value={podRegName}
                onChange={(e) => setPodRegName(e.target.value)}
                placeholder="The Fourplex Founders" 
                className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium" 
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">What are you building together?</label>
              <textarea 
                value={podRegDescription}
                onChange={(e) => setPodRegDescription(e.target.value)}
                placeholder="4 friends buying a fourplex in East Austin" 
                rows="3"
                className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium resize-none"
              ></textarea>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold font-semibold">Group type</label>
              <select 
                value={podRegType}
                onChange={(e) => setPodRegType(e.target.value)}
                className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber cursor-pointer font-semibold"
              >
                <option value="Friends">Friends</option>
                <option value="Family">Family</option>
                <option value="Small development group">Small development group</option>
                <option value="Tiny-home village organizers">Tiny-home village organizers</option>
                <option value="Workforce housing / nonprofit">Workforce housing / nonprofit</option>
              </select>
            </div>

            <div className="flex items-center gap-3.5">
              <button 
                onClick={() => setActiveScreen('entry-path')}
                className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={() => setActiveScreen('pod-invite')}
                className="flex-1 bg-ink text-white rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-[#2450C4] hover:-translate-y-[1px] transition-all cursor-pointer shadow-md text-center"
              >
                Create Pod
              </button>
            </div>
          </div>
        </div>
  );
}
