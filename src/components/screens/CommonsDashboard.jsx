import React from 'react';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Settings, 
  Clock, 
  Sparkles, 
  Plus, 
  ArrowRight,
  Shield,
  Home
} from 'lucide-react';

export default function CommonsDashboard({
  currentPod,
  userPod,
  setActiveScreen
}) {
  const isPodForming = userPod?.status === 'CREATING';
  const isPodUnderReview = userPod?.status === 'UNDER_REVIEW';

  return (
    <div className="pad py-12 px-6 md:px-8 text-left animate-fade">
      {/* Active Pod Banner Card */}
      {currentPod ? (
        <div className="relative w-full rounded-2xl overflow-hidden h-[240px] mb-6 shadow-custom border border-border/5">
          <img src={currentPod.photo || 'assets/pod_austin.png'} className="w-full h-full object-cover" alt={currentPod.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/40 to-transparent p-6 md:p-8 flex items-end text-left ">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10.5px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider border border-white/20">
                  {userPod?.group_type || 'Self-Registered Group'}
                </span>
                <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider border ${
                  userPod?.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : isPodUnderReview
                      ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                      : 'bg-teal-500/20 text-teal-200 border-teal-500/40'
                }`}>
                  {userPod?.status === 'ACTIVE' ? 'Active in Commons' : isPodUnderReview ? 'Under Board Review' : 'Forming & Inviting'}
                </span>
              </div>
              <h1 className="font-display font-extrabold text-[26px] md:text-[32px] text-white leading-tight mb-1">
                {currentPod.name}
              </h1>
              <span className="text-[13px] text-[#A3B3C8] font-semibold">
                {currentPod.location} · Formed {currentPod.formed}
              </span>
            </div>
          </div>
        </div>
      ) : isPodUnderReview ? (
        <div className="border border-border rounded-2xl p-8 bg-white shadow-sm flex flex-col items-center justify-center text-center py-14 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-soft text-amber flex items-center justify-center mb-4 animate-pulse">
            <Clock className="w-6 h-6 text-amber" />
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-wider text-amber font-bold mb-2">
            Status: Under Review (Pending Board Approval)
          </div>
          <h2 className="font-display font-extrabold text-xl text-ink mb-2">
            Proposed Pod: {userPod?.name || 'My Pod Group'}
          </h2>
          <p className="text-ink-dim text-xs leading-relaxed mb-6 max-w-[420px]">
            Your potential pod match is currently pending administrator verification. The Commons workspace and Pod chat will activate as soon as the Board approves the match.
          </p>
          <button
            onClick={() => setActiveScreen('pod-pending')}
            className="bg-amber text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm hover:bg-[#b05d3e] transition-all cursor-pointer"
          >
            Check Match Status →
          </button>
        </div>
      ) : (
        <div className="border border-border rounded-2xl p-8 bg-white shadow-sm flex flex-col items-center justify-center text-center py-14 mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-soft text-teal flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-teal" />
          </div>
          <h2 className="font-display font-extrabold text-xl text-ink mb-2">No Active Pod Joined</h2>
          <p className="text-ink-dim text-xs leading-relaxed mb-6 max-w-[380px]">
            Once you join or create a Pod, The Commons becomes your shared planning space for agreements, member communication, and Pod governance.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveScreen('pod-create')}
              className="bg-amber text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm hover:bg-[#b05d3e] transition-all cursor-pointer"
            >
              Create Existing Pod →
            </button>
            <button
              onClick={() => setActiveScreen('matching-status')}
              className="bg-transparent border border-border text-ink font-bold text-xs px-5 py-2.5 rounded-full hover:bg-panel-alt transition-colors cursor-pointer"
            >
              Explore Matching Pool
            </button>
          </div>
        </div>
      )}

      {/* Pod Forming Notification & Quick Actions Banner */}
      {currentPod && isPodForming && (
        <div className="mb-6 p-5 rounded-2xl bg-amber-soft/30 border border-amber/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber/15 text-amber flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-ink font-mono uppercase tracking-wider">
                Pod Group is Forming
              </span>
              <span className="text-xs text-ink-dim leading-relaxed max-w-[540px] mt-0.5">
                Invite remaining co-owners and friends to join your group. You can already start drafting your consensus agreements below.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveScreen('pod-invite')}
              className="bg-amber hover:bg-[#b05d3e] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Invite Members
            </button>
            <button
              onClick={() => setActiveScreen('pod-history')}
              className="bg-white hover:bg-panel border border-border text-ink text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              View Roster
            </button>
          </div>
        </div>
      )}

      {/* KPIs */}
      {currentPod && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[26px] font-extrabold text-ink leading-tight">
              {(currentPod.members?.length || 0) + 1}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Members</div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className="font-display text-[26px] font-extrabold text-ink leading-tight">
              {currentPod.avgReadiness || 85}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Avg. Readiness</div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
            <div className={`font-display text-[26px] font-extrabold leading-tight ${isPodForming ? 'text-amber' : 'text-sage'}`}>
              {currentPod.health || 'Stable'}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Pod Status</div>
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
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-2 text-ink">
                <Users className="w-5 h-5 text-teal" />
                <h4 className="font-display font-extrabold text-base text-ink">Member overview</h4>
              </div>
              <p className="text-ink-dim text-sm leading-relaxed mb-4">
                See who's in your Pod, their readiness statuses, and confirmed roles.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('commons-members')}
              className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2 flex items-center gap-1.5"
            >
              View members <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Box 2: Agreement */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-2 text-ink">
                <FileText className="w-5 h-5 text-amber" />
                <h4 className="font-display font-extrabold text-base text-ink">Agreement scaffolding</h4>
              </div>
              <p className="text-ink-dim text-sm leading-relaxed mb-4">
                Start shaping how your Pod will make decisions and structure co-living governance.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('commons-agreement')}
              className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2 flex items-center gap-1.5"
            >
              Open agreement <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Box 3: Chat */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-2 text-ink">
                <MessageSquare className="w-5 h-5 text-gold" />
                <h4 className="font-display font-extrabold text-base text-ink">Pod chat</h4>
              </div>
              <p className="text-ink-dim text-sm leading-relaxed mb-4">
                Connect, brainstorm, and align with your Pod members in real-time.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('commons-chat')}
              className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2 flex items-center gap-1.5"
            >
              Open chat <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Box 4: Settings */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-2 text-ink">
                <Settings className="w-5 h-5 text-ink-dim" />
                <h4 className="font-display font-extrabold text-base text-ink">Pod settings</h4>
              </div>
              <p className="text-ink-dim text-sm leading-relaxed mb-4">
                Manage notifications, member permissions, or leave/dissolve the Pod.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('commons-settings')}
              className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2 flex items-center gap-1.5"
            >
              Open settings <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
