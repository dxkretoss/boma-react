import React from 'react';
import { Check } from 'lucide-react';

export function PodSuggestion({
  suggestedPod,
  setActiveScreen
}) {
  return (
    <div className="pad py-12 px-6 md:px-8 text-left">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Match Found</div>
      <h1 className="font-display text-[26px] font-extrabold text-ink mb-5 leading-tight">We found a Pod for you</h1>

      <div className="border border-border rounded-2xl p-6 bg-white shadow-custom max-w-[560px] text-left">
        <div className="flex items-center gap-3.5 mb-4.5">
          <div className="flex -space-x-2">
            {suggestedPod.members.map((m, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[11px] font-display border-2 border-white"
              >
                {(m.name || 'U').substring(0, 1).toUpperCase()}
              </div>
            ))}
          </div>
          <h4 className="font-display font-extrabold text-[17px] text-ink leading-tight">
            {suggestedPod.name} — {suggestedPod.members.length + 1} members
          </h4>
        </div>

        <div className="flex gap-2 flex-wrap mb-4.5">
          {suggestedPod.tags.map((tag, i) => (
            <span key={i} className="bg-amber-soft text-amber text-xs font-bold px-3 py-1 rounded-full border border-amber/10">
              {tag}
            </span>
          ))}
        </div>

        <div className="bg-slate-50 border border-border/60 rounded-xl p-3.5 mb-5 space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-ink-dim font-mono uppercase tracking-wider font-semibold">Match Origin</span>
            <span className="text-ink font-bold font-mono">
              {suggestedPod.id ? 'BOMA MATCHING ENGINE' : 'BOMA MATCHING ENGINE (SIMULATION)'}
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-ink-dim font-mono uppercase tracking-wider font-semibold">Created By</span>
            <span className="text-ink font-bold">
              {suggestedPod.id ? 'BOMA Algorithmic Matching Engine' : 'BOMA Algorithmic Matching Simulator'}
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-ink-dim font-mono uppercase tracking-wider font-semibold">Approval Status</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider border ${suggestedPod.id
              ? 'bg-emerald-50 text-sage border-sage/10'
              : 'bg-amber-soft text-amber border-amber/10'
              }`}>
              {suggestedPod.id ? 'BOARD APPROVED' : 'PENDING USER CONFIRMATION'}
            </span>
          </div>
          <p className="text-[11px] text-ink-dim leading-relaxed border-t border-border/50 pt-2 mt-1">
            {suggestedPod.id
              ? 'This is a real matching suggestion approved by BOMA administrators. Click View Pod to inspect compatibility scores and join this group to activate the Pod.'
              : 'This is a simulated matching suggestion. Click View Pod to inspect compatibility scores and join this group to activate the Pod.'
            }
          </p>
        </div>

        {/* Matching alignment score */}
        <div className="flex items-center gap-3.5 mb-2.5">
          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-amber" style={{ width: `${suggestedPod.matchPct}%` }} />
          </div>
          <span className="font-mono text-sm font-bold text-ink leading-none">
            {suggestedPod.matchPct}%
          </span>
        </div>

        <p className="text-[12.5px] text-ink-dim font-medium italic mb-6">
          Overall alignment with your readiness profile
        </p>

        <button
          onClick={() => setActiveScreen('pod-preview')}
          className="bg-amber text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer w-full text-center"
        >
          View Pod
        </button>
      </div>
    </div>
  );
}

export function PodPreview({
  suggestedPod,
  declineMatch,
  handleAcceptSuggestedPod,
  setActiveScreen
}) {
  return (
    <div className="pad py-12 px-6 md:px-8 text-left ">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Matching / Pod Preview</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-5 leading-tight">
        {suggestedPod.name}
      </h3>

      <div className="border border-border rounded-2xl p-5 bg-white shadow-sm max-w-[560px] space-y-4 text-left">
        {suggestedPod.members.map((m, idx) => (
          <div key={idx} className="flex justify-between items-center gap-3 border-b border-border/70 last:border-b-0 pb-3.5 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display border border-border">
                {(m.name || 'U').substring(0, 1).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <b className="text-sm font-bold text-ink leading-tight">{m.name}</b>
                <span className="text-[11.5px] text-ink-dim font-semibold mt-0.5">{m.detail}</span>
              </div>
            </div>
            <span className="bg-[#EAFDF8] text-sage border border-sage/10 text-[11px] font-bold px-2.5 py-0.5 rounded">
              {m.score}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3.5 mt-6">
        <button
          onClick={declineMatch}
          className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer"
        >
          Decline
        </button>
        <button
          onClick={handleAcceptSuggestedPod}
          className="bg-amber text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer"
        >
          Join Pod
        </button>
      </div>
    </div>
  );
}

export function ConfirmJoin({
  suggestedPod,
  userPod,
  podMembersList,
  matchingLoading,
  declineMatch,
  handleRefreshPodStatus,
  setActiveScreen
}) {
  return (
    <div className="max-w-[500px] mx-auto text-center py-16 animate-fade">
      <div className="w-full bg-white border border-border rounded-2xl p-10 shadow-custom flex flex-col items-center">

        <div className="w-12 h-12 rounded-xl bg-amber-soft text-amber flex items-center justify-center mb-4">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>

        <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-bold">
          {userPod?.status === 'ACTIVE' ? "You're In" : "Pod Confirmation"}
        </div>

        <h1 className="font-display text-[24px] font-extrabold text-ink mb-3 leading-tight">
          {userPod?.status === 'ACTIVE' ? `Welcome to ${suggestedPod.name}` : suggestedPod.name}
        </h1>

        <p className="text-ink-dim text-sm leading-relaxed mb-6 max-w-[360px]">
          {userPod?.status === 'ACTIVE'
            ? "Your Pod is now active. Head to the Commons to meet your neighbors."
            : "You've accepted this Pod match suggestion. We are waiting for other proposed members to accept and confirm."
          }
        </p>

        {/* Display confirmations list */}
        {userPod?.status !== 'ACTIVE' && podMembersList.length > 0 && (
          <div className="w-full bg-slate-50 border border-border/60 rounded-xl p-4 mb-6 space-y-2.5 text-left">
            <span className="font-mono text-[9px] uppercase tracking-wider text-ink-dim font-bold block mb-1">
              Member Confirmations
            </span>
            {podMembersList.map((m, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-navy-deep text-white font-extrabold text-[8px] flex items-center justify-center">
                    {(m.name || 'U').substring(0, 1).toUpperCase()}
                  </div>
                  <span className="font-semibold text-ink">{m.name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${m.membership_status === 'ACCEPTED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : m.membership_status === 'DECLINED'
                    ? 'bg-red-50 text-red-700 border border-red-100'
                    : 'bg-amber-soft text-amber border border-amber/10'
                  }`}>
                  {m.membership_status === 'ACCEPTED' ? 'Accepted' : m.membership_status === 'DECLINED' ? 'Declined' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}

        {userPod?.status === 'ACTIVE' ? (
          <button
            onClick={() => setActiveScreen('commons-dashboard')}
            className="bg-amber text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer w-full text-center"
          >
            Enter the Commons
          </button>
        ) : (
          <div className="flex gap-3 w-full">
            <button
              onClick={declineMatch}
              className="bg-transparent border border-border text-ink font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Decline Match
            </button>
            <button
              onClick={handleRefreshPodStatus}
              disabled={matchingLoading}
              className="flex-1 bg-amber text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {matchingLoading && <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />}
              Refresh Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
