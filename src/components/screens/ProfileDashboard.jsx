import React from 'react';

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
  return (
    <div className="pad py-12 px-6 md:px-8">
      {/* Profile Banner */}
      <div
        className="rounded-[20px] p-[30px] border border-border flex items-center gap-5 mb-[26px]"
        style={{ background: 'linear-gradient(120deg, var(--color-teal-soft) 0%, var(--color-panel) 70%)' }}
      >
        {currentUser?.avatar_url && (currentUser.avatar_url.startsWith('http') || currentUser.avatar_url.startsWith('/') || currentUser.avatar_url.startsWith('assets/') || currentUser.avatar_url.startsWith('data:image/')) ? (
          <img
            src={currentUser.avatar_url}
            className="rounded-full object-cover shrink-0 w-[72px] h-[72px] border border-border shadow-sm"
            alt="Profile"
          />
        ) : (
          <div className="w-[72px] h-[72px] rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-2xl font-display flex-shrink-0">
            {(currentUser?.name || currentUser?.email || 'U').substring(0, 1).toUpperCase()}
          </div>
        )}
        <div className="text-left flex-1">
          <h3 className="font-display font-extrabold text-[22px] text-ink leading-tight">{currentUser?.name || 'User'}</h3>
          {isProfileApproved ? (
            <span className="inline-block bg-[#EAFDF8] text-sage border border-sage/10 text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5 ">
              Readiness: {currentUser?.readiness_score || 82} — Approved &amp; Match-Ready
            </span>
          ) : isProfileUnderReview ? (
            <span className="inline-block bg-[#FFF9E6] text-amber border border-amber/10 text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5 ">
              Readiness: {currentUser?.readiness_score || 82} — Under Admin Review
            </span>
          ) : isProfileRejected ? (
            <span className="inline-block bg-[#FDF2F2] text-rust border border-rust/10 text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5 ">
              Readiness: {currentUser?.readiness_score || 82} — Rejection Feedback
            </span>
          ) : (
            <span className="inline-block bg-[#FDE8E8] text-rust border border-rust/10 text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5 ">
              Readiness: Incomplete — Onboarding Pending
            </span>
          )}
          <span className="block text-[13px] text-ink-dim mt-1">
            {currentUser?.location_city || 'Austin, TX'} · Member since {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'June 2026'}
          </span>
        </div>
        <button
          onClick={() => setActiveScreen('profile-update')}
          className="self-start bg-[#2F5FE0] hover:bg-[#2450C4] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          Edit Profile
        </button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-[26px] text-left">
        <div className="border border-border rounded-custom p-5 bg-panel shadow-custom flex flex-col">
          <div className="font-display text-[28px] font-extrabold text-ink leading-tight">
            {isUserOnboarded ? (currentUser?.readiness_score || '82') : '--'}
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1 font-semibold">
            Readiness Score
          </div>
        </div>
        <div className="border border-border rounded-custom p-5 bg-panel shadow-custom flex flex-col">
          <div className="font-display text-[22px] font-extrabold text-ink leading-tight pt-1">
            {isExistingPod
              ? (userPod?.status === 'ACTIVE' ? 'In Pod' : 'Setup')
              : (isProfileApproved ? 'In Pool' : isProfileUnderReview ? 'Review' : isProfileRejected ? 'Rejected' : 'Incomplete')}
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1.5 font-semibold">
            Current Status
          </div>
        </div>
        <div className="border border-border rounded-custom p-5 bg-panel shadow-custom flex flex-col">
          <div className="font-display text-[28px] font-extrabold text-ink leading-tight">
            {isUserOnboarded ? (currentUser?.location_city || 'Austin, TX') : 'Not Set'}
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1 font-semibold">
            Preferred Location
          </div>
        </div>
        <div className="border border-border rounded-custom p-5 bg-panel shadow-custom flex flex-col">
          <div className="font-display text-[28px] font-extrabold text-ink leading-tight">
            {isUserOnboarded ? formatTimeline(currentUser?.commitment_timeline) : 'Not Set'}
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1 font-semibold">
            Commitment
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-left">
        {/* Preferences Summary Card */}
        <div className="border border-border rounded-custom p-[26px] bg-panel shadow-custom flex flex-col justify-between">
          {isUserOnboarded ? (
            <>
              <div>
                <h4 className="font-display font-extrabold text-lg text-ink mb-2">Preferences summary</h4>
                <ul className="list-none p-0 m-0 mt-2.5">
                  <li className="flex items-start gap-2.5 py-[11px] border-b border-border text-[13.5px] text-ink font-medium">
                    <div className="w-4 h-4 border border-sage rounded-[4px] shrink-0 mt-0.5 bg-sage"></div>
                    <span>{currentUser?.location_city || 'Austin, TX'} · {currentUser?.setting_preference ? (currentUser.setting_preference.charAt(0).toUpperCase() + currentUser.setting_preference.slice(1)) : 'Suburban'} setting</span>
                  </li>
                  <li className="flex items-start gap-2.5 py-[11px] border-b border-border text-[13.5px] text-ink font-medium">
                    <div className="w-4 h-4 border border-sage rounded-[4px] shrink-0 mt-0.5 bg-sage"></div>
                    <span>{currentUser?.housing_intent === 'purchase' || currentUser?.housing_intent === 'purchase-primary' ? 'Purchase primary residence' : currentUser?.housing_intent === 'co-develop' ? 'Co-develop property' : currentUser?.housing_intent === 'investment' ? 'Investment hold' : 'Lifestyle-based co-living'}</span>
                  </li>
                  <li className="flex items-start gap-2.5 py-[11px] text-[13.5px] text-ink font-medium">
                    <div className="w-4 h-4 border border-sage rounded-[4px] shrink-0 mt-0.5 bg-sage"></div>
                    <span>{formatTimeline(currentUser?.commitment_timeline) || '5+ years'} commitment</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setActiveScreen('profile-update')}
                className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-[14px]"
              >
                Edit preferences
              </button>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-display font-extrabold text-lg text-ink mb-2">Preferences summary</h4>
                <p className="my-3 text-ink-dim text-[13px] leading-relaxed">
                  Profile incomplete — complete your 9 onboarding questions to calculate preferences, readiness score, and location bounds.
                </p>
              </div>
              <button
                onClick={() => setActiveScreen('entry-path')}
                className="bg-amber text-white rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-[#2450C4] transition-colors cursor-pointer mt-[14px] shadow-sm"
              >
                Complete Onboarding Now →
              </button>
            </>
          )}
        </div>

        {/* Status Card */}
        <div className="border border-border rounded-custom p-[26px] bg-panel shadow-custom flex flex-col justify-between">
          {isUserOnboarded ? (
            <>
              <div>
                <h4 className="font-display font-extrabold text-lg text-ink mb-2">Status</h4>
                <p className="text-[13.5px] text-ink-dim mt-2 font-medium">
                  {isProfileApproved
                    ? 'Onboarding approved → Matching pool active'
                    : isProfileUnderReview
                      ? 'Onboarding complete → Under admin review'
                      : 'Profile needs attention → Rejected feedback'}
                </p>
                <div className="h-2 rounded-[6px] bg-panel-alt overflow-hidden mt-[14px]">
                  <div
                    className="h-full rounded-[6px] transition-all duration-300"
                    style={{
                      width: isProfileApproved ? '100%' : isProfileUnderReview ? '70%' : '50%',
                      background: isProfileApproved
                        ? 'linear-gradient(90deg, var(--color-teal), #10B981)'
                        : isProfileUnderReview
                          ? 'linear-gradient(90deg, var(--color-teal), var(--color-amber))'
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
                className="bg-[#2F5FE0] hover:bg-[#2450C4] text-white text-xs font-bold py-2.5 px-4.5 rounded-lg shadow-sm transition-colors cursor-pointer w-fit mt-[14px]"
              >
                {isProfileApproved ? 'Check Matching Status →' : 'View Review Feedback →'}
              </button>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-display font-extrabold text-lg text-ink mb-2">Status</h4>
                <p className="my-3 text-ink-dim text-[13px] leading-relaxed font-semibold">
                  Complete Onboarding
                </p>
                <p className="text-ink-dim text-[12.5px] leading-relaxed">
                  Your profile and matching entries are locked until you complete the questionnaire.
                </p>
              </div>
              <button
                onClick={() => setActiveScreen('entry-path')}
                className="bg-ink hover:bg-[#2450C4] text-white rounded-lg py-2.5 px-4.5 text-xs font-bold w-fit transition-colors cursor-pointer mt-[14px] shadow-sm"
              >
                Unlock Status Timeline →
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Button Row */}
      <div className="flex items-center gap-3 mt-[10px] flex-wrap">
        <button
          onClick={() => setActiveScreen('matching-status')}
          className="bg-amber text-white font-bold text-sm px-[22px] py-3 rounded-[10px] shadow-md hover:bg-[#2450C4] hover:-translate-y-[1px] transition-all cursor-pointer"
          style={{ boxShadow: '0 8px 20px -10px rgba(47, 95, 224, 0.55)' }}
        >
          View match status
        </button>
        <button
          onClick={() => setActiveScreen('readiness-detail')}
          className="bg-transparent border border-border text-ink font-bold text-sm px-[22px] py-3 rounded-[10px] hover:bg-panel-alt transition-all cursor-pointer"
        >
          Readiness breakdown
        </button>
      </div>
    </div>
  );
}
