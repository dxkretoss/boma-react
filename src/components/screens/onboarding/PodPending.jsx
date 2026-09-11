import React from 'react';
import { 
  Clock, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Sparkles,
  Lock,
  FileText,
  UserCheck
} from 'lucide-react';

export default function PodPending({ pod, currentUser, setActiveScreen }) {
  const isCreator = pod 
    ? (pod.created_by === currentUser?.id || pod.memberRole === 'CREATOR' || pod.role === 'CREATOR')
    : true;
  
  const isUnderReview = pod?.status === 'UNDER_REVIEW';
  const isCreating = pod?.status === 'CREATING';
  const podName = pod?.name || 'Your BOMA Pod';
  const memberCount = (pod?.members && pod.members.length > 0) ? pod.members.length : (pod?.membersCount || 2);

  return (
    <div className="max-w-[760px] mx-auto py-10 px-4 animate-fade text-left">
      
      {/* Main Status Container */}
      <div className="bg-white border border-border rounded-3xl p-8 sm:p-10 shadow-custom relative overflow-hidden">
        
        {/* Subtle Decorative Gradient Accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-soft/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-teal-soft/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-soft text-amber flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber font-bold block">
                {isUnderReview ? 'Board Review in Progress' : 'Pod Setup & Invitations'}
              </span>
              <h2 className="font-display font-extrabold text-xl text-ink leading-tight">
                {podName}
              </h2>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-amber-soft/80 text-amber border border-amber/20">
            <span className="w-2 h-2 rounded-full bg-amber animate-ping inline-block" />
            {isUnderReview ? 'Under Review' : 'Forming Roster'}
          </span>
        </div>

        {/* Primary Notification Box */}
        <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-panel border border-border/80 text-left">
          <h3 className="font-display font-extrabold text-lg text-ink mb-2">
            {isUnderReview 
              ? 'Your Created Pod is Under Board Review'
              : 'Pod Setup & Member Invitations in Progress'}
          </h3>
          <p className="text-ink-dim text-sm leading-relaxed mb-4">
            {isUnderReview ? (
              <>
                Your group submission for <strong className="text-ink font-semibold">"{podName}"</strong> has been received and is currently being verified by BOMA administrators. Once approved by the Board, the full <strong className="text-ink font-semibold">Commons Workspace</strong> (Consensus Agreements, Member Directory, and Pod Chat) will unlock right here.
              </>
            ) : isCreator ? (
              <>
                Your Pod <strong className="text-ink font-semibold">"{podName}"</strong> is currently in draft forming mode. Please invite your co-owners or complete your roster to submit the group for Board verification.
              </>
            ) : (
              <>
                You have joined <strong className="text-ink font-semibold">"{podName}"</strong>. The Group Admin is finalizing invitations and will submit the Pod for Board verification.
              </>
            )}
          </p>

          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-ink-dim bg-white/80 p-2.5 rounded-xl border border-border/60">
            <ShieldCheck className="w-4 h-4 text-teal shrink-0" />
            <span>Estimated turnaround: 1–2 business days · Automated notification upon approval</span>
          </div>
        </div>

        {/* Multi-Step Lifecycle Tracker */}
        <div className="mb-8 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider font-bold text-ink-dim">
            Pod Activation Lifecycle
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-sage/20 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-mono uppercase font-bold text-sage">Step 1</span>
                <CheckCircle2 className="w-4 h-4 text-sage" />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-ink mb-0.5">Pod Configured</div>
                <div className="text-[11.5px] text-ink-dim leading-snug">Name, group type &amp; parameters set</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isUnderReview 
                ? 'bg-emerald-50/60 border-sage/20' 
                : 'bg-amber-soft/30 border-amber/25'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10.5px] font-mono uppercase font-bold ${isUnderReview ? 'text-sage' : 'text-amber'}`}>
                  Step 2
                </span>
                {isUnderReview ? (
                  <CheckCircle2 className="w-4 h-4 text-sage" />
                ) : (
                  <Users className="w-4 h-4 text-amber" />
                )}
              </div>
              <div>
                <div className="font-display font-bold text-sm text-ink mb-0.5">
                  {isUnderReview ? 'Roster Confirmed' : 'Invite Members'}
                </div>
                <div className="text-[11.5px] text-ink-dim leading-snug">
                  {memberCount} active co-owner{memberCount > 1 ? 's' : ''} connected
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isUnderReview 
                ? 'bg-amber-soft/40 border-amber/30 ring-2 ring-amber/20' 
                : 'bg-panel-alt/50 border-border/70 opacity-70'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10.5px] font-mono uppercase font-bold ${isUnderReview ? 'text-amber' : 'text-ink-dim'}`}>
                  Step 3
                </span>
                {isUnderReview ? (
                  <Clock className="w-4 h-4 text-amber animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 text-ink-dim" />
                )}
              </div>
              <div>
                <div className="font-display font-bold text-sm text-ink mb-0.5">Board Approval</div>
                <div className="text-[11.5px] text-ink-dim leading-snug">
                  {isUnderReview ? 'Admin review in progress' : 'Awaiting submission'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Lock Preview Card */}
        <div className="mb-8 p-5 rounded-2xl bg-panel-alt/40 border border-border/70 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-ink/5 text-ink flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-5 h-5 text-ink-dim" />
          </div>
          <div className="text-left flex-1">
            <h4 className="font-display font-bold text-sm text-ink mb-1">
              What unlocks after Board Approval?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-dim mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal" /> Consensus Agreement Scaffolding
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal" /> Pod Workspace &amp; Chat
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal" /> Member Readiness Dashboard
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal" /> Co-living Governance Tools
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-border/70">
          <div className="flex items-center gap-2.5 flex-wrap">
            {isCreating && isCreator ? (
              <button
                onClick={() => setActiveScreen('pod-invite')}
                className="bg-amber hover:bg-[#b05d3e] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" /> Manage Roster &amp; Review <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setActiveScreen('pod-history')}
                className="bg-navy-deep hover:bg-navy text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" /> View Pod Details &amp; Roster
              </button>
            )}

            <button
              onClick={() => setActiveScreen('learning')}
              className="bg-white hover:bg-panel border border-border text-ink font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-teal" /> Explore Learning Hub
            </button>
          </div>

          <button
            onClick={() => setActiveScreen('profile')}
            className="text-xs text-ink-dim hover:text-ink font-medium transition-colors cursor-pointer"
          >
            Back to Profile Dashboard →
          </button>
        </div>

      </div>
    </div>
  );
}
