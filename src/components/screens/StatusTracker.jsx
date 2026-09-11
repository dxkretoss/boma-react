import React from 'react';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';

export default function StatusTracker({
  isExistingPod,
  userOnboarded,
  userPod,
  currentUser,
  podHistory,
  setActiveScreen
}) {
  const isProfileRejected = currentUser?.profile_status === 'REJECTED';
  const isPodRejected = userPod?.status === 'REJECTED';

  const steps = isExistingPod
    ? [
      { label: 'Account created & verified', desc: 'Completed', done: true },
      { label: 'Join as existing pool', desc: userPod ? `Created: ${userPod.name} (${userPod.group_type || 'Group'})` : 'Registered as Existing Pool', done: true },
      { label: 'Invited / Joined co-members', desc: userPod ? 'Invite link active' : 'Waiting to invite group', done: true },
      {
        label: 'Submitted group for review',
        desc: userPod?.status === 'UNDER_REVIEW' || userPod?.status === 'ACTIVE'
          ? 'Submitted'
          : isPodRejected
            ? 'Needs Attention (Rejected)'
            : 'Pending submission',
        done: userPod && ['UNDER_REVIEW', 'ACTIVE'].includes(userPod.status),
        isRejected: isPodRejected,
        rejectionReason: userPod?.rejection_reason
      },
      {
        label: 'Admin approved group & activated Commons',
        desc: userPod?.status === 'ACTIVE' ? 'Approved & Commons Activated' : 'Waiting for Board verification',
        done: userPod?.status === 'ACTIVE'
      }
    ]
    : [
      { label: 'Account created & verified', desc: 'Completed', done: true },
      { label: 'Onboarding completed', desc: userOnboarded ? 'Completed' : 'Pending — Complete 9 questions', done: userOnboarded },
      { label: 'Readiness score calculated', desc: userOnboarded ? `Score: ${currentUser?.readiness_score || 82} — Match-Ready` : 'Pending profile completion', done: userOnboarded },
      {
        label: 'Admin review',
        desc: currentUser?.profile_status === 'APPROVED'
          ? 'Approved'
          : isProfileRejected
            ? 'Needs Attention (Rejected)'
            : 'Under Review',
        done: currentUser?.profile_status === 'APPROVED',
        isRejected: isProfileRejected,
        rejectionReason: currentUser?.rejection_reason
      },
      {
        label: 'Pod match suggested',
        desc: userOnboarded ? (userPod ? 'Completed' : 'Not yet started') : 'Locked — Complete profile first',
        done: userOnboarded && !!userPod
      },
      {
        label: 'Pod joined',
        desc: userPod ? `Active in ${userPod.name}` : (podHistory && podHistory.length > 0 ? 'Searching for a new Pod' : 'Not yet started'),
        done: !!userPod
      }
    ];

  return (
    <div className="pad py-12 px-6 md:px-8 text-left animate-fade">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Profile / Status Tracker</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-6">Your journey so far</h3>

      {/* Vertical Timeline */}
      <div className="max-w-[500px] space-y-6 relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border mb-8">
        {steps.map((step, idx) => (
          <div key={idx} className="relative">
            {/* Dot */}
            <div
              className={`absolute left-[-32px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                step.isRejected
                  ? 'bg-red-50 border-rust text-rust shadow-xs'
                  : step.done
                    ? 'bg-amber border-amber text-white shadow-xs'
                    : 'bg-white border-border text-ink-dim'
              }`}
            >
              {step.isRejected ? (
                <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : step.done ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : null}
            </div>

            <div className="flex flex-col">
              <span className={`font-bold text-sm leading-tight ${step.isRejected ? 'text-rust' : step.done ? 'text-ink' : 'text-ink-dim/80'}`}>
                {step.label}
              </span>
              <span className={`text-[11.5px] mt-0.5 font-medium leading-none ${step.isRejected ? 'text-rust font-semibold' : 'text-ink-dim'}`}>
                {step.desc}
              </span>

              {/* Rejection Reason Feedback Card */}
              {step.isRejected && (
                <div className="mt-2.5 bg-[#FFF5F5] border border-red-200/80 rounded-xl p-3.5 text-left shadow-xs">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-rust font-bold flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-3 h-3 text-rust shrink-0" />
                    <span>Feedback from BOMA Admin</span>
                  </div>
                  <p className="text-xs text-ink font-medium leading-relaxed">
                    {step.rejectionReason || 'Your profile was reviewed and needs updates. Please revise your responses and resubmit.'}
                  </p>

                  <button
                    onClick={() => setActiveScreen('profile-edit')}
                    className="mt-2.5 bg-rust hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Update &amp; Resubmit Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setActiveScreen('profile')}
        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer"
      >
        Back to profile
      </button>
    </div>
  );
}
