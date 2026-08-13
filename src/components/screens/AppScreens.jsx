import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  FileText,
  MessageSquare,
  Settings,
  Sparkles,
  ArrowLeft,
  Check,
  ChevronRight,
  Video,
  ExternalLink,
  Lock,
  Unlock,
  AlertCircle,
  Play
} from 'lucide-react';
import { GATED_SCREENS } from '../../constants/screens';
import { updateUser } from '../../api/users';

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

// Generic Locked Feature Gate View
function LockedFeatureView({ screenId, onStartOnboarding, onReturnToHub }) {
  const metaTitles = {
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
        <div className="blur-[3.5px] opacity-40 pointer-events-none select-none text-left">
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

export default function AppScreens({
  activeScreen,
  setActiveScreen,
  userOnboarded,
  setUserOnboarded,
  currentUser,
  setCurrentUser,
  activePodId,
  setActivePodId,
  suggestedPodId,
  setSuggestedPodId,
  podHistory,
  setPodHistory,
  podData,
  openVideoModal,
  openWhatsBomaModal,
  openAgreementDocModal,
  chatMessages,
  setChatMessages,
  alignedAgreements,
  setAlignedAgreements
}) {
  // Local edit profile states
  const [editCity, setEditCity] = useState('Austin, TX');
  const [editSetting, setEditSetting] = useState('Suburban');
  const [editIntent, setEditIntent] = useState('Purchase primary residence');

  useEffect(() => {
    if (currentUser) {
      setEditCity(currentUser.location_city || 'Austin, TX');
      setEditSetting(currentUser.setting_preference ? (currentUser.setting_preference.charAt(0).toUpperCase() + currentUser.setting_preference.slice(1)) : 'Suburban');
      
      let intentLabel = 'Purchase primary residence';
      if (currentUser.housing_intent === 'co-develop') {
        intentLabel = 'Co-develop property';
      } else if (currentUser.housing_intent === 'investment') {
        intentLabel = 'Investment hold';
      }
      setEditIntent(intentLabel);
    }
  }, [currentUser]);

  // Local chat message state
  const [chatInput, setChatInput] = useState('');
  const chatLogRef = useRef(null);

  // Scroll to bottom of chat log whenever messages change
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatMessages, activeScreen]);

  if (!['learning', 'profile', 'profile-edit', 'readiness-detail', 'status-tracking', 'pod-history', 'matching-status', 'pod-suggestion', 'pod-preview', 'confirm-join', 'commons-dashboard', 'commons-members', 'commons-agreement', 'commons-chat', 'commons-settings'].includes(activeScreen)) {
    return null;
  }

  // Intercept locked screens if user is not onboarded
  if (GATED_SCREENS.includes(activeScreen) && !userOnboarded) {
    return (
      <LockedFeatureView
        screenId={activeScreen}
        onStartOnboarding={() => setActiveScreen('onboarding-welcome')}
        onReturnToHub={() => setActiveScreen('learning')}
      />
    );
  }

  // ---------------- MATCH STATE TRANSITIONS ----------------
  const simulateMatch = () => {
    // Determine a suggested pod that isn't the active pod and isn't in history
    const historyIds = podHistory.map(h => h.id);
    const alreadySeen = [activePodId, ...historyIds];

    // Choose willow if cedar is active, else cedar
    const choice = alreadySeen.includes('cedar') ? 'willow' : 'cedar';
    setSuggestedPodId(choice);
    setActiveScreen('pod-suggestion');
  };

  const declineMatch = () => {
    setSuggestedPodId(null);
    setActiveScreen('matching-status');
  };

  const joinSuggestedPod = () => {
    setActivePodId(suggestedPodId);
    setSuggestedPodId(null);
    setActiveScreen('commons-dashboard');
  };

  const leavePod = () => {
    if (activePodId) {
      setPodHistory([{ id: activePodId, when: 'just now' }, ...podHistory]);
      setActivePodId(null);
    }
    setActiveScreen('pod-history');
  };

  // ---------------- POD COMMONS CHAT ----------------
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      sender: 'You',
      text: chatInput.trim(),
      time: time,
      avatar: 'https://i.pravatar.cc/80?img=68',
      isMe: true
    };

    setChatMessages([...chatMessages, newMsg]);
    setChatInput('');
  };

  // ---------------- POD COMMONS AGREEMENTS ----------------
  const toggleAgreementItem = (idx) => {
    if (alignedAgreements.includes(idx)) {
      setAlignedAgreements(alignedAgreements.filter(i => i !== idx));
    } else {
      setAlignedAgreements([...alignedAgreements, idx]);
    }
  };

  // Current Pod Data
  const currentPod = podData[activePodId];

  return (
    <div className="w-full text-left select-none animate-fade">

      {/* ===================== 1. LEARNING HUB ===================== */}
      {activeScreen === 'learning' && (
        <div className="pad py-12 px-6 md:px-8">

          {/* Banner Hero Grid */}
          <div
            className="learning-hero text-white p-8 md:p-10 rounded-2xl mb-8 relative overflow-hidden shadow-custom-lg select-none"
            style={{ background: 'linear-gradient(135deg, #0B1E38 0%, #132339 40%, #0E4C8C 100%)' }}
          >
            {/* Background SVG deco */}
            <div className="absolute right-[-40px] bottom-[-40px] opacity-10 pointer-events-none">
              <Sparkles className="w-72 h-72" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center relative z-10">
              <div className="lg:col-span-3 text-left">
                <div className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-mono text-[#DCE6FB] mb-5 border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-amber"></span>
                  BOMA Member Learning Center
                </div>
                <h1 className="font-display font-extrabold text-[34px] text-white leading-tight mb-4">
                  Welcome to BOMA!
                </h1>
                <p className="text-[#DCE6FB] text-[15px] leading-relaxed mb-7 max-w-[500px]">
                  Your journey starts here. Discover how neighbor compatibility matching works, watch video tutorials, and complete your profile questions when you're ready to find your Pod.
                </p>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setActiveScreen('entry-path')}
                    className="bg-amber text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md hover:bg-[#2450C4] hover:-translate-y-[0.5px] transition-all cursor-pointer"
                  >
                    Start Onboarding Questions →
                  </button>
                  <button
                    onClick={openWhatsBomaModal}
                    className="bg-white/12 border border-white/30 text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-white/25 transition-all cursor-pointer"
                  >
                    What is BOMA?
                  </button>
                </div>
              </div>

              {/* Profile Status Widget Card */}
              <div className="lg:col-span-2 bg-white/7 backdrop-blur-xl border border-white/15 rounded-2xl p-6 text-white text-left">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#A5C4F3] font-semibold">
                    Profile Readiness
                  </span>
                  <span
                    style={{
                      backgroundColor: userOnboarded ? '#E1F5FE' : '#FFF3C4',
                      color: userOnboarded ? '#0E4C8C' : '#8A5300'
                    }}
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full select-none"
                  >
                    {userOnboarded ? 'Match-Ready' : 'Incomplete'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-display text-[42px] font-extrabold text-white leading-none">
                    {userOnboarded ? '82' : '--'}
                  </span>
                  <span className="text-sm text-[#DCE6FB] font-medium">/ 100 Readiness Score</span>
                </div>

                <div className="h-1 bg-white/15 rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full bg-amber transition-all duration-300"
                    style={{ width: userOnboarded ? '100%' : '15%' }}
                  />
                </div>

                <p className="text-xs text-[#B9CDE9] leading-relaxed mb-5">
                  {userOnboarded
                    ? '🎉 Profile complete! Your Readiness Score is 82. All Pod Matching and Commons features are fully unlocked.'
                    : '⚠️ Complete your 9 onboarding questions to calculate your Readiness Score and unlock Pod Matching & The Commons.'}
                </p>

                <button
                  onClick={() => setActiveScreen(userOnboarded ? 'profile' : 'entry-path')}
                  className="w-full bg-amber text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all text-center justify-center cursor-pointer shadow-md"
                >
                  {userOnboarded ? 'Go to Dashboard' : 'Complete Profile Now'}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Learning grid */}
          <div className="mb-10 text-left">
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1.5 font-bold">Interactive Learning</div>
            <h2 className="font-display font-extrabold text-2xl text-ink mb-5">Everything you need to get started</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-200">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-amber-soft text-amber flex items-center justify-center mb-4">
                    <Sparkles className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="font-display font-extrabold text-lg text-ink mb-2">What's BOMA?</h3>
                  <p className="text-ink-dim text-sm leading-relaxed mb-4">
                    BOMA flips traditional real estate. We match neighbors based on values, lifestyle, and housing intent first — creating trusted Pods before any financial commitment.
                  </p>
                  <div className="flex gap-2 flex-wrap mb-5">
                    <span className="bg-[#F0F4F8] text-navy-deep text-xs font-semibold px-2.5 py-1 rounded-full">Values Matching</span>
                    <span className="bg-[#F0F4F8] text-navy-deep text-xs font-semibold px-2.5 py-1 rounded-full">Zero Escrow Upfront</span>
                    <span className="bg-[#F0F4F8] text-navy-deep text-xs font-semibold px-2.5 py-1 rounded-full">Pod Commons</span>
                  </div>
                </div>
                <button
                  onClick={openWhatsBomaModal}
                  className="w-full bg-transparent border border-border text-ink rounded-lg py-2.5 text-sm font-bold hover:bg-panel-alt transition-colors cursor-pointer text-center"
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
                  <h3 className="font-display font-extrabold text-lg text-ink mb-2">How It Works</h3>
                  <p className="text-ink-dim text-sm leading-relaxed mb-4">
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
                  onClick={() => setActiveScreen('how-it-works')}
                  className="w-full bg-transparent border border-border text-ink rounded-lg py-2.5 text-sm font-bold hover:bg-panel-alt transition-colors cursor-pointer text-center"
                >
                  Explore Full 3-Stage Guide →
                </button>
              </div>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="mb-10 text-left">
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1.5 font-bold">Video Library</div>
            <h2 className="font-display font-extrabold text-2xl text-ink mb-2">Learning Videos &amp; Tutorials</h2>
            <p className="text-ink-dim text-[14.5px] leading-relaxed mb-6 max-w-[600px]">
              Watch short 2-minute video guides to understand co-housing dynamics, readiness metrics, and shared agreement scaffolding.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {[
                {
                  title: 'Intro to BOMA Co-housing',
                  thumb: '/assets/pod_community_realistic.png',
                  duration: '2:30',
                  tag: 'Getting Started',
                  url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  desc: 'Learn why matching neighbors first creates resilient, vibrant communities without financial risks up front.'
                },
                {
                  title: 'How Pod Matching Works',
                  thumb: '/assets/pod_austin.png',
                  duration: '3:15',
                  tag: 'Matching Engine',
                  url: '',
                  desc: 'Discover how our transparent rules-based engine evaluates lifestyle, decision-making style, and metro radius.'
                },
                {
                  title: 'Understanding Readiness Scores',
                  thumb: '/assets/pod_denver.png',
                  duration: '1:45',
                  tag: 'Scoring Guide',
                  url: '',
                  desc: 'Learn how self-reported readiness tiers and commitment timelines build your transparent readiness score.'
                },
                {
                  title: 'The Pod Commons & Agreements',
                  thumb: '/assets/pod_charleston.png',
                  duration: '4:00',
                  tag: 'Community Commons',
                  url: '',
                  desc: 'Explore Pod chat, agreement scaffolding, and consensus decision making before moving to Phase 2.'
                }
              ].map((v, i) => (
                <div
                  key={i}
                  onClick={() => openVideoModal(v.title, v.url, v.desc)}
                  className="border border-border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform duration-200 cursor-pointer"
                >
                  <div className="relative h-40 bg-navy-deep flex items-center justify-center overflow-hidden">
                    <img src={v.thumb} className="w-full h-full object-cover opacity-60" alt={v.title} />
                    <div className="absolute w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all">
                      <Play className="w-5 h-5 text-navy-deep fill-navy-deep ml-0.5" />
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 bg-black/75 text-white font-mono text-[10.5px] px-2 py-0.5 rounded">
                      {v.duration}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="bg-panel-alt text-navy-deep text-[10.5px] font-bold px-2 py-0.5 rounded-full w-fit mb-2">
                      {v.tag}
                    </span>
                    <h4 className="font-display font-bold text-sm text-navy-deep leading-snug mb-1">
                      {v.title}
                    </h4>
                    <p className="text-xs text-ink-dim leading-relaxed">
                      {v.desc.slice(0, 75)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== 2. MY PROFILE ===================== */}
      {activeScreen === 'profile' && (
        <div className="pad py-12 px-6 md:px-8">
          {/* Profile Banner */}
          <div 
            className="rounded-[20px] p-[30px] border border-border flex items-center gap-5 mb-[26px]"
            style={{ background: 'linear-gradient(120deg, var(--color-teal-soft) 0%, var(--color-panel) 70%)' }}
          >
            {currentUser?.avatar_url ? (
              <img 
                src={currentUser.avatar_url} 
                className="rounded-full object-cover shrink-0 w-[72px] h-[72px] border border-border" 
                alt={currentUser.name || 'User'} 
              />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-2xl font-display flex-shrink-0">
                {(currentUser?.name || currentUser?.email || 'U').substring(0, 1).toUpperCase()}
              </div>
            )}
            <div className="text-left">
              <h3 className="font-display font-extrabold text-[22px] text-ink leading-tight">{currentUser?.name || 'User'}</h3>
              {userOnboarded ? (
                <span className="inline-block bg-[#EAFDF8] text-sage border border-sage/10 text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5 select-none">
                  Readiness: {currentUser?.readiness_score || 82} — Match-Ready
                </span>
              ) : (
                <span className="inline-block bg-[#FDE8E8] text-rust border border-rust/10 text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5 select-none">
                  Readiness: Incomplete — Onboarding Pending
                </span>
              )}
              <span className="block text-[13px] text-ink-dim mt-1">
                {currentUser?.location_city || 'Austin, TX'} · Member since {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'June 2026'}
              </span>
            </div>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-[26px] select-none text-left">
            <div className="border border-border rounded-custom p-5 bg-panel shadow-custom flex flex-col">
              <div className="font-display text-[28px] font-extrabold text-ink leading-tight">
                {userOnboarded ? (currentUser?.readiness_score || '82') : '--'}
              </div>
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1 font-semibold">
                Readiness Score
              </div>
            </div>
            <div className="border border-border rounded-custom p-5 bg-panel shadow-custom flex flex-col">
              <div className="font-display text-[28px] font-extrabold text-ink leading-tight">
                {userOnboarded ? 'Matching' : 'Incomplete'}
              </div>
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1 font-semibold">
                Current Status
              </div>
            </div>
            <div className="border border-border rounded-custom p-5 bg-panel shadow-custom flex flex-col">
              <div className="font-display text-[28px] font-extrabold text-ink leading-tight">
                {userOnboarded ? (currentUser?.location_city || 'Austin, TX') : 'Not Set'}
              </div>
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1 font-semibold">
                Preferred Location
              </div>
            </div>
            <div className="border border-border rounded-custom p-5 bg-panel shadow-custom flex flex-col">
              <div className="font-display text-[28px] font-extrabold text-ink leading-tight">
                {userOnboarded ? (currentUser?.commitment_timeline || '5+ yrs') : 'Not Set'}
              </div>
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim mt-1 font-semibold">
                Commitment
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-left">
            {/* Preferences Summary Card */}
            <div className="border border-border rounded-custom p-[26px] bg-panel shadow-custom flex flex-col justify-between">
              {userOnboarded ? (
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
                        <span>{currentUser?.commitment_timeline || '5+ years'} commitment</span>
                      </li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setActiveScreen('profile-edit')}
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
                      ⚠️ Profile incomplete — complete your 9 onboarding questions to calculate preferences, readiness score, and location bounds.
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
              {userOnboarded ? (
                <>
                  <div>
                    <h4 className="font-display font-extrabold text-lg text-ink mb-2">Status</h4>
                    <p className="text-[13.5px] text-ink-dim mt-2 font-medium">Onboarding complete → Matching in progress</p>
                    <div className="h-2 rounded-[6px] bg-panel-alt overflow-hidden mt-[14px]">
                      <div 
                        className="h-full rounded-[6px] transition-all duration-300" 
                        style={{ width: '50%', background: 'linear-gradient(90deg, var(--color-teal), var(--color-amber))' }}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveScreen('status-tracking')}
                    className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-[14px]"
                  >
                    View status tracker
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="font-display font-extrabold text-lg text-ink mb-2">Status</h4>
                    <p className="text-[13.5px] text-rust font-semibold mt-2">Onboarding pending → Profile Incomplete</p>
                    <div className="h-2 rounded-[6px] bg-panel-alt overflow-hidden mt-[14px]">
                      <div 
                        className="h-full rounded-[6px] bg-rust transition-all duration-300" 
                        style={{ width: '15%' }}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveScreen('entry-path')}
                    className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-[14px]"
                  >
                    Start Questionnaire →
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
      )}

      {/* ===================== 3. EDIT PROFILE PREFERENCES ===================== */}
      {activeScreen === 'profile-edit' && (
        <div className="pad py-12 px-6 md:px-8 text-left">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Profile / Edit Preferences</div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-5">Edit preferences</h3>

          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm max-w-[520px] select-none">
            <div className="mb-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Preferred city or metro</label>
              <input
                type="text"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                className="w-full bg-panel border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Setting preference</label>
                <select
                  value={editSetting}
                  onChange={(e) => setEditSetting(e.target.value)}
                  className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber cursor-pointer font-semibold"
                >
                  <option value="Urban">Urban</option>
                  <option value="Suburban">Suburban</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Primary housing intent</label>
                <select
                  value={editIntent}
                  onChange={(e) => setEditIntent(e.target.value)}
                  className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber cursor-pointer font-semibold"
                >
                  <option value="Purchase primary residence">Purchase primary residence</option>
                  <option value="Co-develop property">Co-develop property</option>
                  <option value="Investment hold">Investment hold</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveScreen('profile')}
                className="bg-transparent border border-border text-ink rounded-lg py-2 px-5 text-sm font-bold hover:bg-panel-alt transition-colors cursor-pointer"
              >
                Cancel
              </button>
               <button
                onClick={async () => {
                  if (currentUser?.id) {
                    try {
                      const updatedUser = await updateUser(currentUser.id, {
                        location_city: editCity,
                        setting_preference: editSetting.toLowerCase(),
                        housing_intent: editIntent === 'Purchase primary residence' ? 'purchase' : editIntent === 'Co-develop property' ? 'co-develop' : 'investment'
                      });
                      if (setCurrentUser) {
                        setCurrentUser(updatedUser);
                      }
                    } catch (err) {
                      console.error('Error updating profile preferences:', err);
                    }
                  }
                  setActiveScreen('profile');
                }}
                className="bg-ink text-white rounded-lg py-2 px-5 text-sm font-bold hover:bg-[#2450C4] transition-all cursor-pointer shadow-md"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 4. READINESS BREAKDOWN ===================== */}
      {activeScreen === 'readiness-detail' && (
        <div className="pad py-12 px-6 md:px-8 text-left select-none">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Profile / Readiness Breakdown</div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-1.5">Readiness breakdown</h3>
          <p className="text-ink-dim text-[14px] leading-relaxed mb-6 max-w-[480px]">
            A rules-based score across four alignment categories. This updates automatically as you edit your preferences.
          </p>

          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm max-w-[520px] space-y-5">
            {[
              { label: 'Lifestyle alignment', val: 90 },
              { label: 'Location flexibility', val: 75 },
              { label: 'Financial readiness tier', val: 80 },
              { label: 'Commitment clarity', val: 85 }
            ].map((cat, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
                  <span>{cat.label}</span>
                  <span className="font-mono text-xs">{cat.val} / 100</span>
                </div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-amber transition-all duration-300" style={{ width: `${cat.val}%` }} />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveScreen('profile')}
            className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
          >
            Back to profile
          </button>
        </div>
      )}

      {/* ===================== 5. STATUS TRACKER ===================== */}
      {activeScreen === 'status-tracking' && (
        <div className="pad py-12 px-6 md:px-8 text-left select-none">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Profile / Status Tracker</div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-6">Your journey so far</h3>

          {/* Vertical Timeline */}
          <div className="max-w-[480px] space-y-6 relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border mb-8">
            {[
              { label: 'Account created & verified', desc: 'Completed', done: true },
              { label: 'Onboarding completed', desc: userOnboarded ? 'Completed' : 'Pending — Complete 9 questions', done: userOnboarded },
              { label: 'Readiness score calculated', desc: userOnboarded ? 'Score: 82 — Match-Ready' : 'Pending profile completion', done: userOnboarded },
              { label: 'Admin review', desc: userOnboarded ? 'Approved' : 'Pending submission', done: userOnboarded },
              { label: 'Pod match suggested', desc: userOnboarded ? (activePodId ? 'Completed' : 'Not yet started') : 'Locked — Complete profile first', done: userOnboarded && !!activePodId },
              { label: 'Pod joined', desc: activePodId ? `Active in ${podData[activePodId]?.name}` : (podHistory.length > 0 ? 'Searching for a new Pod' : 'Not yet started'), done: !!activePodId }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                {/* Dot */}
                <div className={`absolute left-[-29px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${step.done ? 'bg-amber border-amber text-white' : 'bg-white border-border text-ink-dim'
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
      )}

      {/* ===================== 6. MATCHING ENGINE SIMULATOR ===================== */}
      {activeScreen === 'matching-status' && (
        <div className="max-w-[500px] mx-auto text-center select-none py-16">
          <div className="w-full bg-white border border-border rounded-2xl p-10 shadow-custom flex flex-col items-center">

            <div className="w-12 h-12 rounded-xl bg-teal-soft flex items-center justify-center text-teal mb-4 animate-pulse">
              <SearchIcon className="w-6 h-6" />
            </div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-semibold">Matching</div>

            <h1 className="font-display text-[24px] font-extrabold text-ink mb-2 leading-none">Finding your Pod</h1>

            {/* Pulse dots animation */}
            <div className="flex gap-1.5 my-4 justify-center items-center h-4 select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-amber animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-amber animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-amber animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>

            <p className="text-ink-dim text-sm leading-relaxed mb-6 max-w-[360px]">
              The matching engine is comparing your readiness profile against the current pool.
            </p>

            <button
              onClick={simulateMatch}
              className="bg-amber text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer w-full"
            >
              Simulate: Match found
            </button>
          </div>
        </div>
      )}

      {/* ===================== 7. POD SUGGESTION ===================== */}
      {activeScreen === 'on-pod-suggestion' || activeScreen === 'pod-suggestion' && suggestedPodId && (
        <div className="pad py-12 px-6 md:px-8 text-left">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Match Found</div>
          <h1 className="font-display text-[26px] font-extrabold text-ink mb-5 leading-tight">We found a Pod for you</h1>

          <div className="border border-border rounded-2xl p-6 bg-white shadow-custom max-w-[560px] select-none text-left">
            <div className="flex items-center gap-3.5 mb-4.5">
              <div className="flex -space-x-2">
                {podData[suggestedPodId]?.members.map((m, i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/60?img=${m.img}`}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white"
                    alt={m.name}
                  />
                ))}
              </div>
              <h4 className="font-display font-extrabold text-[17px] text-ink leading-tight">
                {podData[suggestedPodId]?.name} — {podData[suggestedPodId]?.members.length + 1} members
              </h4>
            </div>

            <div className="flex gap-2 flex-wrap mb-4.5">
              {podData[suggestedPodId]?.tags.map((tag, i) => (
                <span key={i} className="bg-amber-soft text-amber text-xs font-bold px-3 py-1 rounded-full border border-amber/10">
                  {tag}
                </span>
              ))}
            </div>

            {/* Matching alignment score */}
            <div className="flex items-center gap-3.5 mb-2.5">
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-amber" style={{ width: `${podData[suggestedPodId]?.matchPct}%` }} />
              </div>
              <span className="font-mono text-sm font-bold text-ink leading-none">
                {podData[suggestedPodId]?.matchPct}%
              </span>
            </div>

            <p className="text-[12.5px] text-ink-dim font-medium italic mb-6">
              Overall alignment with your readiness profile
            </p>

            <button
              onClick={() => setActiveScreen('pod-preview')}
              className="bg-amber text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer w-full text-center"
            >
              View Pod
            </button>
          </div>
        </div>
      )}

      {/* ===================== 8. POD PREVIEW ===================== */}
      {activeScreen === 'pod-preview' && suggestedPodId && (
        <div className="pad py-12 px-6 md:px-8 text-left select-none">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Matching / Pod Preview</div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-5 leading-tight">
            {podData[suggestedPodId]?.name}
          </h3>

          <div className="border border-border rounded-2xl p-5 bg-white shadow-sm max-w-[560px] space-y-4 text-left">
            {podData[suggestedPodId]?.members.map((m, idx) => (
              <div key={idx} className="flex justify-between items-center gap-3 border-b border-border/70 last:border-b-0 pb-3.5 last:pb-0">
                <div className="flex items-center gap-3">
                  <img src={`https://i.pravatar.cc/80?img=${m.img}`} className="w-10 h-10 rounded-full object-cover border border-border" alt={m.name} />
                  <div className="flex flex-col">
                    <b className="text-sm font-bold text-ink leading-tight">{m.name}</b>
                    <span className="text-[11.5px] text-ink-dim font-semibold mt-0.5">{m.detail}</span>
                  </div>
                </div>
                <span className="bg-[#EAFDF8] text-sage border border-sage/10 text-[11px] font-bold px-2.5 py-0.5 rounded">
                  {m.score}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3.5 mt-6">
            <button
              onClick={declineMatch}
              className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer"
            >
              Decline
            </button>
            <button
              onClick={() => setActiveScreen('confirm-join')}
              className="bg-amber text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer"
            >
              Join Pod
            </button>
          </div>
        </div>
      )}

      {/* ===================== 9. CONFIRM JOIN SCREEN ===================== */}
      {activeScreen === 'confirm-join' && suggestedPodId && (
        <div className="max-w-[500px] mx-auto text-center select-none py-16 animate-fade">
          <div className="w-full bg-white border border-border rounded-2xl p-10 shadow-custom flex flex-col items-center">

            <div className="w-12 h-12 rounded-xl bg-amber-soft text-amber flex items-center justify-center mb-4">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-3 font-semibold">You're In</div>

            <h1 className="font-display text-[24px] font-extrabold text-ink mb-3 leading-tight">
              Welcome to {podData[suggestedPodId]?.name}
            </h1>

            <p className="text-ink-dim text-sm leading-relaxed mb-8 max-w-[360px]">
              Your Pod is now active. Head to the Commons to meet your neighbors.
            </p>

            <button
              onClick={joinSuggestedPod}
              className="bg-amber text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer w-full text-center"
            >
              Enter the Commons
            </button>
          </div>
        </div>
      )}

      {/* ===================== 10. COMMONS DASHBOARD ===================== */}
      {activeScreen === 'commons-dashboard' && (
        <div className="pad py-12 px-6 md:px-8 text-left select-none animate-fade">

          {/* Active Pod Banner Card */}
          {currentPod ? (
            <div className="relative w-full rounded-2xl overflow-hidden h-[240px] mb-6 shadow-custom border border-border/5">
              <img src={currentPod.photo} className="w-full h-full object-cover" alt={currentPod.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/40 to-transparent p-6 md:p-8 flex items-end text-left select-none">
                <div className="text-white">
                  <h1 className="font-display font-extrabold text-[26px] md:text-[32px] text-white leading-tight mb-1">
                    {currentPod.name}
                  </h1>
                  <span className="text-[13px] text-[#A3B3C8] font-semibold">
                    {currentPod.location} · Formed {currentPod.formed}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-2xl p-8 bg-white shadow-sm flex flex-col items-center justify-center text-center py-16 mb-6">
              <h2 className="font-display font-extrabold text-lg text-navy-deep mb-2">No active Pod</h2>
              <p className="text-ink-dim text-sm mb-6 max-w-[360px]">Find a new match suggestions in the pool to get started.</p>
              <button onClick={() => setActiveScreen('matching-status')} className="bg-amber text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md hover:bg-[#2450C4] cursor-pointer">
                Find a match
              </button>
            </div>
          )}

          {/* KPIs */}
          {currentPod && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 select-none text-center">
              <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
                <div className="font-display text-[26px] font-extrabold text-ink leading-tight">
                  {currentPod.members.length + 1}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Members</div>
              </div>
              <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
                <div className="font-display text-[26px] font-extrabold text-ink leading-tight">
                  {currentPod.avgReadiness}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Avg. Readiness</div>
              </div>
              <div className="border border-border rounded-xl p-4 bg-white shadow-sm flex flex-col">
                <div className="font-display text-[26px] font-extrabold text-ink leading-tight text-sage">
                  {currentPod.health}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-ink-dim font-semibold mt-1">Pod Health</div>
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
              <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-ink">
                    <Users className="w-5 h-5" />
                    <h4 className="font-display font-extrabold text-base text-ink">Member overview</h4>
                  </div>
                  <p className="text-ink-dim text-sm leading-relaxed mb-4">
                    See who's in your Pod and where they stand.
                  </p>
                </div>
                <button
                  onClick={() => setActiveScreen('commons-members')}
                  className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2"
                >
                  View members
                </button>
              </div>

              {/* Box 2: Agreement */}
              <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-ink">
                    <FileText className="w-5 h-5" />
                    <h4 className="font-display font-extrabold text-base text-ink">Agreement scaffolding</h4>
                  </div>
                  <p className="text-ink-dim text-sm leading-relaxed mb-4">
                    Start shaping how your Pod will make decisions together.
                  </p>
                </div>
                <button
                  onClick={() => setActiveScreen('commons-agreement')}
                  className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2"
                >
                  Open agreement
                </button>
              </div>

              {/* Box 3: Chat */}
              <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-ink">
                    <MessageSquare className="w-5 h-5" />
                    <h4 className="font-display font-extrabold text-base text-ink">Pod chat</h4>
                  </div>
                  <p className="text-ink-dim text-sm leading-relaxed mb-4">
                    Connect and align with your Pod members in real-time.
                  </p>
                </div>
                <button
                  onClick={() => setActiveScreen('commons-chat')}
                  className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2"
                >
                  Open chat
                </button>
              </div>

              {/* Box 4: Settings */}
              <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-ink">
                    <Settings className="w-5 h-5" />
                    <h4 className="font-display font-extrabold text-base text-ink">Pod settings</h4>
                  </div>
                  <p className="text-ink-dim text-sm leading-relaxed mb-4">
                    Manage notifications, or exit the Pod.
                  </p>
                </div>
                <button
                  onClick={() => setActiveScreen('commons-settings')}
                  className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold w-fit hover:bg-panel-alt transition-colors cursor-pointer mt-2"
                >
                  Open settings
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ===================== 11. COMMONS MEMBERS ===================== */}
      {activeScreen === 'commons-members' && currentPod && (
        <div className="pad py-12 px-6 md:px-8 text-left select-none animate-fade">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">The Commons / Members</div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-5">Member overview</h3>

          <div className="border border-border rounded-2xl p-5 bg-white shadow-sm max-w-[560px] space-y-4 text-left">
            {currentPod.members.map((m, idx) => (
              <div key={idx} className="flex justify-between items-center gap-3 border-b border-border/70 last:border-b-0 pb-3.5 last:pb-0">
                <div className="flex items-center gap-3">
                  <img src={`https://i.pravatar.cc/80?img=${m.img}`} className="w-10 h-10 rounded-full object-cover border border-border" alt={m.name} />
                  <div className="flex flex-col">
                    <b className="text-sm font-bold text-ink leading-tight">{m.name}</b>
                    <span className="text-[11.5px] text-ink-dim font-medium mt-0.5">Joined {currentPod.formed} · {m.detail.split(' · ')[0]}</span>
                  </div>
                </div>
                <span className="bg-[#EAFDF8] text-sage border border-sage/10 text-[10.5px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Active
                </span>
              </div>
            ))}

            {/* Jordan Lee (Me) */}
            <div className="flex justify-between items-center gap-3 pt-3.5 border-t border-border/70">
              <div className="flex items-center gap-3">
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} className="w-10 h-10 rounded-full object-cover border border-border" alt={currentUser.name || 'User'} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#0E4C8C_0%,#0B1E38_100%)] flex items-center justify-center text-white font-extrabold text-[12px] font-display flex-shrink-0">
                    {(currentUser?.name || currentUser?.email || 'U').substring(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <b className="text-sm font-bold text-ink leading-tight">{currentUser?.name || 'User'} (you)</b>
                  <span className="text-[11.5px] text-ink-dim font-medium mt-0.5">Joined today</span>
                </div>
              </div>
              <span className="bg-teal-soft text-teal border border-teal/10 text-[10.5px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                New
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveScreen('commons-dashboard')}
            className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
          >
            Back to dashboard
          </button>
        </div>
      )}

      {/* ===================== 12. COMMONS AGREEMENT ===================== */}
      {activeScreen === 'commons-agreement' && (
        <div className="pad py-12 px-6 md:px-8 text-left select-none animate-fade">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">The Commons / Agreement</div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-1.5">Agreement scaffolding</h3>
          <p className="text-ink-dim text-[14px] leading-relaxed mb-6 max-w-[560px]">
            A working social draft — not a binding contract. Align on core rules here before formalizing with legal counsel in Phase 2.
          </p>

          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm max-w-[560px]">
            {/* Progress Row */}
            <div className="flex flex-col mb-5">
              <div className="flex justify-between items-center text-sm font-bold text-ink mb-1.5">
                <span>Completion Status</span>
                <span className="font-mono text-xs">{alignedAgreements.length} / 5 Aligned</span>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber transition-all duration-300"
                  style={{ width: `${(alignedAgreements.length / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <ul className="divide-y divide-border">
              {[
                { title: "How we'll make group decisions", desc: "Consensus vote required for purchases > $1,000" },
                { title: "How new members can join later", desc: "75% Pod approval & readiness verification" },
                { title: "How someone can exit the Pod", desc: "60-day notice & equity transfer framework" },
                { title: "Shared expectations around communication", desc: "Weekly check-ins & shared Commons chat" },
                { title: "Timeline expectations before moving to Phase 2", desc: "90 days of Pod bonding prior to site selection" }
              ].map((item, idx) => {
                const isChecked = alignedAgreements.includes(idx);
                return (
                  <li
                    key={idx}
                    onClick={() => toggleAgreementItem(idx)}
                    className="flex gap-4 py-4.5 cursor-pointer first:pt-0 last:pb-0 select-none group"
                  >
                    <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-amber border-amber text-white' : 'border-border bg-white group-hover:border-amber'
                      }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex flex-col text-left">
                      <b className="text-[13.5px] font-bold text-ink leading-snug">{item.title}</b>
                      <span className="text-[11.5px] text-ink-dim font-medium mt-1 leading-snug">{item.desc}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Document Preview card */}
          <div className="border border-dashed border-teal rounded-2xl p-6 bg-gradient-to-br from-bg to-white max-w-[560px] mt-5">
            <div className="flex gap-4 items-center mb-4 flex-wrap sm:flex-nowrap">
              <div className="w-11 h-11 rounded-xl bg-amber-soft text-amber flex items-center justify-center flex-shrink-0 text-xl font-bold">
                📄
              </div>
              <div className="text-left flex flex-col">
                <h4 className="font-display font-extrabold text-[15px] text-ink leading-tight">Draft Scaffolding Document</h4>
                <span className="text-xs text-ink-dim font-medium mt-0.5">Export as PDF or share with attorney before Phase 2</span>
              </div>
            </div>

            <button
              onClick={openAgreementDocModal}
              className="w-full bg-amber text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all text-center justify-center cursor-pointer shadow-md"
            >
              Preview &amp; Export Document (.PDF)
            </button>
          </div>

          <button
            onClick={() => setActiveScreen('commons-dashboard')}
            className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
          >
            Back to dashboard
          </button>
        </div>
      )}

      {/* ===================== 13. COMMONS CHAT ===================== */}
      {activeScreen === 'commons-chat' && currentPod && (
        <div className="pad py-12 px-6 md:px-8 text-left select-none animate-fade">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">The Commons / Chat</div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-1">Pod chat</h3>
          <p className="text-ink-dim text-[14px] leading-relaxed mb-6 max-w-[560px]">
            Connect and stay aligned with your Pod members in real-time.
          </p>

          <div className="border border-border rounded-2xl bg-white shadow-custom max-w-[680px] overflow-hidden flex flex-col h-[520px]">
            {/* Header bar */}
            <div className="border-b border-border p-4.5 px-6 bg-[#F8FAFC] flex justify-between items-center">
              <div className="flex flex-col text-left">
                <h4 className="font-display font-extrabold text-[15.5px] text-ink leading-tight">
                  {currentPod.name}
                </h4>
                <span className="text-[11px] text-ink-dim font-semibold mt-0.5">
                  {currentPod.members.length + 1} Active Members • Online
                </span>
              </div>

              <div className="flex -space-x-1.5 overflow-hidden">
                {currentPod.members.map((m, i) => (
                  <img key={i} src={`https://i.pravatar.cc/80?img=${m.img}`} className="w-7 h-7 rounded-full object-cover border border-white" alt={m.name} />
                ))}
                <img src="https://i.pravatar.cc/80?img=68" className="w-7 h-7 rounded-full object-cover border border-white" alt="You" />
              </div>
            </div>

            {/* Chat Messages Log */}
            <div
              ref={chatLogRef}
              className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FAFCFF] scroll-smooth"
            >
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 max-w-[85%] ${msg.isMe ? 'ml-auto flex-row-reverse text-right' : 'text-left'}`}>
                  <img src={msg.avatar} className="w-8.5 h-8.5 rounded-full object-cover border border-border mt-0.5 flex-shrink-0" alt={msg.sender} />
                  <div className="flex flex-col">
                    {!msg.isMe && (
                      <span className="text-[11.5px] font-bold text-ink mb-1">
                        {msg.sender}
                      </span>
                    )}
                    <div className={`p-3 px-4 rounded-2xl text-[13px] leading-relaxed relative ${msg.isMe
                        ? 'bg-amber text-white rounded-tr-none'
                        : 'bg-white border border-border text-ink rounded-tl-none shadow-sm'
                      }`}>
                      {msg.text}
                      <span className={`block text-[9.5px] mt-1.5 font-mono ${msg.isMe ? 'text-white/60' : 'text-ink-dim/70'
                        }`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Row */}
            <form onSubmit={handleSendChatMessage} className="border-t border-border p-4.5 bg-white flex gap-3 items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Type a message to ${currentPod.name}...`}
                className="flex-1 bg-panel border border-border rounded-full px-4.5 py-2.5 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium"
              />
              <button
                type="submit"
                className="bg-amber text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#2450C4] active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>

          <button
            onClick={() => setActiveScreen('commons-dashboard')}
            className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
          >
            Back to dashboard
          </button>
        </div>
      )}

      {/* ===================== 14. COMMONS SETTINGS ===================== */}
      {activeScreen === 'commons-settings' && (
        <div className="pad py-12 px-6 md:px-8 text-left select-none animate-fade">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">The Commons / Settings</div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-5">Pod settings</h3>

          <div className="space-y-4 max-w-[480px]">
            <div className="border border-border rounded-xl p-5 bg-white shadow-sm">
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2 font-semibold">Notifications</label>
              <select className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber cursor-pointer font-semibold">
                <option>All activity</option>
                <option>Mentions only</option>
                <option>Off</option>
              </select>
            </div>

            <div className="border border-border rounded-xl p-5 bg-white shadow-sm">
              <h4 className="font-display font-bold text-base text-rust mb-1">Leave this Pod</h4>
              <p className="text-ink-dim text-xs leading-relaxed my-2">
                If this isn't the right fit, you can exit and return to the matching pool for another opportunity.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to leave this Pod?')) {
                    leavePod();
                  }
                }}
                className="bg-transparent border border-rust text-rust rounded-lg px-4 py-2 text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer mt-1"
              >
                Exit Pod
              </button>
            </div>
          </div>

          <button
            onClick={() => setActiveScreen('commons-dashboard')}
            className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
          >
            Back to dashboard
          </button>
        </div>
      )}

      {/* ===================== 15. MY PODS HISTORY ===================== */}
      {activeScreen === 'pod-history' && (
        <div className="pad py-12 px-6 md:px-8 text-left select-none">
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Profile / My Pods</div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-6">My Pods</h3>

          <div className="space-y-6 max-w-[560px] text-left">
            {/* Active Pod Section */}
            {activePodId && currentPod ? (
              <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4 gap-4 flex-wrap sm:flex-nowrap">
                  <div className="flex flex-col text-left">
                    <h4 className="font-display font-extrabold text-lg text-ink leading-tight mb-1">
                      {currentPod.name}
                    </h4>
                    <span className="bg-[#EAFDF8] text-sage border border-sage/10 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider w-fit">
                      Active
                    </span>
                  </div>
                  <img src={currentPod.photo} className="w-[84px] h-[58px] object-cover rounded-lg border border-border" alt={currentPod.name} />
                </div>

                <p className="text-ink-dim text-sm leading-relaxed mb-6">
                  {currentPod.location} · {currentPod.members.length + 1} members · Avg. readiness {currentPod.avgReadiness}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveScreen('commons-dashboard')}
                    className="bg-transparent border border-border text-ink rounded-lg py-2 px-4 text-xs font-bold hover:bg-panel-alt transition-colors cursor-pointer"
                  >
                    View Pod
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to leave this Pod?')) {
                        leavePod();
                      }
                    }}
                    className="bg-transparent border border-rust text-rust rounded-lg py-2 px-4 text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Leave Pod
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-border rounded-2xl p-8 bg-white shadow-sm flex flex-col text-left">
                <h4 className="font-display font-extrabold text-lg text-ink mb-2">You're not in a Pod right now</h4>
                <p className="text-ink-dim text-sm leading-relaxed mb-6">
                  Ready to find a new match? BOMA will compare your readiness profile against the current pool.
                </p>
                <button
                  onClick={() => setActiveScreen('matching-status')}
                  className="bg-amber text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer w-fit"
                >
                  Find a new Pod
                </button>
              </div>
            )}

            {/* History Section */}
            {podHistory.length > 0 && (
              <div className="mt-8 flex flex-col">
                <div className="font-mono text-[11px] uppercase tracking-wider text-ink-dim mb-3 font-semibold">
                  Past Pods
                </div>
                <div className="border border-border rounded-2xl p-5 bg-white shadow-sm space-y-4">
                  {podHistory.map((hist, idx) => {
                    const p = podData[hist.id];
                    if (!p) return null;
                    return (
                      <div key={idx} className="flex justify-between items-center gap-3 border-b border-border/70 last:border-b-0 pb-3.5 last:pb-0">
                        <div className="flex items-center gap-3">
                          <img src={p.photo} className="w-10 h-10 rounded-lg object-cover border border-border" alt={p.name} />
                          <div className="flex flex-col">
                            <b className="text-sm font-bold text-ink leading-tight">{p.name}</b>
                            <span className="text-[11.5px] text-ink-dim font-medium mt-0.5">Left {hist.when} · {p.location}</span>
                          </div>
                        </div>
                        <span className="bg-red-50 text-rust border border-rust/10 text-[10.5px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                          Left
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
