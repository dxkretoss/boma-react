import React from 'react';
import { Check } from 'lucide-react';

export default function StatusTracker({
  isExistingPod,
  userOnboarded,
  userPod,
  currentUser,
  podHistory,
  setActiveScreen
}) {
  return (
    <div className="pad py-12 px-6 md:px-8 text-left ">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Profile / Status Tracker</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-6">Your journey so far</h3>

      {/* Vertical Timeline */}
      <div className="max-w-[480px] space-y-6 relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border mb-8">
        {(isExistingPod
          ? [
            { label: 'Account created & verified', desc: 'Completed', done: true },
            { label: 'Onboarding profile completed', desc: userOnboarded ? 'Completed' : 'Pending — Complete 9 questions', done: userOnboarded },
            { label: 'Joined Pod via invitation', desc: userPod ? `Joined: ${userPod.name}` : 'Waiting to join group', done: !!userPod },
            { label: 'Submitted group for review', desc: userPod?.status === 'UNDER_REVIEW' || userPod?.status === 'ACTIVE' ? 'Submitted' : userPod?.status === 'REJECTED' ? 'Flagged / Needs Attention' : 'Pending submission', done: userPod && ['UNDER_REVIEW', 'ACTIVE'].includes(userPod.status) },
            { label: 'Admin approved group & activated Commons', desc: userPod?.status === 'ACTIVE' ? 'Approved & Commons Activated' : 'Waiting for Board verification', done: userPod?.status === 'ACTIVE' }
          ]
          : [
            { label: 'Account created & verified', desc: 'Completed', done: true },
            { label: 'Onboarding completed', desc: userOnboarded ? 'Completed' : 'Pending — Complete 9 questions', done: userOnboarded },
            { label: 'Readiness score calculated', desc: userOnboarded ? `Score: ${currentUser?.readiness_score || 82} — Match-Ready` : 'Pending profile completion', done: userOnboarded },
            { label: 'Admin review', desc: currentUser?.profile_status === 'APPROVED' ? 'Approved' : currentUser?.profile_status === 'REJECTED' ? 'Needs Attention (Rejected)' : 'Under Review', done: currentUser?.profile_status === 'APPROVED' },
            { label: 'Pod match suggested', desc: userOnboarded ? (userPod ? 'Completed' : 'Not yet started') : 'Locked — Complete profile first', done: userOnboarded && !!userPod },
            { label: 'Pod joined', desc: userPod ? `Active in ${userPod.name}` : (podHistory.length > 0 ? 'Searching for a new Pod' : 'Not yet started'), done: !!userPod }
          ]
        ).map((step, idx) => (
          <div key={idx} className="relative">
            {/* Dot */}
            <div className={`absolute left-[-32px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${step.done ? 'bg-amber border-amber text-white' : 'bg-white border-border text-ink-dim'
              }`}>
              {step.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-sm leading-tight ${step.done ? 'text-ink' : 'text-ink-dim/80'}`}>
                {step.label}
              </span>
              <span className="text-[11.5px] text-ink-dim mt-0.5 font-medium leading-none">
                {step.desc}
              </span>
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
