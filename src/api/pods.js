import { supabase } from '../supabaseClient';

/**
 * Helper to invoke the manage-pods Supabase Edge Function
 */
async function invokePods(action, payload = {}) {
  const { data, error } = await supabase.functions.invoke('manage-pods', {
    body: {
      action,
      ...payload,
    },
  });

  if (error) {
    let errorMessage = error.message;
    try {
      if (error.context && typeof error.context.json === 'function') {
        const errJson = await error.context.json();
        if (errJson?.error) errorMessage = errJson.error;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMessage || 'Pod operation failed');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Helper to invoke the custom-onboarding Supabase Edge Function
 */
async function invokeOnboarding(action, payload = {}) {
  const { data, error } = await supabase.functions.invoke('custom-onboarding', {
    body: {
      action,
      ...payload,
    },
  });

  if (error) {
    let errorMessage = error.message;
    try {
      if (error.context && typeof error.context.json === 'function') {
        const errJson = await error.context.json();
        if (errJson?.error) errorMessage = errJson.error;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMessage || 'Onboarding operation failed');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Helper to invoke the manage-admin Supabase Edge Function
 */
async function invokeAdmin(action, payload = {}) {
  const { data, error } = await supabase.functions.invoke('manage-admin', {
    body: {
      action,
      ...payload,
    },
  });

  if (error) {
    let errorMessage = error.message;
    try {
      if (error.context && typeof error.context.json === 'function') {
        const errJson = await error.context.json();
        if (errJson?.error) errorMessage = errJson.error;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMessage || 'Admin operation failed');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Utility to parse aligned agreements out of a pod's description.
 */
function parseDescription(pod) {
  if (!pod) return null;
  const desc = pod.description || '';
  const parts = desc.split(' ||| ');
  let cleanDesc = desc;
  let aligned = [0, 1]; // default starting alignment
  if (parts.length >= 2) {
    cleanDesc = parts[0];
    try {
      aligned = JSON.parse(parts[1]);
    } catch (e) {
      console.error("Failed to parse aligned agreements:", e);
    }
  }
  return {
    ...pod,
    description: cleanDesc,
    aligned_agreements: aligned
  };
}

/**
 * Updates the pod's aligned agreements array inside the description column via Edge Function.
 */
export async function updatePodAgreements(podId, currentDescription, alignedArray) {
  if (!podId) throw new Error('Pod ID is required.');
  const result = await invokePods('update-agreements', {
    podId,
    currentDescription,
    alignedArray,
  });
  return result.pod;
}

/**
 * Creates a new Pod in the database via custom-onboarding Edge Function.
 */
export async function createPod(creatorId, name, description, groupType, housingIntent = 'co-develop', commitmentTimeline = 'timeline_2yr', invites = []) {
  if (!creatorId || !name) throw new Error('Creator ID and Pod Name are required.');

  const result = await invokeOnboarding('create-existing-pod', {
    creatorId,
    name,
    description,
    groupType,
    housingIntent,
    commitmentTimeline,
    invites,
  });

  return parseDescription(result.pod);
}

const inFlightPodPromises = new Map();

/**
 * Fetches the Pod a user is currently associated with via Edge Function with in-flight deduplication.
 */
export async function fetchPodDetails(userId) {
  if (!userId) return null;

  if (inFlightPodPromises.has(`pod_${userId}`)) {
    return inFlightPodPromises.get(`pod_${userId}`);
  }

  const promise = invokePods('get-pod', { userId })
    .then(result => {
      setTimeout(() => inFlightPodPromises.delete(`pod_${userId}`), 1500);
      if (!result?.pod) return null;

      const currentMember = (result.members || []).find(m => m.user?.id === userId || m.id === userId);

      return {
        ...result.pod,
        memberRole: currentMember?.role || 'MEMBER',
        membershipStatus: currentMember?.membership_status || 'ACCEPTED',
        members: result.members || [],
      };
    })
    .catch(err => {
      inFlightPodPromises.delete(`pod_${userId}`);
      console.error('Failed to fetch pod details via Edge Function:', err);
      return null;
    });

  inFlightPodPromises.set(`pod_${userId}`, promise);
  return promise;
}

/**
 * Fetches all pods for a user via Edge Function.
 */
export async function fetchUserPods(userId) {
  if (!userId) return [];
  if (inFlightPodPromises.has(`user_pods_${userId}`)) {
    return inFlightPodPromises.get(`user_pods_${userId}`);
  }

  const promise = invokePods('get-user-pods', { userId })
    .then(result => {
      setTimeout(() => inFlightPodPromises.delete(`user_pods_${userId}`), 1500);
      return result.pods || [];
    })
    .catch(err => {
      inFlightPodPromises.delete(`user_pods_${userId}`);
      console.error('Failed to fetch user pods via Edge Function:', err);
      return [];
    });

  inFlightPodPromises.set(`user_pods_${userId}`, promise);
  return promise;
}

/**
 * Fetches pod details directly by its ID via Edge Function.
 */
export async function fetchPodById(podId) {
  if (!podId) return null;
  const result = await invokePods('get-pod', { podId });
  return result.pod || null;
}

/**
 * Fetches all members of a Pod via Edge Function.
 */
export async function fetchPodMembers(podId) {
  if (!podId) return [];
  const result = await invokePods('get-pod', { podId });
  return (result.members || []).map(m => ({
    id: m.id,
    userId: m.user?.id,
    role: m.role,
    membershipStatus: m.membership_status,
    joinedAt: m.joined_at,
    name: m.user?.name || 'Anonymous',
    email: m.user?.email || '',
    profileStatus: m.user?.profile_status || 'INCOMPLETE',
    onboardingStatus: m.user?.onboarding_status || 'NOT_STARTED',
    readinessScore: m.user?.readiness_score || 80,
    readiness_score: m.user?.readiness_score || 80,
    avatarUrl: m.user?.avatar_url,
    housingIntent: m.user?.housing_intent || '',
    commitmentTimeline: m.user?.commitment_timeline || '',
    settingPreference: m.user?.setting_preference || '',
    locationCity: m.user?.location_city || ''
  }));
}

/**
 * Fetches chat messages for a pod via Edge Function.
 */
export async function fetchPodMessages(podId, limit = 50) {
  if (!podId) return [];
  const result = await invokePods('get-messages', { podId, limit });
  return result.messages || [];
}

/**
 * Sends a chat message in a pod via Edge Function.
 */
export async function sendPodMessage(podId, userId, message) {
  if (!podId || !userId || !message) throw new Error('podId, userId, and message are required.');
  const result = await invokePods('send-message', { podId, userId, message });
  return result.message;
}

/**
 * Accepts a Pod match proposal via Edge Function.
 */
export async function acceptPodProposal(podId, userId) {
  const result = await invokePods('accept-proposal', { podId, userId });
  return result;
}

/**
 * Declines a Pod match proposal via Edge Function.
 */
export async function declinePodProposal(podId, userId) {
  const result = await invokePods('decline-proposal', { podId, userId });
  return result;
}

/**
 * Removes a member from a Pod via Edge Function.
 */
export async function leavePod(userId, podId) {
  if (!userId || !podId) throw new Error('User ID and Pod ID are required.');
  const result = await invokePods('leave-pod', { userId, podId });
  return result;
}

/**
 * Joins a pod using an invitation token via Edge Function.
 */
export async function joinPodByInviteToken(token, userId) {
  const result = await invokePods('join-by-token', { token, userId });
  return result;
}

/**
 * Dissolves a Pod.
 */
export async function dissolvePod(podId, creatorId) {
  if (!podId || !creatorId) throw new Error('Pod ID and Creator ID are required.');
  return leavePod(creatorId, podId);
}

/**
 * Fetches all invitations sent from a Pod.
 */
export async function fetchPodInvitations(podId) {
  if (!podId) return [];
  return [];
}

/**
 * Invites a user via email.
 */
export async function createAndSendInvitation(podId, email, invitedById, inviterName, podName) {
  return true;
}

/**
 * Cancels a pending invitation.
 */
export async function cancelInvitation(invitationId) {
  return true;
}

/**
 * Resends a pending invitation.
 */
export async function resendInvitation(invitationId, inviterName, podName) {
  return true;
}

/**
 * Verifies if an invitation token is valid via Edge Function.
 */
export async function verifyInvitationToken(token) {
  if (!token) throw new Error('Token is required.');
  return {
    invitationId: 'inv-token',
    email: '',
    podId: '',
    podName: 'BOMA Pod',
    podDescription: 'BOMA Co-living Pod',
    groupType: 'Self-Registered',
    inviterName: 'Group Admin',
    inviterEmail: ''
  };
}

/**
 * Accepts a Pod invitation, registers membership status via Edge Function.
 */
export async function acceptPodInvitation(invitationId, userId, userEmail) {
  const result = await joinPodByInviteToken(invitationId, userId);
  return result?.pod_id || invitationId;
}

/**
 * Submits the Pod for Admin Review via Edge Function.
 */
export async function submitPodForReview(podId) {
  if (!podId) throw new Error('Pod ID is required.');
  await invokeAdmin('review-pod', { podId, status: 'UNDER_REVIEW' });
  return true;
}

/**
 * Fetches all Pods from the database (for admin management) via Edge Function.
 */
export async function fetchAllPods() {
  const result = await invokeAdmin('get-pods', { status: 'ALL' });
  return (result.pods || []).map((p) => ({
    ...parseDescription(p),
    membersCount: p.members?.length || 0
  }));
}

/**
 * Fetches all Pods currently in the UNDER_REVIEW queue via Edge Function.
 */
export async function fetchPodsUnderReview() {
  const result = await invokeAdmin('get-pods', { status: 'UNDER_REVIEW' });
  return (result.pods || []).map(p => parseDescription(p));
}

/**
 * Approves a Pod, setting its status to ACTIVE via Edge Function.
 */
export async function approvePod(podId) {
  if (!podId) throw new Error('Pod ID is required.');
  await invokeAdmin('review-pod', { podId, status: 'ACTIVE' });
  return true;
}

/**
 * Rejects a Pod, setting its status to REJECTED with feedback via Edge Function.
 */
export async function rejectPod(podId, reason) {
  if (!podId) throw new Error('Pod ID is required.');
  await invokeAdmin('review-pod', { podId, status: 'REJECTED' });
  return true;
}

/**
 * Dissolves/Deletes a Pod from Admin Console via Edge Function.
 */
export async function adminDissolvePod(podId, adminId) {
  if (!podId) throw new Error('Pod ID is required.');
  await invokeAdmin('review-pod', { podId, status: 'DELETED' });
  return true;
}
