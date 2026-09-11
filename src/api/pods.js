import { supabase } from '../supabaseClient';
import { fetchUserProfile } from './users';

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
export function parseDescription(pod) {
  if (!pod) return null;
  const desc = pod.description || '';
  let cleanDesc = desc;
  let aligned = [0, 1]; // default starting alignment
  if (desc.includes('|||')) {
    const parts = desc.split('|||');
    cleanDesc = (parts[0] || '').trim();
    try {
      aligned = JSON.parse((parts[1] || '').trim());
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

  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://boma-react-kretoss.netlify.app';
  const result = await invokeOnboarding('create-existing-pod', {
    creatorId,
    name,
    description,
    groupType,
    housingIntent,
    commitmentTimeline,
    invites,
    appBaseUrl,
  });

  return parseDescription(result.pod);
}

const inFlightPodPromises = new Map();

/**
 * Fetches the Pod a user is currently associated with with database fallback.
 */
export async function fetchPodDetails(userId) {
  if (!userId) return null;

  if (inFlightPodPromises.has(`pod_${userId}`)) {
    return inFlightPodPromises.get(`pod_${userId}`);
  }

  const queryFn = async () => {
    // 1. Try Edge Function first
    try {
      const result = await invokePods('get-pod', { userId });
      if (result?.pod) {
        const currentMember = (result.members || []).find(m => m.user?.id === userId || m.id === userId || m.userId === userId || m.user_id === userId);
        return {
          ...result.pod,
          status: result.pod.status,
          memberRole: currentMember?.role || 'MEMBER',
          membershipStatus: currentMember?.membership_status || 'ACCEPTED',
          members: result.members || [],
        };
      }
    } catch (err) {
      console.warn('invokePods get-pod failed, falling back to direct DB:', err?.message || err);
    }

    // 2. Direct Supabase query fallback
    try {
      const { data: memberRows, error: memErr } = await supabase
        .from('pod_members')
        .select('pod_id, role, membership_status, created_at, pods:pods(*)')
        .eq('user_id', userId)
        .neq('membership_status', 'DECLINED')
        .order('created_at', { ascending: false });

      if (memErr) throw memErr;

      if (memberRows && memberRows.length > 0) {
        // Prioritize ACTIVE / UNDER_REVIEW / CREATING pods
        const validRow = memberRows.find(m => m.pods && ['ACTIVE', 'UNDER_REVIEW', 'CREATING'].includes(m.pods.status)) || memberRows[0];
        if (validRow && validRow.pods) {
          const rawPod = validRow.pods;
          const { data: allMembers } = await supabase
            .from('pod_members')
            .select('*, user:users(*)')
            .eq('pod_id', rawPod.id);

          const membersList = (allMembers || []).map(m => ({
            id: m.id,
            userId: m.user?.id || m.user_id,
            user_id: m.user?.id || m.user_id,
            role: m.role,
            membership_status: m.membership_status,
            membershipStatus: m.membership_status,
            joined_at: m.joined_at || m.created_at,
            name: m.user?.name || 'Anonymous',
            email: m.user?.email || '',
            avatar_url: m.user?.avatar_url,
            avatarUrl: m.user?.avatar_url,
            readiness_score: m.user?.readiness_score || 80,
            readinessScore: m.user?.readiness_score || 80,
            user: m.user || {}
          }));

          return {
            ...parseDescription(rawPod),
            status: rawPod.status,
            memberRole: validRow.role || 'MEMBER',
            membershipStatus: validRow.membership_status || 'ACCEPTED',
            members: membersList,
          };
        }
      }
    } catch (dbErr) {
      console.error('Direct Supabase query in fetchPodDetails failed:', dbErr);
    }

    return null;
  };

  const promise = queryFn().finally(() => {
    setTimeout(() => inFlightPodPromises.delete(`pod_${userId}`), 1500);
  });

  inFlightPodPromises.set(`pod_${userId}`, promise);
  return promise;
}

/**
 * Fetches all pods for a user via Edge Function with direct DB fallback.
 */
export async function fetchUserPods(userId) {
  if (!userId) return [];
  if (inFlightPodPromises.has(`user_pods_${userId}`)) {
    return inFlightPodPromises.get(`user_pods_${userId}`);
  }

  const queryFn = async () => {
    try {
      const result = await invokePods('get-user-pods', { userId });
      if (result?.pods && result.pods.length > 0) {
        return result.pods;
      }
    } catch (err) {
      console.warn('invokePods get-user-pods failed, trying direct DB:', err?.message || err);
    }

    try {
      const { data: memberships, error } = await supabase
        .from('pod_members')
        .select('*, pod:pods(*)')
        .eq('user_id', userId)
        .neq('membership_status', 'DECLINED');

      if (!error && memberships) {
        return memberships
          .map(m => ({
            membership: { id: m.id, role: m.role, status: m.membership_status },
            pod: parseDescription(m.pod),
          }))
          .filter(item => item.pod);
      }
    } catch (dbErr) {
      console.error('Direct DB fetchUserPods error:', dbErr);
    }
    return [];
  };

  const promise = queryFn().finally(() => {
    setTimeout(() => inFlightPodPromises.delete(`user_pods_${userId}`), 1500);
  });

  inFlightPodPromises.set(`user_pods_${userId}`, promise);
  return promise;
}

/**
 * Fetches pod details directly by its ID.
 */
export async function fetchPodById(podId) {
  if (!podId) return null;
  try {
    const result = await invokePods('get-pod', { podId });
    if (result?.pod) return result.pod;
  } catch (e) {
    console.warn('invokePods get-pod by ID failed, trying direct DB:', e?.message || e);
  }

  try {
    const { data: rawPod, error } = await supabase
      .from('pods')
      .select('*')
      .eq('id', podId)
      .maybeSingle();

    if (!error && rawPod) {
      return parseDescription(rawPod);
    }
  } catch (dbErr) {
    console.error('Direct DB fetchPodById error:', dbErr);
  }
  return null;
}

/**
 * Fetches all members of a Pod with direct DB fallback.
 */
export async function fetchPodMembers(podId) {
  if (!podId) return [];
  try {
    const result = await invokePods('get-pod', { podId });
    if (result?.members && result.members.length > 0) {
      return (result.members || []).map(m => ({
        id: m.id,
        userId: m.user?.id || m.userId || m.user_id,
        user_id: m.user?.id || m.userId || m.user_id,
        role: m.role,
        membershipStatus: m.membership_status || m.membershipStatus,
        membership_status: m.membership_status || m.membershipStatus,
        joinedAt: m.joined_at || m.joinedAt,
        name: m.user?.name || m.name || 'Anonymous',
        email: m.user?.email || m.email || '',
        profileStatus: m.user?.profile_status || m.profileStatus || 'INCOMPLETE',
        onboardingStatus: m.user?.onboarding_status || m.onboardingStatus || 'NOT_STARTED',
        readinessScore: m.user?.readiness_score || m.readinessScore || 80,
        readiness_score: m.user?.readiness_score || m.readinessScore || 80,
        avatarUrl: m.user?.avatar_url || m.avatarUrl,
        avatar_url: m.user?.avatar_url || m.avatarUrl,
        housingIntent: m.user?.housing_intent || m.housingIntent || '',
        commitmentTimeline: m.user?.commitment_timeline || m.commitmentTimeline || '',
        settingPreference: m.user?.setting_preference || m.settingPreference || '',
        locationCity: m.user?.location_city || m.locationCity || ''
      }));
    }
  } catch (e) {
    console.warn('invokePods get-pod for members failed, trying direct DB:', e?.message || e);
  }

  try {
    const { data: allMembers, error } = await supabase
      .from('pod_members')
      .select('*, user:users(*)')
      .eq('pod_id', podId);

    if (!error && allMembers) {
      return allMembers.map(m => ({
        id: m.id,
        userId: m.user?.id || m.user_id,
        user_id: m.user?.id || m.user_id,
        role: m.role,
        membershipStatus: m.membership_status,
        membership_status: m.membership_status,
        joinedAt: m.joined_at || m.created_at,
        name: m.user?.name || 'Anonymous',
        email: m.user?.email || '',
        profileStatus: m.user?.profile_status || 'INCOMPLETE',
        onboardingStatus: m.user?.onboarding_status || 'NOT_STARTED',
        readinessScore: m.user?.readiness_score || 80,
        readiness_score: m.user?.readiness_score || 80,
        avatarUrl: m.user?.avatar_url,
        avatar_url: m.user?.avatar_url,
        housingIntent: m.user?.housing_intent || '',
        commitmentTimeline: m.user?.commitment_timeline || '',
        settingPreference: m.user?.setting_preference || '',
        locationCity: m.user?.location_city || ''
      }));
    }
  } catch (dbErr) {
    console.error('Direct DB fetchPodMembers error:', dbErr);
  }
  return [];
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
 * Accepts a Pod match proposal via Edge Function with direct DB fallback.
 */
export async function acceptPodProposal(podId, userId) {
  try {
    await invokePods('accept-proposal', { podId, userId });
  } catch (e) {
    console.warn('invokePods accept-proposal failed, trying direct DB:', e?.message || e);
    try {
      await supabase
        .from('pod_members')
        .update({
          membership_status: 'ACCEPTED',
          joined_at: new Date().toISOString()
        })
        .eq('pod_id', podId)
        .eq('user_id', userId);

      await supabase
        .from('users')
        .update({ matching_status: 'MATCHED' })
        .eq('id', userId);

      // Check if all members have accepted
      const { data: allMembers } = await supabase
        .from('pod_members')
        .select('membership_status')
        .eq('pod_id', podId);

      const allAccepted = (allMembers || []).every(m => m.membership_status === 'ACCEPTED');
      if (allAccepted && (allMembers || []).length >= 2) {
        await supabase
          .from('pods')
          .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
          .eq('id', podId);
      }
    } catch (dbErr) {
      console.error('Direct DB acceptPodProposal error:', dbErr);
    }
  }

  // Always return the updated fresh user profile object
  try {
    return await fetchUserProfile(userId);
  } catch (err) {
    console.error('Failed to fetch fresh user profile after accepting pod proposal:', err);
    return null;
  }
}

/**
 * Declines a Pod match proposal via Edge Function with direct DB fallback.
 */
export async function declinePodProposal(podId, userId) {
  try {
    await invokePods('decline-proposal', { podId, userId });
  } catch (e) {
    console.warn('invokePods decline-proposal failed, trying direct DB:', e?.message || e);
    try {
      await supabase
        .from('pod_members')
        .delete()
        .eq('pod_id', podId)
        .eq('user_id', userId);

      await supabase
        .from('users')
        .update({ matching_status: 'IN_POOL' })
        .eq('id', userId);
    } catch (dbErr) {
      console.error('Direct DB declinePodProposal error:', dbErr);
    }
  }

  // Always return the updated fresh user profile object
  try {
    return await fetchUserProfile(userId);
  } catch (err) {
    console.error('Failed to fetch fresh user profile after declining pod proposal:', err);
    return null;
  }
}

/**
 * Removes a member from a Pod with direct DB cleanup and returns fresh user profile.
 */
export async function leavePod(userId, podId) {
  if (!userId || !podId) throw new Error('User ID and Pod ID are required.');
  
  try {
    await invokePods('leave-pod', { userId, podId });
  } catch (e) {
    console.warn('invokePods leave-pod failed, trying direct DB:', e?.message || e);
  }

  try {
    await supabase
      .from('pod_members')
      .delete()
      .eq('pod_id', podId)
      .eq('user_id', userId);

    await supabase
      .from('users')
      .update({ matching_status: 'IN_POOL' })
      .eq('id', userId);
  } catch (dbErr) {
    console.warn('Direct DB cleanup in leavePod:', dbErr);
  }

  const freshUser = await fetchUserProfile(userId);
  return freshUser;
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
  
  try {
    await invokePods('leave-pod', { userId: creatorId, podId });
  } catch (e) {
    console.warn('invokePods dissolvePod failed, trying direct DB:', e?.message || e);
  }

  try {
    await supabase
      .from('pod_members')
      .delete()
      .eq('pod_id', podId);

    await supabase
      .from('pods')
      .update({ status: 'DISSOLVED', updated_at: new Date().toISOString() })
      .eq('id', podId);

    await supabase
      .from('users')
      .update({ matching_status: 'IN_POOL' })
      .eq('id', creatorId);
  } catch (dbErr) {
    console.warn('Direct DB dissolvePod:', dbErr);
  }

  const freshUser = await fetchUserProfile(creatorId);
  return freshUser;
}

/**
 * Fetches all invitations sent from a Pod.
 */
export async function fetchPodInvitations(podId) {
  if (!podId) return [];
  try {
    const { data, error } = await supabase
      .from('pod_invitations')
      .select('*')
      .eq('pod_id', podId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('fetchPodInvitations query error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('fetchPodInvitations exception:', err);
    return [];
  }
}

/**
 * Invites a user via email.
 */
export async function createAndSendInvitation(podId, email, invitedById, inviterName, podName) {
  if (!podId || !email) throw new Error('Pod ID and email address are required.');

  const normalizedEmail = email.toLowerCase().trim();

  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://boma-react-kretoss.netlify.app';

  // Try Edge function first
  try {
    const result = await invokeOnboarding('invite-pod-member', {
      podId,
      inviterId: invitedById,
      email: normalizedEmail,
      appBaseUrl,
    });
    if (result?.invitation) return result.invitation;
  } catch (err) {
    console.warn('invokeOnboarding invite-pod-member fallback to direct DB:', err);
  }

  // Direct DB insertion
  const rawToken = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'tok-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('pod_invitations')
    .insert({
      pod_id: podId,
      email: normalizedEmail,
      invited_by: invitedById,
      token_hash: rawToken,
      status: 'PENDING',
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cancels a pending invitation.
 */
export async function cancelInvitation(invitationId) {
  if (!invitationId) throw new Error('Invitation ID is required.');
  const { error } = await supabase
    .from('pod_invitations')
    .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
    .eq('id', invitationId);

  if (error) throw error;
  return true;
}

/**
 * Resends a pending invitation with email delivery.
 */
export async function resendInvitation(invitationId, inviterName, podName) {
  if (!invitationId) throw new Error('Invitation ID is required.');
  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://boma-react-kretoss.netlify.app';

  try {
    const result = await invokeOnboarding('resend-invitation', {
      invitationId,
      appBaseUrl,
    });
    if (result?.success) return true;
  } catch (err) {
    console.warn('invokeOnboarding resend-invitation fallback:', err);
  }

  // Direct DB update fallback
  const rawToken = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'tok-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from('pod_invitations')
    .update({ token_hash: rawToken, expires_at: newExpiry, status: 'PENDING', updated_at: new Date().toISOString() })
    .eq('id', invitationId);

  if (error) throw error;
  return true;
}

/**
 * Verifies if an invitation token is valid.
 */
export async function verifyInvitationToken(token) {
  if (!token) throw new Error('Token is required.');

  const { data: inv, error } = await supabase
    .from('pod_invitations')
    .select('*, pod:pods(*), inviter:users!invited_by(*)')
    .eq('token_hash', token)
    .eq('status', 'PENDING')
    .maybeSingle();

  if (error) throw error;
  if (!inv) throw new Error('Invalid or expired invitation token');

  const parsedPod = inv.pod ? parseDescription(inv.pod) : null;

  return {
    invitationId: inv.id,
    email: inv.email,
    podId: inv.pod_id,
    podName: inv.pod?.name || 'BOMA Pod',
    podDescription: parsedPod?.description || inv.pod?.description || 'BOMA Co-living Pod',
    groupType: inv.pod?.group_type || 'Self-Registered',
    inviterName: inv.inviter?.name || 'Group Admin',
    inviterEmail: inv.inviter?.email || ''
  };
}

/**
 * Accepts a Pod invitation, registers membership status.
 */
export async function acceptPodInvitation(invitationId, userId, userEmail) {
  if (!invitationId || !userId) throw new Error('Invitation ID and User ID are required.');

  // 1. Fetch invitation
  const { data: inv, error: invErr } = await supabase
    .from('pod_invitations')
    .select('*')
    .or(`id.eq.${invitationId},token_hash.eq.${invitationId}`)
    .single();

  if (invErr || !inv) throw new Error('Invitation record not found.');

  // 2. Add member to pod_members
  const { error: memErr } = await supabase
    .from('pod_members')
    .upsert({
      pod_id: inv.pod_id,
      user_id: userId,
      role: 'MEMBER',
      membership_status: 'ACCEPTED',
      joined_at: new Date().toISOString(),
    }, { onConflict: 'pod_id,user_id' });

  if (memErr) throw memErr;

  // 3. Mark invitation as accepted
  await supabase
    .from('pod_invitations')
    .update({
      status: 'ACCEPTED',
      accepted_by: userId,
      accepted_at: new Date().toISOString(),
    })
    .eq('id', inv.id);

  // 4. Update user matching and profile status
  await supabase
    .from('users')
    .update({
      entry_path: 'EXISTING_POD',
      matching_status: 'POD_ASSIGNED',
      profile_status: 'APPROVED',
      onboarding_status: 'COMPLETED',
      user_onboarded: true,
    })
    .eq('id', userId);

  return inv.pod_id;
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
 * Fetches all Pods from the database (for admin management) via Edge Function with direct DB fallback.
 */
export async function fetchAllPods() {
  try {
    const result = await invokeAdmin('get-pods', { status: 'ALL' });
    if (result?.pods && result.pods.length > 0) {
      return (result.pods || []).map((p) => ({
        ...parseDescription(p),
        membersCount: p.members?.length || 0
      }));
    }
  } catch (e) {
    console.warn('invokeAdmin get-pods failed, trying direct DB:', e?.message || e);
  }

  try {
    const { data: dbPods, error } = await supabase
      .from('pods')
      .select('*, members:pod_members(*, user:users(id, name, email, avatar_url))')
      .neq('status', 'DISSOLVED')
      .order('created_at', { ascending: false });

    if (!error && dbPods) {
      return dbPods.map((p) => ({
        ...parseDescription(p),
        membersCount: p.members?.length || 0
      }));
    }
  } catch (dbErr) {
    console.error('Direct DB fetchAllPods failed:', dbErr);
  }
  return [];
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
  await invokeAdmin('review-pod', { podId, status: 'REJECTED', reason });
  return true;
}

/**
 * Dissolves/Deletes a Pod from Admin Console.
 */
export async function adminDissolvePod(podId, adminId) {
  if (!podId) throw new Error('Pod ID is required.');

  // 1. Fetch member user ids before deletion to reset their matching_status
  try {
    const { data: members } = await supabase
      .from('pod_members')
      .select('user_id')
      .eq('pod_id', podId);

    const memberIds = (members || []).map(m => m.user_id).filter(Boolean);

    if (memberIds.length > 0) {
      await supabase
        .from('users')
        .update({ matching_status: 'IN_POOL' })
        .in('id', memberIds);
    }
  } catch (uErr) {
    console.warn('Could not reset members matching_status:', uErr);
  }

  // 2. Delete pod_members rows
  try {
    await supabase
      .from('pod_members')
      .delete()
      .eq('pod_id', podId);
  } catch (mErr) {
    console.warn('Could not delete pod_members rows:', mErr);
  }

  // 3. Delete or dissolve the pod
  try {
    const { error: delErr } = await supabase
      .from('pods')
      .delete()
      .eq('id', podId);

    if (delErr) {
      // If delete fails due to foreign key references, update to DISSOLVED
      const { error: updErr } = await supabase
        .from('pods')
        .update({ status: 'DISSOLVED', updated_at: new Date().toISOString() })
        .eq('id', podId);
      if (updErr) throw updErr;
    }
  } catch (podErr) {
    console.warn('Direct delete failed, falling back to DISSOLVED:', podErr);
    const { error: updErr } = await supabase
      .from('pods')
      .update({ status: 'DISSOLVED', updated_at: new Date().toISOString() })
      .eq('id', podId);
    if (updErr) throw updErr;
  }

  return true;
}
