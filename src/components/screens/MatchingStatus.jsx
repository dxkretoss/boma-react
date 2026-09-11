import React, { useState } from 'react';
import { Users, Clock, Sparkles, CheckCircle2, RefreshCw, MapPin, Activity, ArrowRight, SlidersHorizontal, ShieldCheck, SearchX } from 'lucide-react';

export default function MatchingStatus({
  userPod,
  currentUser,
  matchingLoading,
  setActiveScreen,
  onRefreshPodData,
  showToast
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefreshPodData) {
        await onRefreshPodData();
      }
      setHasChecked(true);
      setLastCheckedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (!userPod && showToast) {
        showToast('Matching Pool checked: No compatible pod groups formed yet.', 'info');
      }
    } catch (err) {
      console.error(err);
      if (showToast) {
        showToast('Failed to refresh match status. Please try again.', 'error');
      }
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  const isProfileApproved = currentUser?.profile_status === 'APPROVED';

  return (
    <div className="max-w-[580px] mx-auto text-center py-12 px-4 animate-fade">
      <div className="w-full bg-white border border-border rounded-2xl p-8 md:p-10 shadow-custom flex flex-col items-center">
        {userPod?.status === 'ACTIVE' ? (
          /* ================================================================ */
          /* 1. STATE: ACTIVE IN A POD                                        */
          /* ================================================================ */
          <>
            <div className="w-12 h-12 rounded-xl bg-sage/10 text-sage flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-sage" />
            </div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-sage mb-3 font-bold">
              Status: Active &amp; Approved
            </div>

            <h1 className="font-serif text-[26px] font-bold text-ink mb-2 leading-tight">
              You are in a Pod!
            </h1>

            <p className="text-ink-dim text-xs leading-relaxed mb-6 max-w-[385px] mt-2 font-light">
              You are already an active member of the Pod <strong>{userPod.name}</strong>. You can collaborate, chat, and draft governance rules in your Pod Commons workspace.
            </p>

            <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
              <button
                onClick={() => setActiveScreen('commons-dashboard')}
                className="w-full bg-amber hover:bg-[#b05d3e] text-white text-xs font-semibold py-3 rounded-full shadow-sm hover:shadow-md hover:shadow-[#C46A4A]/25 transition-all cursor-pointer"
              >
                Go to Pod Commons &rarr;
              </button>
              <button
                onClick={() => setActiveScreen('pod-history')}
                className="w-full bg-transparent border border-border text-ink hover:bg-panel-alt text-xs font-semibold py-3 rounded-full transition-colors cursor-pointer"
              >
                View My Pods
              </button>
            </div>
          </>
        ) : userPod?.status === 'CREATING' ? (
          /* ================================================================ */
          /* 2. STATE: POD IS FORMING / INVITATIONS PENDING                   */
          /* ================================================================ */
          <>
            <div className="w-12 h-12 rounded-xl bg-amber-soft text-amber flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-semibold">
              Status: Pod is Forming
            </div>

            <h1 className="font-serif text-[26px] font-bold text-ink mb-2 leading-tight">
              Pod is Forming
            </h1>

            <p className="text-ink-dim text-xs leading-relaxed mb-6 max-w-[385px] mt-2 font-light">
              Your pod <strong>{userPod.name}</strong> is currently being formed. Once all invited members accept, the pod will be submitted for Board review.
            </p>

            {(() => {
              const isExistingPodCreator = (userPod?.group_type === 'EXISTING_POD' || currentUser?.entry_path === 'EXISTING_POD') && userPod?.memberRole === 'CREATOR';
              return (
                <button
                  onClick={() => setActiveScreen(isExistingPodCreator ? 'pod-invite' : 'commons-dashboard')}
                  className="w-full max-w-[280px] bg-amber hover:bg-[#b05d3e] text-white text-xs font-semibold py-3 rounded-full shadow-sm hover:shadow-md hover:shadow-[#C46A4A]/25 transition-all cursor-pointer"
                >
                  {isExistingPodCreator ? 'Manage Invitations →' : 'View Group Status'}
                </button>
              );
            })()}
          </>
        ) : userPod?.status === 'UNDER_REVIEW' ? (
          /* ================================================================ */
          /* 3. STATE: POTENTIAL MATCH FOUND (PENDING BOARD APPROVAL)         */
          /* ================================================================ */
          <>
            <div className="w-12 h-12 rounded-xl bg-amber-soft text-amber flex items-center justify-center mb-4 animate-pulse">
              <Clock className="w-6 h-6 text-amber" />
            </div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-semibold">
              Status: Under Review
            </div>

            <h1 className="font-display text-[24px] font-extrabold text-ink mb-2 leading-none">
              Potential Match Found!
            </h1>

            <p className="text-ink-dim text-xs leading-relaxed mb-6 max-w-[380px] mt-2">
              The BOMA Matching Engine has paired you with a compatible group. BOMA Operations Admins are currently reviewing and verifying the pod criteria.
            </p>

            <div className="bg-slate-50 border border-border/60 rounded-xl p-4 w-full text-left space-y-2.5 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-ink">Proposed Pod Name</span>
                <span className="font-mono font-medium text-ink-dim">{userPod.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-ink">Review Status</span>
                <span className="bg-amber-soft text-amber border border-amber/15 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Pending Board Approval
                </span>
              </div>
            </div>

            <p className="text-ink-dim text-[11.5px] italic leading-relaxed max-w-[380px]">
              We will notify you immediately once the administrator approves this match. Check back soon to review and join the Pod!
            </p>
          </>
        ) : !isProfileApproved ? (
          /* ================================================================ */
          /* 4. STATE: PROFILE UNDER REVIEW (NOT APPROVED YET)                */
          /* ================================================================ */
          <>
            <div className="w-12 h-12 rounded-xl bg-amber-soft text-amber flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber" />
            </div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-bold">
              Status: Profile Under Review
            </div>

            <h1 className="font-display text-[24px] font-extrabold text-ink mb-2 leading-tight">
              Profile Awaiting Approval
            </h1>

            <p className="text-ink-dim text-xs leading-relaxed mb-6 max-w-[400px]">
              Before entering the matching pool, an administrator verifies your questionnaire responses. Once approved, the Matching Engine will evaluate your profile against prospective Pods.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[320px]">
              <button
                onClick={() => setActiveScreen('onboarding-approval')}
                className="flex-1 bg-amber hover:bg-[#b05d3e] text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Check Review Status
              </button>
              <button
                onClick={() => setActiveScreen('profile')}
                className="flex-1 bg-transparent border border-border text-ink hover:bg-panel-alt text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
              >
                View Profile
              </button>
            </div>
          </>
        ) : (
          /* ================================================================ */
          /* 5. STATE: IN MATCHING POOL & NO ACTIVE POD MATCH FOUND YET       */
          /* ================================================================ */
          <>
            <div className="w-12 h-12 rounded-xl bg-panel-alt flex items-center justify-center text-ink-dim mb-4">
              <SearchX className="w-6 h-6 text-amber" />
            </div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-2 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber" />
              Matching Pool · Searching
            </div>

            <h1 className="font-display text-[24px] font-extrabold text-ink mb-2 leading-none">
              No Pod Matches Found Yet
            </h1>

            <p className="text-ink-dim text-xs leading-relaxed max-w-[420px] mb-6">
              The engine checked the matching pool, but no compatible 3–5 member group matches your exact location and timeline criteria yet. New matches are formed as new members join and administrators run the engine.
            </p>

            {/* Criteria Summary Card */}
            <div className="w-full bg-[#F8FAFC] border border-border/80 rounded-xl p-4 text-left space-y-2.5 mb-6">
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-dim font-bold border-b border-border/60 pb-1 flex items-center justify-between">
                <span>Active Search Filter</span>
                <span className="text-teal font-extrabold font-mono">
                  {currentUser?.readiness_score || 82} pts
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
                <div className="flex items-center gap-2 text-ink-dim">
                  <MapPin className="w-3.5 h-3.5 text-amber shrink-0" />
                  <span className="truncate">{currentUser?.location_city || 'Metro Area'} ({currentUser?.location_radius || 45} mi)</span>
                </div>
                <div className="flex items-center gap-2 text-ink-dim">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-teal shrink-0" />
                  <span className="capitalize truncate">{currentUser?.decision_style ? `${currentUser.decision_style} decision` : 'Consensus'}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-dim">
                  <Activity className="w-3.5 h-3.5 text-teal shrink-0" />
                  <span className="capitalize truncate">{currentUser?.housing_intent === 'purchase' ? 'Primary purchase' : currentUser?.housing_intent || 'Co-living'}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-dim">
                  <ShieldCheck className="w-3.5 h-3.5 text-sage shrink-0" />
                  <span className="text-sage font-bold">Approved &amp; In Pool</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 text-[10.5px] text-ink-dim text-center font-mono">
                {lastCheckedTime ? `Last checked: ${lastCheckedTime} · 0 active pods found` : 'Active in Matching Pool · 0 pods currently matched'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[340px]">
              <button
                onClick={handleRefresh}
                disabled={refreshing || matchingLoading}
                className="flex-1 bg-amber hover:bg-[#b05d3e] text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing || matchingLoading ? 'animate-spin' : ''}`} />
                {refreshing || matchingLoading ? 'Checking...' : 'Check Again'}
              </button>
              <button
                onClick={() => setActiveScreen('profile-edit')}
                className="flex-1 bg-white border border-border text-ink hover:bg-panel-alt text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Adjust Criteria
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
