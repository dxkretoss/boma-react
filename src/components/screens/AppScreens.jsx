import React, { useState, useEffect, useRef } from 'react';
import { GATED_SCREENS } from '../../constants/screens';
import { updateUser, fetchUserProfile, updateUserPreferencesAndScore, uploadUserAvatar } from '../../api/users';
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
import PodInvite from './onboarding/PodInvite';
import PodPending from './onboarding/PodPending';

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
  showToast,
  userPod: propUserPod,
  setUserPod: propSetUserPod
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

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editCityDropdownOpen, setEditCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef(null);

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
    try {
      // 1. Upload to Supabase Storage Bucket ('avatars') and get public URL
      const publicUrl = await uploadUserAvatar(currentUser.id, file);

      if (setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          avatar_url: publicUrl
        });
      }

      showToast("Profile image updated successfully!", "success");
    } catch (err) {
      console.warn("Storage bucket upload failed, attempting fallback:", err);

      // Graceful fallback: If Supabase storage bucket isn't set up yet, fallback to local FileReader data URL
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
        } catch (saveErr) {
          console.error("Failed to update profile image:", saveErr);
          showToast("Failed to update profile image: " + saveErr.message, "error");
        } finally {
          setUploadingAvatar(false);
        }
      };

      reader.onerror = () => {
        showToast("Failed to read image file.", "error");
        setUploadingAvatar(false);
      };

      reader.readAsDataURL(file);
      return;
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Path B Pod States
  const [localUserPod, setLocalUserPod] = useState(null);
  const userPod = propUserPod !== undefined ? propUserPod : localUserPod;
  const setUserPod = propSetUserPod || setLocalUserPod;
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

  const loadPodData = async () => {
    if (!currentUser?.id) {
      setLoadingPod(false);
      return;
    }

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
            const otherMembers = mems
              .filter(m => (m.userId || m.user_id) !== currentUser.id)
              .map(m => {
                const score = m.readinessScore ?? m.readiness_score ?? 80;
                const timeline = m.commitmentTimeline || m.commitment_timeline;
                const setting = m.settingPreference || m.setting_preference;
                const timeLabel = timeline === 'timeline_5yr' ? '5+' : timeline === 'timeline_2yr' ? '2+' : timeline === 'timeline_flexible' || timeline === 'timeline_flex' ? 'Flexible' : 'Flexible';
                const settingLabel = setting ? setting.toLowerCase() : 'suburban';

                return {
                  id: m.id,
                  userId: m.userId || m.user_id,
                  name: m.name || 'Anonymous Member',
                  score: score,
                  detail: `${timeLabel} years commitment · ${settingLabel}`,
                  isSelf: false
                };
              });

            const selfMemberRecord = mems.find(m => (m.userId || m.user_id) === currentUser.id);
            const selfTimeline = currentUser.commitment_timeline || selfMemberRecord?.commitmentTimeline;
            const selfTimeLabel = selfTimeline === 'timeline_5yr' ? '5+' : selfTimeline === 'timeline_2yr' ? '2+' : 'Flexible';
            const selfSetting = currentUser.setting_preference || selfMemberRecord?.settingPreference || 'suburban';

            const selfMember = {
              id: selfMemberRecord?.id || `self-${currentUser.id}`,
              userId: currentUser.id,
              name: currentUser.name || 'You',
              score: currentUser.readiness_score ?? selfMemberRecord?.readinessScore ?? 80,
              detail: `${selfTimeLabel} years commitment · ${selfSetting.toLowerCase()}`,
              isSelf: true
            };

            const allPreviewMembers = [...otherMembers, selfMember];

            setSuggestedPod({
              id: details.id,
              name: details.name,
              tags: [
                mems[0]?.location_city || 'Austin, TX',
                'Suburban',
                'Co-development',
                '5+ years commitment'
              ],
              members: allPreviewMembers,
              matchPct: 85
            });

            const allConfirmed = mems.length >= 2 && mems.every(m => m.membershipStatus === 'ACCEPTED' || m.membership_status === 'ACCEPTED');

            if (details.membershipStatus === 'PENDING') {
              if (['matching-status'].includes(activeScreen)) {
                setActiveScreen('pod-suggestion');
              }
            } else if (details.membershipStatus === 'ACCEPTED') {
              if (details.status === 'ACTIVE' || allConfirmed) {
                if (['matching-status', 'pod-suggestion', 'pod-preview', 'confirm-join'].includes(activeScreen)) {
                  setActiveScreen('commons-dashboard');
                }
              } else {
                if (['matching-status', 'pod-suggestion', 'pod-preview'].includes(activeScreen)) {
                  setActiveScreen('confirm-join');
                }
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
  };

  useEffect(() => {
    loadPodData();
  }, [currentUser?.id, activeScreen]);

  useEffect(() => {
    async function syncProfile() {
      if (!currentUser?.id || !setCurrentUser) return;
      try {
        const freshUser = await fetchUserProfile(currentUser.id);
        if (freshUser && (
          freshUser.profile_status !== currentUser.profile_status ||
          freshUser.matching_status !== currentUser.matching_status ||
          freshUser.user_onboarded !== currentUser.user_onboarded ||
          freshUser.readiness_score !== currentUser.readiness_score ||
          freshUser.entry_path !== currentUser.entry_path
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
  // Check if user is on Existing Pod (Path B) flow based on database entry_path
  const isExistingPod = currentUser?.entry_path === 'EXISTING_POD';
  const isProfileApproved = isExistingPod 
    ? true 
    : (currentUser?.profile_status === 'APPROVED');
  const isProfileUnderReview = currentUser?.profile_status === 'UNDER_REVIEW';
  const isProfileRejected = currentUser?.profile_status === 'REJECTED';
  const isUserOnboarded =
    currentUser?.onboarding_status === 'COMPLETED' ||
    currentUser?.user_onboarded === true ||
    currentUser?.profile_status === 'UNDER_REVIEW' ||
    currentUser?.profile_status === 'APPROVED' ||
    userOnboarded === true;

  // Path B Specific Gating for Commons workspace tools
  const COMMONS_SCREENS = ['commons-dashboard', 'commons-members', 'commons-agreement', 'commons-chat', 'commons-settings'];
  if (isExistingPod && !loadingPod && COMMONS_SCREENS.includes(activeScreen)) {
    if (!userPod) {
      return <CommonsDashboard currentPod={null} userPod={null} setActiveScreen={setActiveScreen} />;
    }
    if (userPod?.status === 'CREATING' || userPod?.status === 'UNDER_REVIEW') {
      return <PodPending pod={userPod} currentUser={currentUser} setActiveScreen={setActiveScreen} />;
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
        if (freshUser && freshUser.id && setCurrentUser) {
          setCurrentUser(freshUser);
          localStorage.setItem('boma_current_user', JSON.stringify(freshUser));
        } else if (setCurrentUser) {
          const updated = {
            ...currentUser,
            matching_status: 'IN_POOL'
          };
          setCurrentUser(updated);
          localStorage.setItem('boma_current_user', JSON.stringify(updated));
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
        if (freshUser && freshUser.id && setCurrentUser) {
          setCurrentUser(freshUser);
          localStorage.setItem('boma_current_user', JSON.stringify(freshUser));
        } else if (setCurrentUser) {
          const updated = {
            ...currentUser,
            matching_status: 'MATCHED'
          };
          setCurrentUser(updated);
          localStorage.setItem('boma_current_user', JSON.stringify(updated));
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
        const allConfirmed = mems.length >= 2 && mems.every(m => m.membershipStatus === 'ACCEPTED' || m.membership_status === 'ACCEPTED');
        if (details.status === 'ACTIVE' || allConfirmed) {
          if (setCurrentUser) {
            const freshUser = await fetchUserProfile(currentUser.id);
            if (freshUser && freshUser.id) {
              setCurrentUser(freshUser);
            }
          }
          setActiveScreen('commons-dashboard');
          showToast('Congratulations! All members confirmed — your Pod is now active!', 'success');
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
        const updated = {
          ...currentUser,
          matching_status: 'IN_POOL'
        };
        setCurrentUser(updated);
        localStorage.setItem('boma_current_user', JSON.stringify(updated));
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

        if (freshUser && freshUser.id && setCurrentUser) {
          setCurrentUser(freshUser);
          localStorage.setItem('boma_current_user', JSON.stringify(freshUser));
        } else if (setCurrentUser) {
          const updated = {
            ...currentUser,
            matching_status: 'IN_POOL'
          };
          setCurrentUser(updated);
          localStorage.setItem('boma_current_user', JSON.stringify(updated));
        }

        setPodHistory([{ id: podId, when: 'just now' }, ...podHistory]);
        setUserPod(null);
        setPodMembersList([]);
        showToast("Successfully left the pod group. You are now back in the matching pool.", "success");
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
        const updated = {
          ...currentUser,
          matching_status: 'IN_POOL'
        };
        setCurrentUser(updated);
        localStorage.setItem('boma_current_user', JSON.stringify(updated));
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

        if (freshUser && freshUser.id && setCurrentUser) {
          setCurrentUser(freshUser);
          localStorage.setItem('boma_current_user', JSON.stringify(freshUser));
        } else if (setCurrentUser) {
          const updated = {
            ...currentUser,
            matching_status: 'IN_POOL'
          };
          setCurrentUser(updated);
          localStorage.setItem('boma_current_user', JSON.stringify(updated));
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

  const allMembersConfirmed = (podMembersList && podMembersList.length >= 2 && podMembersList.every(m => m.membershipStatus === 'ACCEPTED' || m.membership_status === 'ACCEPTED')) ||
    (userPod?.members && userPod.members.length >= 2 && userPod.members.every(m => m.membershipStatus === 'ACCEPTED' || m.membership_status === 'ACCEPTED'));

  // Determine if user has actively joined/unlocked the full Pod Commons
  const isPodActiveInCommons = isExistingPod
    ? Boolean(userPod && userPod.status !== 'REJECTED')
    : Boolean(userPod && (userPod.status === 'ACTIVE' || allMembersConfirmed) && userPod.membershipStatus === 'ACCEPTED');

  // Current Pod Data — available ONLY when the pod is active in The Commons
  const currentPod = isPodActiveInCommons
    ? {
      id: userPod.id,
      name: userPod.name,
      location: isExistingPod ? 'Self-Registered Group' : (userPod.location_city || currentUser?.location_city || 'Austin, TX'),
      formed: userPod.created_at ? new Date(userPod.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      photo: userPod.photo || 'assets/pod_austin.png',
      avgReadiness: Math.round(
        (podMembersList || []).reduce((acc, m) => acc + (m.readinessScore || m.readiness_score || 85), 0) / ((podMembersList && podMembersList.length) || 1)
      ),
      health: userPod.status === 'ACTIVE' ? 'Stable' : 'Forming',
      members: (podMembersList || []).filter(m => (m.userId || m.user_id || m.id) !== currentUser?.id).map(m => ({
        id: m.userId || m.user_id || m.id,
        name: m.name || m.user?.name || 'Anonymous Member',
        avatarUrl: m.avatarUrl || m.avatar_url || m.user?.avatar_url,
        detail: `${(isExistingPod && m.role === 'CREATOR') ? 'Group Admin' : 'Member'} · Joined`,
        score: m.readinessScore || m.readiness_score || 85,
        joined: m.joinedAt || m.joined_at ? new Date(m.joinedAt || m.joined_at).toLocaleDateString() : 'Recently'
      })),
      ...userPod
    }
    : null;

  const isExistingPodGroup = isExistingPod || userPod?.group_type === 'EXISTING_POD' || userPod?.group_type === 'Friends' || userPod?.group_type === 'Family' || userPod?.group_type === 'Workforce';
  const isCreator = Boolean(
    isExistingPodGroup && (
      userPod?.created_by === currentUser?.id ||
      userPod?.memberRole === 'CREATOR' ||
      (podMembersList || []).some(m => (m.userId === currentUser?.id || m.user_id === currentUser?.id) && m.role === 'CREATOR')
    )
  );

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
          isExistingPod={isExistingPod}
          userPod={userPod}
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
          matchingLoading={loadingPod}
          setActiveScreen={setActiveScreen}
          onRefreshPodData={loadPodData}
          showToast={showToast}
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
          handleRefreshPodStatus={loadPodData}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 10. COMMONS DASHBOARD */}
      {activeScreen === 'commons-dashboard' && (
        <CommonsDashboard
          currentPod={currentPod}
          userPod={userPod}
          currentUser={currentUser}
          setActiveScreen={setActiveScreen}
        />
      )}

      {/* 11. COMMONS MEMBERS */}
      {activeScreen === 'commons-members' && (
        currentPod ? (
          <CommonsMembers
            currentPod={currentPod}
            userPod={userPod}
            isCreator={isCreator}
            podMembersList={podMembersList}
            currentUser={currentUser}
            setActiveScreen={setActiveScreen}
          />
        ) : (
          <CommonsDashboard
            currentPod={null}
            userPod={userPod}
            currentUser={currentUser}
            setActiveScreen={setActiveScreen}
          />
        )
      )}

      {/* 12. COMMONS AGREEMENT */}
      {activeScreen === 'commons-agreement' && (
        currentPod ? (
          <CommonsAgreement
            alignedAgreements={alignedAgreements}
            toggleAgreementItem={toggleAgreementItem}
            openAgreementDocModal={openAgreementDocModal}
            setActiveScreen={setActiveScreen}
          />
        ) : (
          <CommonsDashboard
            currentPod={null}
            userPod={userPod}
            currentUser={currentUser}
            setActiveScreen={setActiveScreen}
          />
        )
      )}

      {/* 13. COMMONS CHAT */}
      {activeScreen === 'commons-chat' && (
        currentPod ? (
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
        ) : (
          <CommonsDashboard
            currentPod={null}
            userPod={userPod}
            currentUser={currentUser}
            setActiveScreen={setActiveScreen}
          />
        )
      )}

      {/* 14. COMMONS SETTINGS */}
      {activeScreen === 'commons-settings' && (
        currentPod ? (
          <CommonsSettings
            isCreator={isCreator}
            showConfirm={showConfirm}
            deletePod={deletePod}
            leavePod={leavePod}
            setActiveScreen={setActiveScreen}
          />
        ) : (
          <CommonsDashboard
            currentPod={null}
            userPod={userPod}
            currentUser={currentUser}
            setActiveScreen={setActiveScreen}
          />
        )
      )}

      {/* 15. MY PODS HISTORY */}
      {activeScreen === 'pod-history' && (
        <PodHistory
          currentPod={currentPod}
          userPod={userPod}
          podMembersList={podMembersList}
          currentUser={currentUser}
          isExistingPod={isExistingPod}
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
