import React from 'react';

export default function CommonsMembers({
  currentPod,
  currentUser,
  setActiveScreen
}) {
  return (
    <div className="pad py-12 px-6 md:px-8 text-left animate-fade">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">The Commons / Members</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-5">Member overview</h3>

      <div className="border border-border rounded-2xl p-5 bg-white shadow-sm max-w-[560px] space-y-4 text-left">
        {currentPod.members.map((m, idx) => (
          <div key={idx} className="flex justify-between items-center gap-3 border-b border-border/70 last:border-b-0 pb-3.5 last:pb-0">
            <div className="flex items-center gap-3">
              {m.avatarUrl ? (
                <img src={m.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-border" alt={m.name} />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display flex-shrink-0 border border-border">
                  {(m.name || 'U').substring(0, 1).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <b className="text-sm font-bold text-ink leading-tight">{m.name}</b>
                <span className="text-[11.5px] text-ink-dim font-medium mt-0.5">Joined {m.joined || currentPod.formed} · {m.detail?.split(' · ')[0] || 'Member'}</span>
              </div>
            </div>
            <span className="bg-[#EAFDF8] text-sage border border-sage/10 text-[10.5px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Active
            </span>
          </div>
        ))}

        {/* Jordan Lee (Me) */}
        <div className="flex justify-between items-center gap-3 pt-3.5 border-t border-border/70">
          <div className="flex items-center gap-3">
            {currentUser?.avatar_url && (currentUser.avatar_url.startsWith('http') || currentUser.avatar_url.startsWith('/') || currentUser.avatar_url.startsWith('assets/') || currentUser.avatar_url.startsWith('data:image/')) ? (
              <img src={currentUser.avatar_url} className="w-10 h-10 rounded-full object-cover border border-border" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display flex-shrink-0">
                {(currentUser?.name || currentUser?.email || 'U').substring(0, 1).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <b className="text-sm font-bold text-ink leading-tight">{currentUser?.name || 'User'} (you)</b>
              <span className="text-[11.5px] text-ink-dim font-medium mt-0.5">Joined today</span>
            </div>
          </div>
          <span className="bg-teal-soft text-teal border border-teal/10 text-[10.5px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
            New
          </span>
        </div>
      </div>

      <button
        onClick={() => setActiveScreen('commons-dashboard')}
        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
      >
        Back to dashboard
      </button>
    </div>
  );
}
