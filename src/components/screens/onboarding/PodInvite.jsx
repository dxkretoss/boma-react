import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PodInvite({ podInvites, setPodInvites, setActiveScreen }) {
  return (
    <div className="max-w-[660px] mx-auto select-none">
          <div className="w-full bg-white border border-border rounded-2xl p-8 shadow-custom">
            <h3 className="font-display font-extrabold text-[22px] text-ink mb-3 text-left">Invite your members</h3>
            
            <div className="mb-4 text-left">
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2 font-semibold">Email invites</label>
              <textarea 
                value={podInvites}
                onChange={(e) => setPodInvites(e.target.value)}
                placeholder="sam@email.com, hetherm@email.com, morgan@email.com" 
                rows="4"
                className="w-full bg-panel border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium resize-none"
              ></textarea>
            </div>

            <p className="text-xs text-ink-dim font-medium italic mb-6 text-left">
              Each member will complete a short onboarding once they accept.
            </p>

            <div className="flex items-center gap-3.5">
              <button 
                onClick={() => setActiveScreen('pod-create')}
                className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={() => setActiveScreen('pod-member-onboarding')}
                className="bg-ink text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer"
              >
                Send invites
              </button>
            </div>
          </div>
        </div>
  );
}
