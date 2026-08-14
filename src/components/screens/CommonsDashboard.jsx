import React from 'react';
import { Users, FileText, MessageSquare, Settings } from 'lucide-react';

export default function CommonsDashboard({
  currentPod,
  setActiveScreen
}) {
  return (
    <div className="pad py-12 px-6 md:px-8 text-left animate-fade">
      {/* Active Pod Banner Card */}
      {currentPod ? (
        <div className="relative w-full rounded-2xl overflow-hidden h-[240px] mb-6 shadow-custom border border-border/5">
          <img src={currentPod.photo} className="w-full h-full object-cover" alt={currentPod.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/40 to-transparent p-6 md:p-8 flex items-end text-left ">
            <div className="text-white">
              <h1 className="font-display font-extrabold text-[26px] md:text-[32px] text-white leading-tight mb-1">
                {currentPod.name}
              </h1>
              <span className="text-[13px] text-[#A3B3C8] font-semibold">
                {currentPod.location} · Formed {currentPod.formed}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-2xl p-8 bg-white shadow-sm flex flex-col items-center justify-center text-center py-16 mb-6">
          <h2 className="font-display font-extrabold text-lg text-navy-deep mb-2">No active Pod</h2>
          <p className="text-ink-dim text-sm mb-6 max-w-[360px]">Find a new match suggestions in the pool to get started.</p>
          <button onClick={() => setActiveScreen('matching-status')} className="bg-amber text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md hover:bg-[#2450C4] cursor-pointer">
            Find a match
          </button>
        </div>
      )}

      {/* KPIs */}
      {currentPod && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[26px] font-extrabold text-ink leading-tight">
              {currentPod.members.length + 1}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Members</div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[26px] font-extrabold text-ink leading-tight">
              {currentPod.avgReadiness}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Avg. Readiness</div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[26px] font-extrabold text-ink leading-tight text-sage">
              {currentPod.health}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Pod Health</div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[18px] font-extrabold text-ink leading-[32px] overflow-hidden truncate px-1">
              {currentPod.formed}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Formed</div>
          </div>
        </div>
      )}

      {/* Commons Sub sections grid */}
      {currentPod && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Box 1: Members */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-ink">
                <Users className="w-5 h-5" />
                <h4 className="font-display font-extrabold text-base text-ink">Member overview</h4>
              </div>
              <p className="text-ink-dim text-sm leading-relaxed mb-4">
                See who's in your Pod and where they stand.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('commons-members')}
              className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2"
            >
              View members
            </button>
          </div>

          {/* Box 2: Agreement */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-ink">
                <FileText className="w-5 h-5" />
                <h4 className="font-display font-extrabold text-base text-ink">Agreement scaffolding</h4>
              </div>
              <p className="text-ink-dim text-sm leading-relaxed mb-4">
                Start shaping how your Pod will make decisions together.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('commons-agreement')}
              className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2"
            >
              Open agreement
            </button>
          </div>

          {/* Box 3: Chat */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-ink">
                <MessageSquare className="w-5 h-5" />
                <h4 className="font-display font-extrabold text-base text-ink">Pod chat</h4>
              </div>
              <p className="text-ink-dim text-sm leading-relaxed mb-4">
                Connect and align with your Pod members in real-time.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('commons-chat')}
              className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2"
            >
              Open chat
            </button>
          </div>

          {/* Box 4: Settings */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-ink">
                <Settings className="w-5 h-5" />
                <h4 className="font-display font-extrabold text-base text-ink">Pod settings</h4>
              </div>
              <p className="text-ink-dim text-sm leading-relaxed mb-4">
                Manage notifications, or exit the Pod.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('commons-settings')}
              className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2"
            >
              Open settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
