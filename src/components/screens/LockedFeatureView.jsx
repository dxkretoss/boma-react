import React from 'react';
import { Lock, AlertCircle, Sparkles, Users, Settings, FileText, MessageSquare, Edit3, Check } from 'lucide-react';

function SearchIcon(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function LockedFeatureView({ screenId, currentUser, onStartOnboarding, onReturnToHub, onGoToReview }) {
  const isUnderReview = currentUser?.profile_status === 'UNDER_REVIEW';
  const isRejected = currentUser?.profile_status === 'REJECTED';

  if (isUnderReview) {
    return (
      <div className="pad max-w-[640px] mx-auto text-center py-16 px-6">
        <div className="w-16 h-16 rounded-[20px] bg-teal-soft text-teal inline-flex items-center justify-center text-3xl mb-5 shadow-lg shadow-teal/20 border border-teal/10">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="font-mono text-[11px] uppercase tracking-wider text-teal mb-2.5 font-bold justify-center flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" /> Under Review
        </div>

        <h2 className="font-display text-[30px] font-extrabold text-ink mb-3.5 leading-none">
          Access Pending Approval
        </h2>

        <p className="text-ink-dim text-[15px] leading-relaxed max-w-[500px] mx-auto mb-8">
          Your profile is currently under review by our admin team. Matching pool features and Pod Commons workspaces will unlock immediately upon approval.
        </p>

        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={onGoToReview}
            className="bg-amber text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer"
          >
            Check Review Status
          </button>
          <button
            onClick={onReturnToHub}
            className="bg-transparent border border-border text-ink font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-panel-alt transition-all cursor-pointer"
          >
            Return to Learning Hub
          </button>
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="pad max-w-[640px] mx-auto text-center py-16 px-6">
        <div className="w-16 h-16 rounded-[20px] bg-red-100 text-rust inline-flex items-center justify-center text-3xl mb-5 shadow-lg border border-red-200">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="font-mono text-[11px] uppercase tracking-wider text-rust mb-2.5 font-bold justify-center flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" /> Needs Attention
        </div>

        <h2 className="font-display text-[30px] font-extrabold text-rust mb-3.5 leading-none">
          Action Required on Profile
        </h2>

        <p className="text-ink-dim text-[15px] leading-relaxed max-w-[500px] mx-auto mb-6">
          Your onboarding profile was reviewed and needs updates based on admin feedback. Access is locked until you update and resubmit.
        </p>

        <div className="w-full bg-[#FFF5F5] border border-red-100 rounded-xl p-4 text-left mb-8 max-w-[500px] mx-auto">
          <b className="block text-xs font-mono uppercase tracking-wider text-rust mb-1.5 font-bold">Feedback from BOMA Admin</b>
          <p className="text-xs text-ink font-medium leading-relaxed">
            {currentUser?.rejection_reason || 'Please provide more details on your lifestyle and values.'}
          </p>
        </div>

        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={onGoToReview}
            className="bg-rust text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
          >
            Update &amp; Resubmit Profile
          </button>
          <button
            onClick={onReturnToHub}
            className="bg-transparent border border-border text-ink font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-panel-alt transition-all cursor-pointer"
          >
            Return to Learning Hub
          </button>
        </div>
      </div>
    );
  }

  const metaTitles = {
    'profile-update': { title: 'Unlock Edit Profile', icon: Edit3, desc: 'Complete your 9 onboarding questions to calculate your readiness score and update your profile.' },
    'profile-edit': { title: 'Unlock Edit Preferences', icon: Settings, desc: 'Complete your 9 onboarding questions to calculate your readiness score and edit your preferences.' },
    'matching-status': { title: 'Unlock Pod Matching Engine', icon: SearchIcon, desc: 'Complete your 9 onboarding questions to enter the matching pool and find compatible neighbor Pods.' },
    'pod-suggestion': { title: 'Unlock Pod Match Suggestions', icon: Sparkles, desc: 'BOMA calculates lifestyle & location compatibility scores before presenting Pod suggestions.' },
    'pod-preview': { title: 'Unlock Pod Preview', icon: Users, desc: 'View member compatibility scores and Pod details by finishing your profile questions.' },
    'confirm-join': { title: 'Unlock Pod Confirmation', icon: Check, desc: 'Complete your onboarding questions to confirm joining an aligned Pod.' },
    'commons-dashboard': { title: 'Unlock The Pod Commons', icon: HomeIcon, desc: 'The Commons workspace, member directory, agreement scaffolding, and Pod chat unlock after onboarding.' },
    'commons-members': { title: 'Unlock Pod Member Overview', icon: Users, desc: 'See your Pod members\' readiness profiles once your profile is completed.' },
    'commons-agreement': { title: 'Unlock Agreement Scaffolding', icon: FileText, desc: 'Collaborate on working governance drafts after completing your onboarding profile.' },
    'commons-chat': { title: 'Unlock Pod Chat', icon: MessageSquare, desc: 'Connect and chat with your Pod members once your profile questionnaire is complete.' },
    'commons-settings': { title: 'Unlock Pod Settings', icon: Settings, desc: 'Pod configuration and notification options unlock after completing onboarding.' },
    'readiness-detail': { title: 'Unlock Readiness Score Breakdown', icon: Lock, desc: 'Your rules-based readiness score and category breakdown calculate after completing onboarding.' }
  };

  const meta = metaTitles[screenId] || { title: 'Unlock Feature', icon: Lock, desc: 'Complete your onboarding questions to unlock this feature.' };
  const IconComponent = meta.icon;

  return (
    <div className="pad max-w-[640px] mx-auto text-center py-16 px-6">
      <div className="w-16 h-16 rounded-[20px] bg-amber-soft text-amber inline-flex items-center justify-center text-3xl mb-5 shadow-lg shadow-amber/20 border border-amber/10">
        <IconComponent className="w-7 h-7" />
      </div>

      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-2.5 font-bold justify-center flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5" /> Locked Feature
      </div>

      <h2 className="font-display text-[30px] font-extrabold text-ink mb-3.5 leading-none">
        {meta.title}
      </h2>

      <p className="text-ink-dim text-[15px] leading-relaxed max-w-[500px] mx-auto mb-8">
        {meta.desc}
      </p>

      {/* Blurred Teaser Card */}
      <div className="relative border border-border rounded-2xl p-6 bg-white overflow-hidden mb-8 shadow-sm">
        <div className="blur-[3.5px] opacity-40 pointer-events-none text-left">
          <div className="flex gap-3.5 items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-300"></div>
            <div className="flex-1">
              <div className="h-3 w-[60%] bg-slate-300 rounded mb-1.5"></div>
              <div className="h-2.5 w-[40%] bg-slate-200 rounded"></div>
            </div>
            <div className="h-6 w-12 bg-blue-300 rounded-full"></div>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded mb-3"></div>
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
            <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
          </div>
        </div>

        {/* Overlay lock label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px] p-5">
          <span className="font-mono text-[11.5px] font-bold text-amber uppercase tracking-wider mb-1.5">
            Profile Completion Required
          </span>
          <span className="text-[13.5px] font-bold text-ink">
            9 Questions · ~8 Minutes · Zero Financial Obligation
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-center flex-wrap">
        <button
          onClick={onStartOnboarding}
          className="bg-amber text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer"
        >
          Complete Onboarding Profile (~8 min) →
        </button>
        <button
          onClick={onReturnToHub}
          className="bg-transparent border border-border text-ink font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-panel-alt transition-all cursor-pointer"
        >
          Return to Learning Hub
        </button>
      </div>
    </div>
  );
}

export function MemberWaitingView({ pod, currentUser, setActiveScreen }) {
  const isProfileComplete = currentUser?.onboarding_status === 'COMPLETED' || currentUser?.user_onboarded === true;
  return (
    <div className="max-w-[500px] mx-auto py-16 px-6 text-center animate-fade text-left">
      <div className="w-16 h-16 rounded-2xl bg-teal-soft text-teal flex items-center justify-center mx-auto mb-6">
        <Users className="w-8 h-8" />
      </div>
      <h3 className="font-display font-extrabold text-[22px] text-ink mb-1 text-center">
        {pod?.name || 'Oak Grove Community'}
      </h3>
      <span className="font-mono text-[10.5px] uppercase tracking-wider text-amber font-bold block mb-4 text-center">
        Group Member Joined
      </span>

      {pod?.status === 'CREATING' && (
        <div className="space-y-4">
          <p className="text-ink-dim text-sm leading-relaxed text-center">
            The group coordinator is currently inviting members and finalizing details. Once all members join and complete onboarding, the Pod will be submitted for review.
          </p>
          {!isProfileComplete ? (
            <div className="bg-amber-soft/30 border border-amber/20 rounded-xl p-4.5 text-left mb-6">
              <h4 className="text-xs font-bold text-teal mb-1">Action Required</h4>
              <p className="text-ink-dim text-[11.5px] leading-relaxed">
                You have not completed your BOMA onboarding profile questionnaire. Please complete it now to help the group qualify for review.
              </p>
              <button
                onClick={() => setActiveScreen('onboarding-age')}
                className="mt-3 bg-ink hover:bg-[#2450C4] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm cursor-pointer"
              >
                Complete Profile
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-sage/10 rounded-xl p-4 text-left">
              <span className="text-xs text-sage font-bold">✓ Profile Complete</span>
              <p className="text-ink-dim text-[11px] leading-relaxed mt-0.5">
                Your profile details and readiness score are synced. Waiting for other members.
              </p>
            </div>
          )}
        </div>
      )}

      {pod?.status === 'UNDER_REVIEW' && (
        <div className="space-y-4">
          <p className="text-ink-dim text-sm leading-relaxed text-center">
            The group coordinator has submitted the Pod. It is currently under verification by the BOMA board.
          </p>
          <div className="bg-blue-50 border border-blue-200/40 rounded-xl p-4 text-left">
            <span className="text-xs text-teal font-bold">Under Review</span>
            <p className="text-ink-dim text-[11px] leading-relaxed mt-0.5">
              Administrators are checking membership statuses and readiness logs. You will be notified once approved.
            </p>
          </div>
        </div>
      )}

      {pod?.status === 'REJECTED' && (
        <div className="space-y-4">
          <p className="text-ink-dim text-sm leading-relaxed text-center">
            The Pod submission was rejected or flagged by administrators.
          </p>
          {pod.rejection_reason && (
            <div className="bg-red-50 border border-red-200/40 rounded-xl p-4 text-left">
              <span className="text-xs text-rust font-bold">Feedback / Reason</span>
              <p className="text-ink-dim text-[11px] leading-relaxed mt-0.5">
                {pod.rejection_reason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
