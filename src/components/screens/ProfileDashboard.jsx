import React from 'react';
import { Sparkles, MapPin, Calendar, Edit3, ArrowRight } from 'lucide-react';
import Avatar from '../Avatar';

export default function ProfileDashboard({
  currentUser,
  isProfileApproved,
  isProfileUnderReview,
  isProfileRejected,
  isUserOnboarded,
  isExistingPod,
  userPod,
  setActiveScreen,
  formatTimeline
}) {
  const readinessScore = currentUser?.readiness_score || (isUserOnboarded ? 82 : 0);
  const memberDate = currentUser?.created_at
    ? new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'August 2026';

  return (
    <div className="pad py-12 px-6 md:px-8">
      {/* Profile Banner */}
      <div
        className="rounded-[20px] p-[30px] border border-white/10 flex items-center gap-5 mb-[26px] relative overflow-hidden shadow-custom-lg text-white"
        style={{ background: 'linear-gradient(135deg, #2E2330 0%, #201823 45%, #382430 100%)' }}
      >
        {/* Background ambient decorative glow */}
        <div className="absolute top-0 right-1/4 w-[280px] h-[280px] rounded-full bg-radial from-[#C46A4A]/20 via-[#B87333]/10 to-transparent blur-3xl pointer-events-none" />

        <Avatar
          user={currentUser}
          className="w-[72px] h-[72px] shadow-sm border border-white/20 shrink-0 relative z-10"
          textClass="text-2xl"
          alt={currentUser?.name || "Profile"}
        />
        <div className="text-left flex-1 relative z-10">
          <h3 className="font-serif font-bold text-[24px] text-white leading-tight">{currentUser?.name || 'User'}</h3>
          {isExistingPod ? (
            <span className="inline-block bg-teal-soft/80 text-teal border border-teal/20 text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5">
              {userPod?.status === 'ACTIVE'
                ? `Existing Pod: ${userPod.name} — Active in Commons`
                : userPod?.status === 'UNDER_REVIEW'
                ? `Existing Pod: ${userPod?.name || 'Group'} — Under Admin Review`
                : `Existing Pod: ${userPod?.name || 'Group'} — Forming & Inviting Members`}
            </span>
          ) : isProfileApproved ? (
            <span className="inline-block bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5">
              Readiness: {currentUser?.readiness_score || 82} — Approved &amp; Match-Ready
            </span>
          ) : isProfileUnderReview ? (
            <span className="inline-block bg-amber/20 text-[#D7A27A] border border-amber/30 text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5">
              Readiness: {currentUser?.readiness_score || 82} — Under Admin Review
            </span>
          ) : isProfileRejected ? (
            <span className="inline-block bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5">
              Readiness: {currentUser?.readiness_score || 82} — Rejection Feedback
            </span>
          ) : (
            <span className="inline-block bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5">
              Readiness: Incomplete — Onboarding Pending
            </span>
          )}
          <span className="block text-[13px] text-white/70 mt-1">
            {currentUser?.location_city || 'Austin, TX'} · Member since {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'August 2026'}
          </span>
        </div>
        <button
          onClick={() => setActiveScreen('profile-update')}
          className="self-start sm:self-center bg-amber hover:bg-[#b05d3e] text-white text-xs font-semibold py-2.5 px-5 rounded-full shadow-sm hover:shadow-md hover:shadow-[#C46A4A]/25 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 relative z-10"
        >
          Edit Profile
        </button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-[26px] text-left">
        <div className="border border-border rounded-2xl p-5 bg-panel shadow-sm flex flex-col">
          <div className="font-serif text-[30px] font-bold text-ink leading-tight">
            {isExistingPod ? (currentUser?.readiness_score || 'Pre-Formed') : (isUserOnboarded ? (currentUser?.readiness_score || '82') : '--')}
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1 font-semibold">
            {isExistingPod ? 'Group Formation' : 'Readiness Score'}
          </div>
        </div>
        <div className="border border-border rounded-2xl p-5 bg-panel shadow-sm flex flex-col">
          <div className="font-serif text-[26px] font-bold text-ink leading-tight pt-1">
            {isExistingPod
              ? (userPod?.status === 'ACTIVE' ? 'In Pod' : userPod?.status === 'UNDER_REVIEW' ? 'In Review' : 'Forming')
              : (isProfileApproved ? 'In Pool' : isProfileUnderReview ? 'Review' : isProfileRejected ? 'Rejected' : 'Incomplete')}
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1.5 font-semibold">
            Current Status
          </div>
        </div>
        <div className="border border-border rounded-2xl p-5 bg-panel shadow-sm flex flex-col">
          <div className="font-serif text-[28px] font-bold text-ink leading-tight">
            {currentUser?.location_city || (isExistingPod ? (userPod?.name || 'Self-Registered') : (isUserOnboarded ? 'Austin, TX' : 'Not Set'))}
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1 font-semibold">
            {isExistingPod ? 'Registered Pod' : 'Preferred Location'}
          </div>
        </div>
        <div className="border border-border rounded-2xl p-5 bg-panel shadow-sm flex flex-col">
          <div className="font-serif text-[28px] font-bold text-ink leading-tight">
            {isExistingPod ? (userPod?.group_type || 'Friends/Family') : (isUserOnboarded ? formatTimeline(currentUser?.commitment_timeline) : 'Not Set')}
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1 font-semibold">
            {isExistingPod ? 'Group Type' : 'Commitment'}
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-[26px] text-left">
        {/* Left Card: Readiness / Existing Pod Overview */}
        <div className="border border-border rounded-2xl p-[26px] bg-panel shadow-sm flex flex-col justify-between">
          {isExistingPod ? (
            <>
              <div>
                <h4 className="font-serif font-bold text-xl text-ink mb-2">Existing Pod Overview</h4>
                <p className="text-[13.5px] text-ink-dim mt-2 leading-relaxed font-light">
                  {userPod
                    ? `You are registered in the self-formed pod "${userPod.name}". Algorithmic matching is skipped since your community group is already formed.`
                    : 'You are registered under Path B (Existing Pod). You can invite your co-members to complete setup and skip matching.'}
                </p>
                <div className="flex gap-2.5 flex-wrap mt-[14px]">
                  <span className="bg-panel-alt text-ink text-xs font-semibold px-3 py-1 rounded-full border border-border">
                    Pod: {userPod?.name || 'Self-Registered'}
                  </span>
                  <span className="bg-panel-alt text-ink text-xs font-semibold px-3 py-1 rounded-full border border-border">
                    Type: {userPod?.group_type || 'Group'}
                  </span>
                  <span className="bg-teal-soft/60 text-teal text-xs font-semibold px-3 py-1 rounded-full border border-teal/20">
                    Matching Skipped
                  </span>
                </div>
              </div>
              {(() => {
                const isPodCreator = userPod ? (userPod.memberRole === 'CREATOR' || userPod.created_by === currentUser?.id) : false;
                return (
                  <button
                    onClick={() => setActiveScreen(userPod?.status === 'ACTIVE' ? 'commons-dashboard' : isPodCreator ? 'pod-invite' : 'pod-history')}
                    className="bg-amber text-white rounded-full py-2.5 px-5 text-xs font-semibold w-fit hover:bg-[#b05d3e] hover:shadow-md hover:shadow-[#C46A4A]/25 transition-all cursor-pointer mt-[14px] shadow-sm flex items-center gap-1.5"
                  >
                    {userPod?.status === 'ACTIVE' ? 'Go to Pod Commons →' : isPodCreator ? 'Invite Pod Members →' : 'View My Pod →'}
                  </button>
                );
              })()}
            </>
          ) : isUserOnboarded ? (
            <>
              <div>
                <h4 className="font-serif font-bold text-xl text-ink mb-2">Readiness Breakdown</h4>
                <p className="text-[13.5px] text-ink-dim mt-2 leading-relaxed font-light">
                  {isProfileApproved
                    ? 'Your profile is approved. Pod matching criteria and shared commons features are active.'
                    : isProfileUnderReview
                      ? 'Admin review in progress. We are verifying your questionnaire responses.'
                      : 'Feedback received on your submission. Please update your profile.'}
                </p>
                <div className="flex gap-2.5 flex-wrap mt-[14px]">
                  <span className="bg-panel-alt text-ink text-xs font-semibold px-3 py-1 rounded-full border border-border">Values Align: High</span>
                  <span className="bg-panel-alt text-ink text-xs font-semibold px-3 py-1 rounded-full border border-border">Finances: Verified</span>
                  <span className="bg-panel-alt text-ink text-xs font-semibold px-3 py-1 rounded-full border border-border">Timeline: Aligned</span>
                </div>
              </div>
              <button
                onClick={() => setActiveScreen('readiness-detail')}
                className="bg-amber text-white rounded-full py-2.5 px-5 text-xs font-semibold w-fit hover:bg-[#b05d3e] hover:shadow-md hover:shadow-[#C46A4A]/25 transition-all cursor-pointer mt-[14px] shadow-sm"
              >
                View Score Breakdown →
              </button>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-serif font-bold text-xl text-ink mb-2">Readiness Breakdown</h4>
                <p className="my-3 text-ink-dim text-[13px] leading-relaxed font-light">
                  Profile incomplete — complete your 9 onboarding questions to calculate preferences, readiness score, and location bounds.
                </p>
              </div>
              <button
                onClick={() => setActiveScreen('entry-path')}
                className="bg-amber text-white rounded-full py-2.5 px-5 text-xs font-semibold w-fit hover:bg-[#b05d3e] hover:shadow-md hover:shadow-[#C46A4A]/25 transition-all cursor-pointer mt-[14px] shadow-sm"
              >
                Complete Onboarding Now →
              </button>
            </>
          )}
        </div>

        {/* Right Card: Status & Commons */}
        <div className="border border-border rounded-2xl p-[26px] bg-panel shadow-sm flex flex-col justify-between">
          {isExistingPod ? (
            <>
              <div>
                <h4 className="font-serif font-bold text-xl text-ink mb-2">Group Status</h4>
                <p className="text-[13.5px] text-ink-dim mt-2 font-light">
                  {userPod?.status === 'ACTIVE'
                    ? 'Group verified & approved → The Commons is active'
                    : userPod?.status === 'UNDER_REVIEW'
                      ? 'Pod submitted → Under Board review in Existing Pod Queue'
                      : 'Pod created → Inviting members to join group'}
                </p>
                <div className="h-2 rounded-full bg-panel-alt overflow-hidden mt-[14px]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: userPod?.status === 'ACTIVE' ? '100%' : userPod?.status === 'UNDER_REVIEW' ? '70%' : '40%',
                      background: userPod?.status === 'ACTIVE'
                        ? 'linear-gradient(90deg, #2D7A5E, #10B981)'
                        : 'linear-gradient(90deg, var(--color-amber), #B87333)'
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (userPod?.status === 'ACTIVE') {
                    setActiveScreen('commons-dashboard');
                  } else {
                    setActiveScreen('status-tracking');
                  }
                }}
                className="bg-amber text-white text-xs font-semibold py-2.5 px-5 rounded-full shadow-sm hover:bg-[#b05d3e] hover:shadow-md hover:shadow-[#C46A4A]/25 transition-all cursor-pointer w-fit mt-[14px]"
              >
                {userPod?.status === 'ACTIVE' ? 'Open Pod Commons →' : 'View Journey Status →'}
              </button>
            </>
          ) : isUserOnboarded ? (
            <>
              <div>
                <h4 className="font-serif font-bold text-xl text-ink mb-2">Status</h4>
                <p className="text-[13.5px] text-ink-dim mt-2 font-light">
                  {isProfileApproved
                    ? 'Onboarding approved → Matching pool active'
                    : isProfileUnderReview
                      ? 'Onboarding complete → Under admin review'
                      : 'Profile needs attention → Rejected feedback'}
                </p>
                <div className="h-2 rounded-full bg-panel-alt overflow-hidden mt-[14px]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: isProfileApproved ? '100%' : isProfileUnderReview ? '70%' : '50%',
                      background: isProfileApproved
                        ? 'linear-gradient(90deg, #2D7A5E, #10B981)'
                        : isProfileUnderReview
                          ? 'linear-gradient(90deg, var(--color-amber), #B87333)'
                          : 'linear-gradient(90deg, var(--color-amber), var(--color-rust))'
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (isProfileApproved) {
                    setActiveScreen('matching-status');
                  } else {
                    setActiveScreen('onboarding-approval');
                  }
                }}
                className="bg-amber text-white text-xs font-semibold py-2.5 px-5 rounded-full shadow-sm hover:bg-[#b05d3e] hover:shadow-md hover:shadow-[#C46A4A]/25 transition-all cursor-pointer w-fit mt-[14px]"
              >
                {isProfileApproved ? 'Check Matching Status →' : 'View Review Feedback →'}
              </button>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-serif font-bold text-xl text-ink mb-2">Status</h4>
                <p className="my-3 text-ink-dim text-[13px] leading-relaxed font-medium">
                  Complete Onboarding
                </p>
                <p className="text-ink-dim text-[12.5px] leading-relaxed font-light">
                  Your profile and matching entries are locked until you complete the questionnaire.
                </p>
              </div>
              <button
                onClick={() => setActiveScreen('entry-path')}
                className="bg-amber text-white rounded-full py-2.5 px-5 text-xs font-semibold w-fit hover:bg-[#b05d3e] hover:shadow-md hover:shadow-[#C46A4A]/25 transition-all cursor-pointer mt-[14px] shadow-sm"
              >
                Unlock Status Timeline →
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
