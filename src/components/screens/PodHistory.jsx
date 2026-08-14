import React from 'react';

export default function PodHistory({
  currentPod,
  userPod,
  isCreator,
  podHistory,
  deletePod,
  leavePod,
  showConfirm,
  setActiveScreen
}) {
  return (
    <div className="pad py-12 px-6 md:px-8 text-left ">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Profile / My Pods</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-6">My Pods</h3>

      <div className="space-y-6 max-w-[560px] text-left">
        {/* Active Pod Section */}
        {currentPod ? (
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4 gap-4 flex-wrap sm:flex-nowrap">
              <div className="flex flex-col text-left">
                <h4 className="font-display font-extrabold text-lg text-ink leading-tight mb-1">
                  {currentPod.name}
                </h4>
                <span className={`border text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider w-fit ${userPod.status === 'ACTIVE'
                  ? 'bg-[#EAFDF8] text-sage border-sage/10'
                  : userPod.status === 'UNDER_REVIEW'
                    ? 'bg-amber-soft/20 text-amber border-amber/10'
                    : userPod.status === 'REJECTED'
                      ? 'bg-red-50 text-rust border-red-100'
                      : 'bg-slate-50 text-ink-dim border-border'
                  }`}>
                  {userPod.status === 'ACTIVE' ? 'Active' : userPod.status === 'UNDER_REVIEW' ? 'Under Review' : userPod.status === 'REJECTED' ? 'Flagged' : 'Setup'}
                </span>
              </div>
              <img src={currentPod.photo} className="w-[84px] h-[58px] object-cover rounded-lg border border-border" alt={currentPod.name} />
            </div>

            <p className="text-ink-dim text-sm leading-relaxed mb-6">
              {currentPod.location} · {currentPod.members.length + 1} members · Avg. readiness {currentPod.avgReadiness}
            </p>

            <div className="flex gap-3">
              {userPod.status === 'ACTIVE' ? (
                <button
                  onClick={() => setActiveScreen('commons-dashboard')}
                  className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold hover:bg-panel-alt transition-colors cursor-pointer"
                >
                  View Pod
                </button>
              ) : userPod.status === 'CREATING' ? (
                isCreator ? (
                  <button
                    onClick={() => setActiveScreen('pod-invite')}
                    className="bg-ink hover:bg-ink/90 text-white rounded-lg py-2 px-4 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Manage Group
                  </button>
                ) : (
                  <span className="text-xs text-ink-dim font-bold py-2">Waiting for Admin setup...</span>
                )
              ) : userPod.status === 'UNDER_REVIEW' ? (
                isCreator ? (
                  <button
                    onClick={() => setActiveScreen('pod-pending')}
                    className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold hover:bg-panel-alt transition-colors cursor-pointer"
                  >
                    Check Review Status
                  </button>
                ) : (
                  <span className="text-xs text-ink-dim font-bold py-2">Under review...</span>
                )
              ) : null}
              {isCreator ? (
                <button
                  onClick={() => {
                    showConfirm(
                      'Dissolve Pod Group',
                      'Are you sure you want to delete/dissolve this Pod? This will remove all members and invitations, returning everyone to the matching pool.',
                      deletePod,
                      'danger',
                      'Dissolve Pod'
                    );
                  }}
                  className="bg-transparent border border-rust text-rust rounded-lg py-2 px-4 text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Delete Pod
                </button>
              ) : (
                <button
                  onClick={() => {
                    showConfirm(
                      'Leave Pod Group',
                      'Are you sure you want to leave this Pod? You will be returned to the matching pool.',
                      leavePod,
                      'danger',
                      'Leave Pod'
                    );
                  }}
                  className="bg-transparent border border-rust text-rust rounded-lg py-2 px-4 text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Leave Pod
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-2xl p-8 bg-white shadow-sm flex flex-col text-left">
            <h4 className="font-display font-extrabold text-lg text-ink mb-2">You're not in a Pod right now</h4>
            <p className="text-ink-dim text-sm leading-relaxed mb-6">
              Ready to find a new match? BOMA will compare your readiness profile against the current pool.
            </p>
            <button
              onClick={() => setActiveScreen('matching-status')}
              className="bg-amber text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer w-fit"
            >
              Find a new Pod
            </button>
          </div>
        )}

        {/* History Section */}
        {podHistory.length > 0 && (
          <div className="mt-8 flex flex-col">
            <div className="font-mono text-[11px] uppercase tracking-wider text-ink-dim mb-3 font-semibold">
              Past Pods
            </div>
            <div className="border border-border rounded-2xl p-5 bg-white shadow-sm space-y-4">
              {podHistory.map((hist, idx) => (
                <div key={idx} className="flex justify-between items-center gap-3 border-b border-border/70 last:border-b-0 pb-3.5 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display border border-border">
                      P
                    </div>
                    <div className="flex flex-col">
                      <b className="text-sm font-bold text-ink leading-tight">Pod #{(hist.id || '').substring(0, 8)}</b>
                      <span className="text-[11.5px] text-ink-dim font-medium mt-0.5">Left {hist.when}</span>
                    </div>
                  </div>
                  <span className="bg-red-50 text-rust border border-rust/10 text-[10.5px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                    Left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
