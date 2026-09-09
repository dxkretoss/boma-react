import React from 'react';
import { Users, Plus, ArrowLeft, Shield, Mail, CheckCircle2 } from 'lucide-react';
import Avatar from '../Avatar';

export default function CommonsMembers({
  currentPod,
  userPod,
  isCreator,
  podMembersList = [],
  currentUser,
  setActiveScreen
}) {
  const isUserAdmin = Boolean(
    isCreator ||
    userPod?.created_by === currentUser?.id ||
    userPod?.memberRole === 'CREATOR' ||
    podMembersList.some(m => m.userId === currentUser?.id && m.role === 'CREATOR')
  );

  const otherMembers = currentPod?.members || [];
  const hasOtherMembers = otherMembers.length > 0;

  return (
    <div className="pad py-12 px-6 md:px-8 text-left animate-fade">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">
        The Commons / Members
      </div>
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h3 className="font-serif font-extrabold text-2xl text-ink leading-tight">
            Member overview
          </h3>
          <p className="text-xs text-ink-dim mt-0.5">
            Confirmed members in <strong className="text-ink">{currentPod?.name || userPod?.name || 'this Pod'}</strong>.
          </p>
        </div>

        {isUserAdmin && userPod?.status !== 'ACTIVE' && (
          <button
            onClick={() => setActiveScreen('pod-invite')}
            className="bg-amber hover:bg-[#b05d3e] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Invite Members
          </button>
        )}
      </div>

      <div className="border border-border rounded-2xl p-6 bg-white shadow-sm max-w-[600px] text-left">
        <div className="space-y-3.5">
          {/* Current User (You) */}
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar user={currentUser} className="w-10 h-10 shadow-sm border border-border shrink-0" textClass="text-sm" />
              <div className="flex flex-col min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <b className="text-sm font-bold text-ink leading-tight truncate">{currentUser?.name || 'User'}</b>
                  <span className="bg-amber/15 text-amber text-[9.5px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                    You
                  </span>
                </div>
                <span className="text-[11.5px] text-ink-dim font-medium mt-0.5 truncate">
                  Joined {userPod?.created_at ? new Date(userPod.created_at).toLocaleDateString() : 'today'}
                </span>
              </div>
            </div>
            <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded font-mono uppercase tracking-wider border shrink-0 ${
              isUserAdmin
                ? 'bg-amber-soft text-amber border-amber/20'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isUserAdmin ? 'Admin' : 'Co-Member'}
            </span>
          </div>

          {/* Other Confirmed Pod Members */}
          {hasOtherMembers && otherMembers.map((m, idx) => (
            <div key={idx} className="flex justify-between items-center gap-3 pt-3.5 border-t border-border/70">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar user={m} className="w-10 h-10 shadow-sm border border-border shrink-0" textClass="text-sm" />
                <div className="flex flex-col min-w-0 text-left">
                  <b className="text-sm font-bold text-ink leading-tight truncate">{m.name}</b>
                  <span className="text-[11.5px] text-ink-dim font-medium mt-0.5 truncate">
                    Joined {m.joined || currentPod?.formed || 'Recently'} · {m.detail?.split(' · ')[0] || 'Member'}
                  </span>
                </div>
              </div>
              <span className="bg-[#EAFDF8] text-sage border border-sage/10 text-[10.5px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider font-mono shrink-0">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setActiveScreen('commons-dashboard')}
        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </button>
    </div>
  );
}
