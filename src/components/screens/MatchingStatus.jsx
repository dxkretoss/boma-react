import React from 'react';
import { Users, Clock } from 'lucide-react';

function SearchIcon(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function MatchingStatus({
  userPod,
  currentUser,
  matchingLoading,
  setActiveScreen
}) {
  return (
    <div className="max-w-[500px] mx-auto text-center py-16">
      <div className="w-full bg-white border border-border rounded-2xl p-10 shadow-custom flex flex-col items-center animate-fade">
        {userPod?.status === 'ACTIVE' ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-sage/10 text-sage flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-sage mb-3 font-bold">Status: Active &amp; Approved</div>

            <h1 className="font-display text-[24px] font-extrabold text-ink mb-2 leading-none">You are in a Pod!</h1>

            <p className="text-ink-dim text-xs leading-relaxed mb-6 max-w-[385px] mt-2">
              You are already an active member of the Pod <strong>{userPod.name}</strong>. You can collaborate, chat, and draft governance rules in your Pod Commons workspace.
            </p>

            <div className="flex flex-col gap-2 w-full max-w-[280px]">
              <button
                onClick={() => setActiveScreen('commons-dashboard')}
                className="w-full bg-[#2F5FE0] hover:bg-[#2450C4] text-white text-xs font-bold py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Go to Pod Commons &rarr;
              </button>
              <button
                onClick={() => setActiveScreen('pod-history')}
                className="w-full bg-transparent border border-border text-ink hover:bg-panel-alt text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                View My Pods
              </button>
            </div>
          </>
        ) : userPod?.status === 'CREATING' ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-amber-soft text-amber flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-bold">Status: Pod is Forming</div>

            <h1 className="font-display text-[24px] font-extrabold text-ink mb-2 leading-none">Pod is Forming</h1>

            <p className="text-ink-dim text-xs leading-relaxed mb-6 max-w-[385px] mt-2">
              Your self-registered pod <strong>{userPod.name}</strong> is currently being formed. Once all invited neighbors accept their invitations, the pod will be submitted to the Board.
            </p>

            <button
              onClick={() => setActiveScreen(userPod.memberRole === 'CREATOR' ? 'pod-invite' : 'commons-dashboard')}
              className="w-full max-w-[280px] bg-[#2F5FE0] hover:bg-[#2450C4] text-white text-xs font-bold py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              {userPod.memberRole === 'CREATOR' ? 'Manage Invitations \u2192' : 'View Group Status'}
            </button>
          </>
        ) : userPod?.status === 'UNDER_REVIEW' ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-amber-soft text-amber flex items-center justify-center mb-4 animate-pulse">
              <Clock className="w-6 h-6" />
            </div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-semibold">Status: Under Review</div>

            <h1 className="font-display text-[24px] font-extrabold text-ink mb-2 leading-none">Potential Match Found!</h1>

            <p className="text-ink-dim text-xs leading-relaxed mb-6 max-w-[380px] mt-2">
              The BOMA Matching Engine has paired you with a compatible group. BOMA Operations Admins are currently reviewing and verifying the pod criteria.
            </p>

            <div className="bg-slate-50 border border-border/60 rounded-xl p-4 w-full text-left space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-ink">Proposed Pod Name</span>
                <span className="font-mono font-medium text-ink-dim">{userPod.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-ink">Review Status</span>
                <span className="bg-amber-soft text-amber border border-amber/15 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Pending Board Approval</span>
              </div>
            </div>

            <p className="text-ink-dim text-[11.5px] italic leading-relaxed mt-6 max-w-[380px]">
              We will notify you immediately once the administrator approves this match. Check back soon to review and join the Pod!
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-teal-soft flex items-center justify-center text-teal mb-4 animate-pulse">
              <SearchIcon className="w-6 h-6" />
            </div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-semibold">Matching</div>

            <h1 className="font-display text-[24px] font-extrabold text-ink mb-2 leading-none">Finding your Pod</h1>

            {/* Pulse dots animation */}
            <div className="flex gap-1.5 my-4 justify-center items-center h-4 ">
              <span className="w-2.5 h-2.5 rounded-full bg-amber animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-amber animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-amber animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>

            <p className="text-ink-dim text-xs leading-relaxed max-w-[380px]">
              Your profile is registered in the matching pool. BOMA Operations Admins run matching engine iterations periodically from the Admin Panel to form compatible pods.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
