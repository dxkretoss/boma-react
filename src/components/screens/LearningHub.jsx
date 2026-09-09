import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Play, Loader2 } from 'lucide-react';
import { fetchLearningVideos } from '../../api/learning';

export default function LearningHub({
  currentUser,
  isUserOnboarded,
  isProfileApproved,
  isProfileUnderReview,
  isProfileRejected,
  isExistingPod: propIsExistingPod,
  userPod,
  openWhatsBomaModal,
  openVideoModal,
  setActiveScreen
}) {
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const isExistingPod = propIsExistingPod !== undefined ? propIsExistingPod : currentUser?.entry_path === 'EXISTING_POD';
  const isPodCreator = userPod ? (userPod.memberRole === 'CREATOR' || userPod.created_by === currentUser?.id) : true;

  useEffect(() => {
    let isMounted = true;
    async function loadVideos() {
      try {
        const data = await fetchLearningVideos(false);
        if (isMounted) {
          setVideos(data || []);
        }
      } catch (err) {
        console.error('Failed to load learning videos in LearningHub:', err);
      } finally {
        if (isMounted) setLoadingVideos(false);
      }
    }
    loadVideos();
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <div className="pad py-12 px-6 md:px-8">
      {/* Banner Hero Grid */}
      <div
        className="learning-hero text-white p-8 md:p-10 rounded-3xl mb-8 relative overflow-hidden shadow-custom-lg border border-[#F5F1EA]/10"
        style={{ background: 'linear-gradient(135deg, #2E2330 0%, #201823 45%, #382430 100%)' }}
      >
        {/* Background ambient decorative glow */}
        <div className="absolute right-[-40px] bottom-[-40px] opacity-15 pointer-events-none text-[#C46A4A]">
          <Sparkles className="w-72 h-72" />
        </div>
        <div className="absolute top-0 right-1/4 w-[350px] h-[350px] rounded-full bg-radial from-[#C46A4A]/20 via-[#B87333]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center relative z-10">
          <div className="lg:col-span-3 text-left">
            <div className="inline-flex items-center gap-2 bg-[#F5F1EA]/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-mono text-[#F5F1EA]/90 mb-5 border border-[#F5F1EA]/20">
              <span className={`w-2 h-2 rounded-full ${isExistingPod ? 'bg-teal' : 'bg-amber'} animate-pulse`}></span>
              {isExistingPod ? 'BOMA Existing Pod Hub' : 'BOMA Member Learning Center'}
            </div>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-[42px] text-[#F5F1EA] leading-tight mb-4 tracking-tight">
              Welcome to <span className="italic font-normal text-clay">BOMA!</span>
            </h1>
            <p className="text-[#F5F1EA]/80 text-[15px] leading-relaxed mb-7 max-w-[500px] font-light">
              {isExistingPod
                ? 'Your group is pre-formed! Discover how BOMA community co-ownership works, explore governance draft agreements, and coordinate with your Pod members.'
                : "Your journey starts here. Discover how neighbor compatibility matching works, watch video tutorials, and complete your profile questions when you're ready to find your Pod."}
            </p>

            <div className="flex gap-3 flex-wrap items-center">
              {isExistingPod ? (
                <button
                  onClick={() => {
                    if (userPod?.status === 'ACTIVE') setActiveScreen('commons-dashboard');
                    else if (isPodCreator) setActiveScreen('pod-invite');
                    else setActiveScreen('pod-history');
                  }}
                  className="bg-amber text-white font-semibold text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:shadow-[#C46A4A]/25 hover:bg-[#b05d3e] hover:-translate-y-[0.5px] transition-all cursor-pointer"
                >
                  {userPod?.status === 'ACTIVE'
                    ? 'Open Pod Commons →'
                    : isPodCreator
                    ? 'Manage Pod & Invites →'
                    : 'View My Pod Group →'}
                </button>
              ) : (!isUserOnboarded || isProfileRejected) ? (
                <button
                  onClick={() => setActiveScreen('entry-path')}
                  className="bg-amber text-white font-semibold text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:shadow-[#C46A4A]/25 hover:bg-[#b05d3e] hover:-translate-y-[0.5px] transition-all cursor-pointer"
                >
                  {isProfileRejected ? 'Update Onboarding Profile →' : 'Start Onboarding Questions →'}
                </button>
              ) : (
                <button
                  onClick={() => setActiveScreen(isProfileApproved ? 'profile' : 'onboarding-approval')}
                  className="bg-amber text-white font-semibold text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:shadow-[#C46A4A]/25 hover:bg-[#b05d3e] hover:-translate-y-[0.5px] transition-all cursor-pointer"
                >
                  {isProfileApproved ? 'Go to Profile →' : 'Check Review Status →'}
                </button>
              )}
              <button
                onClick={openWhatsBomaModal}
                className="border border-white/30 hover:border-white text-white hover:bg-white/10 backdrop-blur-xs font-semibold text-sm px-6 py-3 rounded-full transition-all cursor-pointer"
              >
                What is BOMA?
              </button>
            </div>
          </div>

          {/* Profile Status Widget Card */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 text-white text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#D7A27A] font-semibold">
                {isExistingPod ? 'Group Formation' : 'Profile Readiness'}
              </span>
              <span
                style={{
                  backgroundColor: isExistingPod
                    ? 'rgba(45, 122, 94, 0.25)'
                    : !isUserOnboarded
                    ? 'rgba(231, 222, 208, 0.2)'
                    : isProfileRejected
                      ? 'rgba(196, 67, 46, 0.2)'
                      : isProfileApproved
                        ? 'rgba(45, 122, 94, 0.25)'
                        : 'rgba(184, 115, 51, 0.25)',
                  color: isExistingPod
                    ? '#A3E8D0'
                    : !isUserOnboarded
                    ? '#E7DED0'
                    : isProfileRejected
                      ? '#FF8C7A'
                      : isProfileApproved
                        ? '#A3E8D0'
                        : '#E7DED0',
                  borderColor: isExistingPod
                    ? 'rgba(45, 122, 94, 0.4)'
                    : !isUserOnboarded
                    ? 'rgba(231, 222, 208, 0.3)'
                    : isProfileRejected
                      ? 'rgba(196, 67, 46, 0.4)'
                      : isProfileApproved
                        ? 'rgba(45, 122, 94, 0.4)'
                        : 'rgba(184, 115, 51, 0.4)'
                }}
                className="text-[11px] font-semibold px-3 py-1 rounded-full border"
              >
                {isExistingPod
                  ? (userPod?.status === 'ACTIVE'
                      ? 'Active in Commons'
                      : userPod?.status === 'UNDER_REVIEW'
                      ? 'Under Review'
                      : 'Pod Forming')
                  : !isUserOnboarded
                  ? 'Incomplete'
                  : isProfileRejected
                    ? 'Needs Attention'
                    : isProfileApproved
                      ? 'Match-Ready'
                      : 'Under Review'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              {isExistingPod ? (
                <>
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-white leading-none">
                    Bypassed
                  </span>
                  <span className="text-xs text-[#A3E8D0] font-mono font-semibold ml-1 bg-teal-500/20 px-2 py-0.5 rounded">
                    Pre-Formed Group
                  </span>
                </>
              ) : (
                <>
                  <span className="font-serif text-4xl sm:text-5xl font-bold text-white leading-none">
                    {isUserOnboarded ? (currentUser?.readiness_score || 82) : '--'}
                  </span>
                  <span className="text-sm text-[#F5F1EA]/80 font-light">/ 100 Readiness Score</span>
                </>
              )}
            </div>

            <div className="h-1.5 bg-white/15 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-amber transition-all duration-300 rounded-full"
                style={{ width: isExistingPod ? '100%' : isUserOnboarded ? '100%' : '15%' }}
              />
            </div>

            <p className="text-xs text-[#F5F1EA]/75 leading-relaxed font-light">
              {isExistingPod
                ? (userPod
                    ? `You are registered in the self-formed pod "${userPod.name}". Algorithmic matching questions are bypassed since your community group is already formed.`
                    : 'You are registered under Path B (Existing Pod). Algorithmic matching questions are bypassed for established groups.')
                : !isUserOnboarded
                ? 'Complete your 9 onboarding questions to calculate your Readiness Score and unlock Pod Matching & The Commons.'
                : isProfileRejected
                  ? `Feedback: ${currentUser?.rejection_reason || 'Please update your answers and resubmit.'}`
                  : isProfileApproved
                    ? `Profile approved! Your Readiness Score is ${currentUser?.readiness_score || 82}. All Pod Matching and Commons features are fully unlocked.`
                    : 'Your profile is under review by BOMA Admin. Access will unlock immediately once approved.'}
            </p>

            {isExistingPod ? (
              <button
                onClick={() => {
                  if (userPod?.status === 'ACTIVE') setActiveScreen('commons-dashboard');
                  else if (isPodCreator) setActiveScreen('pod-invite');
                  else setActiveScreen('pod-history');
                }}
                className="w-full bg-amber text-white font-semibold text-sm px-4 py-3 rounded-full hover:bg-[#b05d3e] hover:shadow-lg hover:shadow-[#C46A4A]/25 active:scale-95 transition-all text-center justify-center cursor-pointer shadow-md mt-4"
              >
                {userPod?.status === 'ACTIVE'
                  ? 'Open Pod Commons →'
                  : isPodCreator
                  ? 'Manage Pod Invitations →'
                  : 'View My Pod Details →'}
              </button>
            ) : (!isUserOnboarded || isProfileRejected || isProfileUnderReview) && (
              <button
                onClick={() => {
                  if (isProfileUnderReview || isProfileRejected) {
                    setActiveScreen('onboarding-approval');
                  } else {
                    setActiveScreen('entry-path');
                  }
                }}
                className="w-full bg-amber text-white font-semibold text-sm px-4 py-3 rounded-full hover:bg-[#b05d3e] hover:shadow-lg hover:shadow-[#C46A4A]/25 active:scale-95 transition-all text-center justify-center cursor-pointer shadow-md mt-4"
              >
                {isProfileUnderReview
                  ? 'Check Review Status →'
                  : isProfileRejected
                    ? 'Update Profile →'
                    : 'Complete Profile Now →'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Learning grid */}
      <div className="mb-10 text-left">
        <div className="font-mono text-xs uppercase tracking-[0.15em] text-amber mb-2 font-semibold">Interactive Learning</div>
        <h2 className="font-serif font-bold text-3xl sm:text-4xl text-ink mb-6">Everything you need to get started</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-200">
            <div>
              <div className="w-11 h-11 rounded-xl bg-amber-soft text-amber flex items-center justify-center mb-4">
                <Sparkles className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink mb-2">What's BOMA?</h3>
              <p className="text-ink-dim text-sm leading-relaxed mb-4 font-light">
                BOMA flips traditional real estate. We match neighbors based on values, lifestyle, and housing intent first — creating trusted Pods before any financial commitment.
              </p>
              <div className="flex gap-2 flex-wrap mb-5">
                <span className="bg-panel-alt text-ink text-xs font-semibold px-3 py-1 rounded-full border border-border">Values Matching</span>
                <span className="bg-panel-alt text-ink text-xs font-semibold px-3 py-1 rounded-full border border-border">Zero Escrow Upfront</span>
                <span className="bg-panel-alt text-ink text-xs font-semibold px-3 py-1 rounded-full border border-border">Pod Commons</span>
              </div>
            </div>
            <button
              onClick={openWhatsBomaModal}
              className="w-full bg-transparent border border-border text-ink rounded-full py-2.5 text-sm font-semibold hover:bg-panel-alt hover:border-amber/40 transition-all cursor-pointer text-center"
            >
              Read Full Vision &amp; Architecture →
            </button>
          </div>

          {/* Card 2 */}
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-200">
            <div>
              <div className="w-11 h-11 rounded-xl bg-teal-soft text-teal flex items-center justify-center mb-4">
                <Users className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink mb-2">How It Works</h3>
              <p className="text-ink-dim text-sm leading-relaxed mb-4 font-light">
                A simple 3-stage process designed to eliminate real estate friction and build lasting neighbor alignment.
              </p>

              <div className="flex flex-col gap-2.5 mb-5 font-semibold text-[13px] text-ink">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber text-white flex items-center justify-center font-bold text-[10.5px]">1</span>
                  <span>Learn &amp; Create Account</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-panel-alt text-ink-dim flex items-center justify-center font-bold text-[10.5px]">2</span>
                  <span className="text-ink-dim font-medium">Answer 9 Onboarding Questions</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-panel-alt text-ink-dim flex items-center justify-center font-bold text-[10.5px]">3</span>
                  <span className="text-ink-dim font-medium">Get Matched &amp; Join Pod Commons</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveScreen('landing');
                window.location.hash = 'how-it-works';
                setTimeout(() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="w-full bg-transparent border border-border text-ink rounded-full py-2.5 text-sm font-semibold hover:bg-panel-alt hover:border-amber/40 transition-all cursor-pointer text-center"
            >
              Explore Full 3-Stage Guide →
            </button>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="mb-10 text-left">
        <div className="font-mono text-xs uppercase tracking-[0.15em] text-amber mb-2 font-semibold">Video Library</div>
        <h2 className="font-serif font-bold text-3xl sm:text-4xl text-ink mb-2">Learning Videos &amp; Tutorials</h2>
        <p className="text-ink-dim text-[15px] leading-relaxed mb-6 max-w-[600px] font-light">
          Watch short 2-minute video guides to understand co-housing dynamics, readiness metrics, and shared agreement scaffolding.
        </p>

        {loadingVideos ? (
          <div className="py-12 bg-white border border-border rounded-xl flex items-center justify-center gap-2 text-ink-dim">
            <Loader2 className="w-5 h-5 animate-spin text-amber" />
            <span className="text-sm font-medium">Loading learning tutorials...</span>
          </div>
        ) : videos.length === 0 ? (
          <div className="py-12 bg-white border border-border rounded-xl text-center text-ink-dim">
            <p className="text-sm">No tutorials available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {videos.map((v, i) => {
              const videoUrl = v.video_url || v.url || '';
              const thumbUrl = v.thumbnail_url || v.thumb || '/assets/pod_community_realistic.png';
              const desc = v.description || v.desc || '';
              const tag = v.tag || 'Getting Started';

              return (
                <div
                  key={v.id || i}
                  onClick={() => openVideoModal(v.title, videoUrl, desc)}
                  className="border border-border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform duration-200 cursor-pointer group"
                >
                  <div className="relative h-40 bg-navy-deep flex items-center justify-center overflow-hidden">
                    <img
                      src={thumbUrl}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
                      alt={v.title}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/pod_community_realistic.png';
                      }}
                    />
                    <div className="absolute w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-all">
                      <Play className="w-5 h-5 text-navy-deep fill-navy-deep ml-0.5" />
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="bg-panel-alt text-navy-deep text-[10.5px] font-bold px-2 py-0.5 rounded-full w-fit mb-2">
                      {tag}
                    </span>
                    <h4 className="font-display font-bold text-sm text-navy-deep leading-snug mb-1">
                      {v.title}
                    </h4>
                    <p className="text-xs text-ink-dim leading-relaxed">
                      {desc.length > 85 ? desc.slice(0, 85) + '...' : desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
