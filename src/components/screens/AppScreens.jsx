import React, { useState, useEffect, useRef } from 'react';
import { GATED_SCREENS } from '../../constants/screens';
import { updateUser, fetchUserProfile, updateUserPreferencesAndScore } from '../../api/users';
import { fetchPodDetails, fetchPodMembers, leavePod as leavePodApi, dissolvePod, updatePodAgreements } from '../../api/pods';
import { findSuggestedMatches, acceptMatchedPod, declineMatchedPod } from '../../api/matching';
import { getReadinessScoreBreakdown } from '../../api/onboarding';

// Subcomponents
import { LockedFeatureView, MemberWaitingView } from './LockedFeatureView';
import LearningHub from './LearningHub';
import ProfileDashboard from './ProfileDashboard';
import ProfileUpdate from './ProfileUpdate';
import ProfileEdit from './ProfileEdit';
import ReadinessDetail from './ReadinessDetail';
import StatusTracker from './StatusTracker';
import MatchingStatus from './MatchingStatus';
import { PodSuggestion, PodPreview, ConfirmJoin } from './PodSuggestion';
import CommonsDashboard from './CommonsDashboard';
import CommonsMembers from './CommonsMembers';
import CommonsAgreement from './CommonsAgreement';
import CommonsChat from './CommonsChat';
import CommonsSettings from './CommonsSettings';
import PodHistory from './PodHistory';

/**
 * Format Helpers for DB option keys
 */
const formatTimeline = (timeline) => {
  if (!timeline) return 'Not Set';
  if (timeline === 'timeline_5yr') return '5+ years';
  if (timeline === 'timeline_2yr') return '2+ years';
  if (timeline === 'timeline_flexible') return 'Flexible';
  return timeline;
};

const getCategoryScores = (user, breakdown) => {
  if (breakdown && breakdown.appliedSteps) {
    const getStepScore = (stepNum, defaultVal) => {
      const steps = breakdown.appliedSteps.filter(s => s.stepNumber === stepNum);
      if (steps.length === 0) return defaultVal;
      return Math.round(steps.reduce((sum, s) => sum + s.points, 0) / steps.length);
    };

    return {
      lifestyle: getStepScore(3, 85),
      location: getStepScore(4, 75),
      financial: getStepScore(5, 50),
      commitment: getStepScore(7, 75)
    };
  }

  let lifestyle = 80;
  if (user?.decision_style === 'consensus') lifestyle = 85;
  else if (user?.decision_style === 'flexible') lifestyle = 75;
  else if (user?.decision_style === 'delegated') lifestyle = 60;

  let location = 75;
  if (user?.location_radius) {
    location = Math.min(100, Math.max(40, Number(user.location_radius) * 2));
  }

  let financial = 80;
  const dp = user?.down_payment_tier;
  if (dp === 'dp_20+' || dp === '20%+') financial = 95;
  else if (dp === 'dp_10_20' || dp === '10–20%') financial = 85;
  else if (dp === 'dp_5_10' || dp === '5–10%') financial = 70;
  else if (dp === 'dp_0_5' || dp === '0–5%') financial = 50;

  let commitment = 85;
  const timeline = user?.commitment_timeline;
  if (timeline === 'timeline_5yr' || timeline === '5+ years') commitment = 90;
  else if (timeline === 'timeline_2yr' || timeline === '2+ years') commitment = 75;
  else if (timeline === 'timeline_flexible' || timeline === 'Flexible') commitment = 60;

  return { lifestyle, location, financial, commitment };
};

export default function AppScreens({
  activeScreen,
  setActiveScreen,
  userOnboarded,
  setUserOnboarded,
  currentUser,
  setCurrentUser,
  podHistory,
  setPodHistory,
  openVideoModal,
  openWhatsBomaModal,
  openAgreementDocModal,
  chatMessages,
  setChatMessages,
  alignedAgreements,
  setAlignedAgreements,
  showConfirm,
  showToast
}) {
  // Local edit profile states
  const [editCity, setEditCity] = useState('Austin, TX');
  const [editSetting, setEditSetting] = useState('Suburban');
  const [editIntent, setEditIntent] = useState('Purchase primary residence');
  const [editName, setEditName] = useState('');
  const [breakdown, setBreakdown] = useState(null);

  useEffect(() => {
    async function loadBreakdown() {
      if (!currentUser?.id) return;
      try {
        const data = await getReadinessScoreBreakdown(currentUser.id);
        setBreakdown(data);
      } catch (err) {
        console.error('Failed to load readiness score breakdown:', err);
      }
    }
    if (activeScreen === 'readiness-detail') {
      loadBreakdown();
    }
  }, [currentUser, activeScreen]);

  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editCityDropdownOpen, setEditCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef(null);

  // Close city dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setEditCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB.", "error");
      return;
    }

    setUploadingAvatar(true);
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64String = reader.result;
        await updateUser(currentUser.id, { avatar_url: base64String });

        if (setCurrentUser) {
          setCurrentUser({
            ...currentUser,
            avatar_url: base64String
          });
        }

        showToast("Profile image updated successfully!", "success");
      } catch (err) {
        console.error("Failed to update profile image:", err);
        showToast("Failed to update profile image: " + err.message, "error");
      } finally {
        setUploadingAvatar(false);
      }
    };

    reader.onerror = () => {
      showToast("Failed to read image file.", "error");
      setUploadingAvatar(false);
    };

    reader.readAsDataURL(file);
  };

  // Path B Pod States
  const [userPod, setUserPod] = useState(null);
  const [podMembersList, setPodMembersList] = useState([]);
  const [loadingPod, setLoadingPod] = useState(true);
  const [suggestedPod, setSuggestedPod] = useState(null);
  const [matchingLoading, setMatchingLoading] = useState(false);

  useEffect(() => {
    setSuggestedPod(null);
  }, [currentUser]);

  // Pre-populate edit form fields when entering profile-edit or profile-update screen
  useEffect(() => {
    if (activeScreen === 'profile-edit' && currentUser) {
      setEditCity(currentUser.location_city || 'Austin, TX');
      const setting = currentUser.setting_preference || 'urban';
      setEditSetting(setting.charAt(0).toUpperCase() + setting.slice(1));
      const intent = currentUser.housing_intent;
      if (intent === 'purchase') setEditIntent('Purchase primary residence');
      else if (intent === 'co-develop') setEditIntent('Co-develop property');
      else if (intent === 'investment') setEditIntent('Investment hold');
      else setEditIntent('Purchase primary residence');
    }
    if (activeScreen === 'profile-update' && currentUser) {
      setEditName(currentUser.name || '');
    }
  }, [activeScreen, currentUser]);

  useEffect(() => {
    if (!currentUser?.id) {
      setLoadingPod(false);
      return;
    }

    async function loadPodData() {
      try {
        if (userPod?.is_simulated) {
          setLoadingPod(false);
          return;
        }
        const details = await fetchPodDetails(currentUser.id);
        setUserPod(details);

        if (details) {
          if (details.aligned_agreements) {
            setAlignedAgreements(details.aligned_agreements);
          }

          const mems = await fetchPodMembers(details.id);
          setPodMembersList(mems);

          const isMatchingPool = currentUser.entry_path === 'MATCHING_POOL';

          if (isMatchingPool) {
            if (details.status === 'CREATING') {
              // Admin approved matching proposal, waiting for user confirmations
              const otherMembers = mems
                .filter(m => m.id !== currentUser.id)
                .map(m => ({
                  id: m.id,
                  name: m.name || 'Anonymous Member',
                  score: m.readiness_score || 80,
                  detail: `${m.commitment_timeline === 'timeline_5yr' ? '5+' : m.commitment_timeline === 'timeline_2yr' ? '2+' : 'Flexible'} years commitment · ${m.setting_preference || 'suburban'}`
                }));

              setSuggestedPod({
                id: details.id,
                name: details.name,
                tags: [
                  mems[0]?.location_city || 'Austin, TX',
                  'Suburban',
                  'Co-development',
                  '5+ years commitment'
                ],
                members: otherMembers,
                matchPct: 85
              });

              if (details.membershipStatus === 'PENDING') {
                if (['matching-status'].includes(activeScreen)) {
                  setActiveScreen('pod-suggestion');
                }
              } else if (details.membershipStatus === 'ACCEPTED') {
                if (['matching-status', 'pod-suggestion', 'pod-preview'].includes(activeScreen)) {
                  setActiveScreen('confirm-join');
                }
              }
            } else if (details.status === 'UNDER_REVIEW') {
              // Suggested pod generated but pending admin review. Do not show suggestions.
              setSuggestedPod(null);
              if (['pod-suggestion', 'pod-preview', 'confirm-join'].includes(activeScreen)) {
                setActiveScreen('matching-status');
              }
            } else if (details.status === 'ACTIVE') {
              // Active matched pod
              setSuggestedPod(null);
              if (['matching-status', 'pod-suggestion', 'pod-preview', 'confirm-join'].includes(activeScreen)) {
                setActiveScreen('commons-dashboard');
              }
            }
          }
        } else {
          setPodMembersList([]);
          if (!suggestedPod || suggestedPod.id) {
            setSuggestedPod(null);
            if (['pod-suggestion', 'pod-preview', 'confirm-join'].includes(activeScreen)) {
              setActiveScreen('matching-status');
            }
          }
        }
      } catch (err) {
        console.error('AppScreens loadPodData error:', err);
      } finally {
        setLoadingPod(false);
      }
    }

    loadPodData();
    const interval = setInterval(loadPodData, 5000);
    return () => clearInterval(interval);
  }, [currentUser, activeScreen]);

  useEffect(() => {
    async function syncProfile() {
      if (!currentUser?.id || !setCurrentUser) return;
      try {
        const freshUser = await fetchUserProfile(currentUser.id);
        if (freshUser && (
          freshUser.profile_status !== currentUser.profile_status ||
          freshUser.matching_status !== currentUser.matching_status ||
          freshUser.user_onboarded !== currentUser.user_onboarded ||
          freshUser.readiness_score !== currentUser.readiness_score
        )) {
          setCurrentUser(freshUser);
        }
      } catch (err) {
        console.error('Error syncing profile:', err);
      }
    }
    syncProfile();
  }, [activeScreen]);

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

  if (!['learning', 'profile', 'profile-update', 'profile-edit', 'readiness-detail', 'status-tracking', 'pod-history', 'matching-status', 'pod-suggestion', 'pod-preview', 'confirm-join', 'commons-dashboard', 'commons-members', 'commons-agreement', 'commons-chat', 'commons-settings'].includes(activeScreen)) {
    return null;
  }

  // Intercept locked screens if user is not onboarded or profile is not approved yet (Path A / Path B)
  const isExistingPod = currentUser?.entry_path === 'EXISTING_POD';
  const isProfileApproved = isExistingPod
    ? (userPod?.status === 'ACTIVE')
    : (currentUser?.profile_status === 'APPROVED');
  const isProfileUnderReview = currentUser?.profile_status === 'UNDER_REVIEW';
  const isProfileRejected = currentUser?.profile_status === 'REJECTED';
  const isUserOnboarded = currentUser?.onboarding_status === 'COMPLETED' || currentUser?.user_onboarded === true;

  // Path B Specific Gating Redirects
  if (isExistingPod && !loadingPod && GATED_SCREENS.includes(activeScreen)) {
    if (!isUserOnboarded && userPod?.status !== 'ACTIVE') {
      return (
        <div className="max-w-[480px] mx-auto py-24 px-6 text-center animate-fade">
          <div className="w-14 h-14 rounded-2xl bg-amber-soft text-amber flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="font-display font-extrabold text-[20px] text-ink mb-2">Complete Profile Required</h3>
          <p className="text-ink-dim text-sm leading-relaxed mb-6">
            Before you can access Pod workspace tools, you must complete your BOMA onboarding profile.
          </p>
          <button
            onClick={() => setActiveScreen('onboarding-age')}
            className="bg-ink text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#2450C4] cursor-pointer"
          >
            Complete Profile
          </button>
        </div>
      );
    }

    if (userPod?.status === 'CREATING') {
      if (userPod.memberRole === 'CREATOR') {
        setTimeout(() => setActiveScreen('pod-invite'), 10);
        return null;
      } else {
        return <MemberWaitingView pod={userPod} currentUser={currentUser} setActiveScreen={setActiveScreen} />;
      }
    }
    if (userPod?.status === 'UNDER_REVIEW') {
      if (userPod.memberRole === 'CREATOR') {
        setTimeout(() => setActiveScreen('pod-pending'), 10);
        return null;
      } else {
        return <MemberWaitingView pod={userPod} currentUser={currentUser} setActiveScreen={setActiveScreen} />;
      }
    }
    if (userPod?.status === 'REJECTED') {
      return <MemberWaitingView pod={userPod} currentUser={currentUser} setActiveScreen={setActiveScreen} />;
    }
  }

  // Path A Specific Gating
  if (!isExistingPod && GATED_SCREENS.includes(activeScreen) && (!isUserOnboarded || !isProfileApproved)) {
    return (
      <LockedFeatureView
        screenId={activeScreen}
        currentUser={currentUser}
        onStartOnboarding={() => setActiveScreen('entry-path')}
        onReturnToHub={() => setActiveScreen('learning')}
        onGoToReview={() => {
          if (currentUser?.profile_status === 'REJECTED') {
            setActiveScreen('entry-path');
          } else {
            setActiveScreen('onboarding-approval');
          }
        }}
      />
    );
  }

  // ---------------- MATCH STATE TRANSITIONS ----------------
  const simulateMatch = async () => {
    setMatchingLoading(true);
    try {
      const match = await findSuggestedMatches(currentUser);
      if (match) {
        setSuggestedPod(match);
        setActiveScreen('pod-suggestion');
      } else {
        showToast("No other compatible users are in the matching pool yet. Please register more users to test matching!");
      }
    } catch (err) {
      console.error(err);
      showToast("Error finding matching suggestion: " + err.message);
    } finally {
      setMatchingLoading(false);
    }
  };

  const declineMatch = async () => {
    if (!suggestedPod || !currentUser?.id) return;
    try {
      setMatchingLoading(true);
      if (suggestedPod.id) {
        const freshUser = await declineMatchedPod(suggestedPod.id, currentUser.id);
        if (setCurrentUser) {
          setCurrentUser(freshUser);
        }
      }
      setSuggestedPod(null);
      setUserPod(null);
      setPodMembersList([]);
      setActiveScreen('matching-status');
      showToast('You declined the match proposal.', 'info');
    } catch (err) {
      console.error('Failed to decline match:', err);
      showToast('Failed to decline match proposal: ' + err.message);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleAcceptSuggestedPod = async () => {
    if (!suggestedPod || !currentUser?.id) return;
    try {
      setMatchingLoading(true);

      if (!suggestedPod.id) {
        // Simulated match proposal: purely in-memory
        const simulatedPodId = 'simulated-' + Math.random().toString(36).substr(2, 9);
        const details = {
          id: simulatedPodId,
          name: suggestedPod.name,
          description: 'Group created via BOMA dynamic matching compatibility engine simulation.',
          group_type: 'Community Group',
          status: 'ACTIVE',
          created_by: currentUser.id,
          memberRole: 'CREATOR',
          membershipStatus: 'ACCEPTED',
          is_simulated: true
        };

        const mems = [
          {
            id: currentUser.id,
            userId: currentUser.id,
            name: currentUser.name || 'Jordan Lee',
            avatarUrl: currentUser.avatar_url || null,
            role: 'CREATOR',
            membershipStatus: 'ACCEPTED',
            readinessScore: currentUser.readiness_score || 85,
            joinedAt: new Date().toISOString()
          },
          ...suggestedPod.members.map(m => ({
            id: m.id || Math.random().toString(),
            userId: m.id || Math.random().toString(),
            name: m.name,
            avatarUrl: null,
            role: 'MEMBER',
            membershipStatus: 'ACCEPTED',
            readinessScore: m.score || 75,
            joinedAt: new Date().toISOString()
          }))
        ];

        setUserPod(details);
        setPodMembersList(mems);

        if (setCurrentUser) {
          setCurrentUser({
            ...currentUser,
            matching_status: 'MATCHED'
          });
        }

        setSuggestedPod(null);
        setActiveScreen('commons-dashboard');
        showToast('Simulated match joined successfully! Pod is now active (In-Memory).', 'success');
      } else {
        // Real database matching proposal
        const freshUser = await acceptMatchedPod(suggestedPod.id, currentUser.id);
        if (setCurrentUser) {
          setCurrentUser(freshUser);
        }

        const details = await fetchPodDetails(currentUser.id);
        setUserPod(details);
        if (details) {
          const mems = await fetchPodMembers(details.id);
          setPodMembersList(mems);

          if (details.status === 'ACTIVE') {
            setActiveScreen('commons-dashboard');
            showToast('Congratulations! Your Pod is now active!', 'success');
          } else {
            setActiveScreen('confirm-join');
            showToast('Match proposal accepted! Waiting for neighbor confirmations.', 'success');
          }
        }
      }
    } catch (err) {
      console.error('Failed to accept matching pod:', err);
      showToast('Failed to accept matched pod: ' + err.message);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleRefreshPodStatus = async () => {
    if (!currentUser?.id) return;
    try {
      setMatchingLoading(true);
      const details = await fetchPodDetails(currentUser.id);
      setUserPod(details);
      if (details) {
        if (details.aligned_agreements) {
          setAlignedAgreements(details.aligned_agreements);
        }

        const mems = await fetchPodMembers(details.id);
        setPodMembersList(mems);
        if (details.status === 'ACTIVE') {
          if (setCurrentUser) {
            const freshUser = await fetchUserProfile(currentUser.id);
            setCurrentUser(freshUser);
          }
          setActiveScreen('commons-dashboard');
          showToast('Your Pod is now active!', 'success');
        } else {
          showToast('Pod status refreshed. Still waiting for other confirmations.', 'info');
        }
      }
    } catch (err) {
      console.error('Failed to refresh pod status:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const leavePod = async () => {
    const podId = userPod?.id;
    if (userPod?.is_simulated) {
      if (setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          matching_status: 'IN_POOL'
        });
      }
      setUserPod(null);
      setPodMembersList([]);
      showToast("Successfully left the simulated pod.", "success");
      setActiveScreen('pod-history');
      return;
    }
    if (podId && currentUser?.id) {
      try {
        setMatchingLoading(true);
        const freshUser = await leavePodApi(currentUser.id, podId);

        if (setCurrentUser) {
          setCurrentUser(freshUser);
        }

        setPodHistory([{ id: podId, when: 'just now' }, ...podHistory]);
        setUserPod(null);
        setPodMembersList([]);
        showToast("Successfully left the pod group.", "success");
      } catch (err) {
        console.error('Failed to leave pod in DB:', err);
        showToast("Failed to leave pod: " + err.message);
      } finally {
        setMatchingLoading(false);
      }
    }
    setActiveScreen('pod-history');
  };

  const deletePod = async () => {
    const podId = userPod?.id;
    if (userPod?.is_simulated) {
      if (setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          matching_status: 'IN_POOL'
        });
      }
      setUserPod(null);
      setPodMembersList([]);
      showToast("Simulated pod dissolved successfully!", "success");
      setActiveScreen('learning');
      return;
    }
    if (podId && currentUser?.id) {
      try {
        setMatchingLoading(true);
        const freshUser = await dissolvePod(podId, currentUser.id);

        if (setCurrentUser) {
          setCurrentUser(freshUser);
        }

        setUserPod(null);
        setPodMembersList([]);
        showToast("Pod dissolved successfully! You are now back in the matching pool.", "success");
      } catch (err) {
        console.error('Failed to dissolve pod in DB:', err);
        showToast("Failed to delete pod: " + err.message);
      } finally {
        setMatchingLoading(false);
      }
    }
    setActiveScreen('learning');
  };

  // ---------------- POD COMMONS CHAT ----------------
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      sender: currentUser?.name || 'You',
      text: chatInput.trim(),
      time: time,
      avatar: currentUser?.avatar_url || null,
      isMe: true
    };

    setChatMessages([...chatMessages, newMsg]);
    setChatInput('');
  };

  // ---------------- POD COMMONS AGREEMENTS ----------------
  const toggleAgreementItem = async (idx) => {
    if (!userPod) return;

    let nextAgreements;
    if (alignedAgreements.includes(idx)) {
      nextAgreements = alignedAgreements.filter(i => i !== idx);
    } else {
      nextAgreements = [...alignedAgreements, idx];
    }

    // Optimistic UI update
    setAlignedAgreements(nextAgreements);

    try {
      if (!userPod.is_simulated) {
        const updated = await updatePodAgreements(userPod.id, userPod.description, nextAgreements);
        setUserPod(updated);
      }
    } catch (e) {
      console.error("Failed to persist agreement alignment:", e);
      // Revert local state on error
      setAlignedAgreements(alignedAgreements);
      showToast("Failed to sync agreement checklist: " + e.message, "error");
    }
  };

  // Current Pod Data — always from DB
  const currentPod = userPod
    ? {
      name: userPod.name,
      location: isExistingPod ? 'Self-Registered Group' : (currentUser?.location_city || 'Austin, TX'),
      formed: userPod.created_at ? new Date(userPod.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      photo: 'assets/pod_austin.png',
      avgReadiness: Math.round(
        podMembersList.reduce((acc, m) => acc + m.readinessScore, 0) / (podMembersList.length || 1)
      ),
      health: 'Stable',
      members: podMembersList.filter(m => m.userId !== currentUser?.id).map(m => ({
        name: m.name,
        avatarUrl: m.avatarUrl,
        detail: `${m.role === 'CREATOR' ? 'Group Admin' : 'Member'} · Joined`,
        score: m.readinessScore,
        joined: new Date(m.joinedAt).toLocaleDateString()
      }))
    }
    : null;

  const isCreator = userPod && (userPod.created_by === currentUser?.id || userPod.memberRole === 'CREATOR');

  return (
    <div className="w-full text-left animate-fade">
      {/* 1. LEARNING HUB */}
      {activeScreen === 'learning' && (
        <LearningHub
          currentUser={currentUser}
          isUserOnboarded={isUserOnboarded}
          isProfileApproved={isProfileApproved}
          isProfileUnderReview={isProfileUnderReview}
          isProfileRejected={isProfileRejected}
          openWhatsBomaModal={openWhatsBomaModal}
          openVideoModal={openVideoModal}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 2. MY PROFILE */}
      {activeScreen === 'profile' && (
        <ProfileDashboard
          currentUser={currentUser}
          isProfileApproved={isProfileApproved}
          isProfileUnderReview={isProfileUnderReview}
          isProfileRejected={isProfileRejected}
          isUserOnboarded={isUserOnboarded}
          isExistingPod={isExistingPod}
          userPod={userPod}
          setActiveScreen={setActiveScreen}
          formatTimeline={formatTimeline}
        />
      )}

      {/* 3. UPDATE PROFILE (Avatar and Name) */}
      {activeScreen === 'profile-update' && (
        <ProfileUpdate
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          editName={editName}
          setEditName={setEditName}
          fileInputRef={fileInputRef}
          uploadingAvatar={uploadingAvatar}
          handleAvatarChange={handleAvatarChange}
          setActiveScreen={setActiveScreen}
          showToast={showToast}
        />
      )}

      {/* 3b. EDIT PREFERENCES */}
      {activeScreen === 'profile-edit' && (
        <ProfileEdit
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          editCity={editCity}
          setEditCity={setEditCity}
          editSetting={editSetting}
          setEditSetting={setEditSetting}
          editIntent={editIntent}
          setEditIntent={setEditIntent}
          editCityDropdownOpen={editCityDropdownOpen}
          setEditCityDropdownOpen={setEditCityDropdownOpen}
          cityDropdownRef={cityDropdownRef}
          setActiveScreen={setActiveScreen}
          showToast={showToast}
        />
      )}

      {/* 4. READINESS DETAILS */}
      {activeScreen === 'readiness-detail' && (
        <ReadinessDetail
          currentUser={currentUser}
          breakdown={breakdown}
          getCategoryScores={getCategoryScores}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 5. STATUS TRACKER */}
      {activeScreen === 'status-tracking' && (
        <StatusTracker
          isExistingPod={isExistingPod}
          userOnboarded={userOnboarded}
          userPod={userPod}
          currentUser={currentUser}
          podHistory={podHistory}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 6. MATCHING STATUS */}
      {activeScreen === 'matching-status' && (
        <MatchingStatus
          userPod={userPod}
          currentUser={currentUser}
          matchingLoading={matchingLoading}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 7. POD SUGGESTION */}
      {activeScreen === 'pod-suggestion' && suggestedPod && (
        <PodSuggestion
          suggestedPod={suggestedPod}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 8. POD PREVIEW */}
      {activeScreen === 'pod-preview' && suggestedPod && (
        <PodPreview
          suggestedPod={suggestedPod}
          declineMatch={declineMatch}
          handleAcceptSuggestedPod={handleAcceptSuggestedPod}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 9. CONFIRM JOIN SCREEN */}
      {activeScreen === 'confirm-join' && suggestedPod && (
        <ConfirmJoin
          suggestedPod={suggestedPod}
          userPod={userPod}
          podMembersList={podMembersList}
          matchingLoading={matchingLoading}
          declineMatch={declineMatch}
          handleRefreshPodStatus={handleRefreshPodStatus}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 10. COMMONS DASHBOARD */}
      {activeScreen === 'commons-dashboard' && (
        <CommonsDashboard
          currentPod={currentPod}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 11. COMMONS MEMBERS */}
      {activeScreen === 'commons-members' && currentPod && (
        <CommonsMembers
          currentPod={currentPod}
          currentUser={currentUser}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 12. COMMONS AGREEMENT */}
      {activeScreen === 'commons-agreement' && (
        <CommonsAgreement
          alignedAgreements={alignedAgreements}
          toggleAgreementItem={toggleAgreementItem}
          openAgreementDocModal={openAgreementDocModal}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 13. COMMONS CHAT */}
      {activeScreen === 'commons-chat' && currentPod && (
        <CommonsChat
          currentPod={currentPod}
          currentUser={currentUser}
          chatMessages={chatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          chatLogRef={chatLogRef}
          handleSendChatMessage={handleSendChatMessage}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 14. COMMONS SETTINGS */}
      {activeScreen === 'commons-settings' && (
        <CommonsSettings
          isCreator={isCreator}
          showConfirm={showConfirm}
          deletePod={deletePod}
          leavePod={leavePod}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 15. MY PODS HISTORY */}
      {activeScreen === 'pod-history' && (
        <PodHistory
          currentPod={currentPod}
          userPod={userPod}
          isCreator={isCreator}
          podHistory={podHistory}
          deletePod={deletePod}
          leavePod={leavePod}
          showConfirm={showConfirm}
          setActiveScreen={setActiveScreen}
        />
      )}
    </div>
  );
}
