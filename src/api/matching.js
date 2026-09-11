import { supabase } from '../supabaseClient';
import { acceptPodProposal, declinePodProposal } from './pods';

const formatTimeline = (timeline) => {
  if (!timeline) return 'Not Set';
  if (timeline === 'timeline_5yr') return '5+ years';
  if (timeline === 'timeline_2yr') return '2+ years';
  if (timeline === 'timeline_flexible') return 'Flexible';
  return timeline;
};

/**
 * Helper to invoke the manage-matching Supabase Edge Function
 */
async function invokeMatching(action, payload = {}) {
  const { data, error } = await supabase.functions.invoke('manage-matching', {
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
    throw new Error(errorMessage || 'Matching operation failed');
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
 * Dynamically queries compatible neighbors and forms a matched Pod suggestion via Edge Function.
 * @param {object} currentUser
 * @returns {Promise<object|null>} Dynamic matching suggestion or null
 */
export async function findSuggestedMatches(currentUser) {
  if (!currentUser?.id) return null;

  try {
    const result = await invokeMatching('find-matches', { userId: currentUser.id });
    if (!result?.suggestedPod) return null;

    return {
      name: result.suggestedPod.name,
      location: result.suggestedPod.location || 'Austin, TX',
      formed: result.suggestedPod.formed || 'Recently',
      photo: 'assets/pod_austin.png',
      avgReadiness: 85,
      health: result.suggestedPod.health || 'Stable',
      matchPct: result.suggestedPod.matchPct || 85,
      tags: result.suggestedPod.tags || [
        currentUser.location_city || 'Austin, TX',
        currentUser.setting_preference || 'Suburban',
        'Purchase',
        `${formatTimeline(currentUser.commitment_timeline) || '5+ year'} commitment`
      ],
      members: (result.suggestedPod.members || []).map(m => ({
        id: m.id,
        name: m.name || 'Anonymous Member',
        score: m.score || 80,
        detail: `Readiness ${m.score || 80}% · ${m.matchPct || 85}% compatibility`
      }))
    };
  } catch (err) {
    console.error('Failed to find matches via Edge Function:', err);
    return null;
  }
}

/**
 * Accepts the match suggestion for the current user via Edge Function.
 */
export async function acceptMatchedPod(podId, userId) {
  return acceptPodProposal(podId, userId);
}

/**
 * Declines the match suggestion for the current user via Edge Function.
 */
export async function declineMatchedPod(podId, userId) {
  return declinePodProposal(podId, userId);
}

/**
 * Fetches matching weights via Edge Function.
 */
export async function fetchMatchingWeights() {
  try {
    const result = await invokeMatching('get-matching-weights');
    return result.weights || [];
  } catch (err) {
    console.error('Failed to fetch matching weights via Edge Function:', err);
    return [];
  }
}

/**
 * Fetches all suggested matched pods waiting for admin review.
 */
export async function fetchSuggestedPodsForReview() {
  let pods = [];
  try {
    const { data: dbPods, error } = await supabase
      .from('pods')
      .select(`*, members:pod_members(*, user:users(id, name, email, avatar_url, readiness_score))`)
      .order('created_at', { ascending: false });

    if (!error && dbPods) {
      // Only display pods waiting for review (UNDER_REVIEW / PENDING_REVIEW)
      pods = dbPods.filter(p => p.group_type === 'Matching Pool' && ['UNDER_REVIEW', 'PENDING_REVIEW'].includes(p.status));
    }
  } catch (dbErr) {
    console.warn('Direct pods query error:', dbErr);
  }

  return pods.map(p => ({
    ...p,
    description: (p.description || '').split(' ||| ')[0] || 'Algorithmic match formed by BOMA Matching Engine.',
    members: (p.members || []).map(m => ({
      id: m.user?.id || m.user_id,
      name: m.user?.name || 'Anonymous',
      email: m.user?.email,
      role: m.role,
      readinessScore: m.user?.readiness_score || 85,
      timeline: 'Flexible',
      city: p.name?.split(' ')[0] || 'Austin'
    }))
  }));
}

/**
 * Runs the matching engine algorithm.
 */
export async function runMatchingEngine(adminId) {
  // 1. Fetch active pod members to exclude already assigned users
  const { data: existingMembers } = await supabase
    .from('pod_members')
    .select('user_id, pod_id, pods:pod_id(status)')
    .neq('membership_status', 'DECLINED');

  const busyUserIds = new Set(
    (existingMembers || [])
      .filter(m => m.pods && ['ACTIVE', 'CREATING', 'UNDER_REVIEW', 'PENDING_REVIEW'].includes(m.pods.status))
      .map(m => m.user_id)
  );

  // 2. Fetch candidates in matching pool with approved profiles
  const { data: candidates, error: cErr } = await supabase
    .from('users')
    .select('*')
    .neq('role', 'admin')
    .eq('entry_path', 'MATCHING_POOL')
    .eq('profile_status', 'APPROVED');

  if (cErr) throw new Error(`Failed to load matching candidates: ${cErr.message}`);

  const eligibleCandidates = (candidates || []).filter(u => !busyUserIds.has(u.id));

  if (eligibleCandidates.length < 2) {
    return {
      podsCreated: 0,
      matchedCount: 0,
      message: `Not enough unassigned candidates in matching pool (found ${eligibleCandidates.length}, minimum 2 required).`
    };
  }

  // 3. Group candidates by city/region (groups of 2-4 users)
  const cityGroups = {};
  for (const u of eligibleCandidates) {
    const cityKey = (u.location_city || 'General Area').split(',')[0].trim().toLowerCase();
    if (!cityGroups[cityKey]) cityGroups[cityKey] = [];
    cityGroups[cityKey].push(u);
  }

  let podsCreatedCount = 0;
  let matchedUsersCount = 0;

  for (const [cityKey, group] of Object.entries(cityGroups)) {
    if (group.length < 2) continue;

    for (let i = 0; i < group.length; i += 4) {
      const chunk = group.slice(i, i + 4);
      if (chunk.length < 2) break;

      const primaryUser = chunk[0];
      const cityName = primaryUser.location_city ? primaryUser.location_city.split(',')[0] : 'Community';
      const podName = `${cityName} Commons Pod ${Math.floor(100 + Math.random() * 900)}`;

      const podPayload = {
        name: podName,
        description: `Algorithmic match formed by BOMA Matching Engine for ${chunk.length} compatible members`,
        group_type: 'Matching Pool',
        created_by: primaryUser.id,
        status: 'UNDER_REVIEW',
      };

      const { data: insertedPod, error: podErr } = await supabase
        .from('pods')
        .insert(podPayload)
        .select()
        .single();

      if (podErr || !insertedPod) {
        throw new Error(`Failed to create matched pod: ${podErr?.message || 'Database error'}`);
      }

      // Insert member rows
      const memberRows = chunk.map((u, idx) => ({
        pod_id: insertedPod.id,
        user_id: u.id,
        role: idx === 0 ? 'CREATOR' : 'MEMBER',
        membership_status: 'PENDING',
      }));

      await supabase.from('pod_members').insert(memberRows);

      // Update users' matching_status
      const userIds = chunk.map(u => u.id);
      await supabase
        .from('users')
        .update({ matching_status: 'MATCHED' })
        .in('id', userIds);

      podsCreatedCount++;
      matchedUsersCount += chunk.length;
    }
  }

  // Cross-city fallback grouping if separate city groups did not reach threshold of 2
  if (podsCreatedCount === 0 && eligibleCandidates.length >= 2) {
    const chunk = eligibleCandidates.slice(0, 4);
    const primaryUser = chunk[0];
    const cityName = primaryUser.location_city ? primaryUser.location_city.split(',')[0] : 'Community';
    const podName = `${cityName} Commons Pod ${Math.floor(100 + Math.random() * 900)}`;

    const podPayload = {
      name: podName,
      description: `Algorithmic match formed by BOMA Matching Engine for ${chunk.length} compatible members`,
      group_type: 'Matching Pool',
      created_by: primaryUser.id,
      status: 'UNDER_REVIEW',
    };

    const { data: insertedPod } = await supabase
      .from('pods')
      .insert(podPayload)
      .select()
      .single();

    if (insertedPod) {
      const memberRows = chunk.map((u, idx) => ({
        pod_id: insertedPod.id,
        user_id: u.id,
        role: idx === 0 ? 'CREATOR' : 'MEMBER',
        membership_status: 'PENDING',
      }));

      await supabase.from('pod_members').insert(memberRows);

      const userIds = chunk.map(u => u.id);
      await supabase
        .from('users')
        .update({ matching_status: 'MATCHED' })
        .in('id', userIds);

      podsCreatedCount = 1;
      matchedUsersCount = chunk.length;
    }
  }

  return {
    podsCreated: podsCreatedCount,
    matchedCount: matchedUsersCount,
    message: podsCreatedCount > 0
      ? `Successfully matched ${matchedUsersCount} users into ${podsCreatedCount} proposed pods!`
      : 'No compatible groups could be formed with current candidates.'
  };
}

/**
 * Approves a suggested matched pod and presents it to matched members for review and join.
 */
export async function approveSuggestedPod(podId, adminId) {
  // 1. Update pod status to CREATING so it is presented to users for confirmation
  const { error: podErr } = await supabase
    .from('pods')
    .update({ status: 'CREATING', updated_at: new Date().toISOString() })
    .eq('id', podId);

  if (podErr) throw new Error(`Failed to approve pod: ${podErr.message}`);

  // 2. Ensure member statuses are PENDING so each user reviews and clicks "Join Pod"
  try {
    await supabase
      .from('pod_members')
      .update({ membership_status: 'PENDING' })
      .eq('pod_id', podId);
  } catch (memErr) {
    console.warn('Could not update member statuses:', memErr);
  }

  return true;
}

/**
 * Rejects/dissolves a suggested matched pod proposal and resets members to pool.
 */
export async function rejectSuggestedPod(podId, adminId) {
  // 1. Fetch member user ids
  const { data: members } = await supabase
    .from('pod_members')
    .select('user_id')
    .eq('pod_id', podId);

  const memberIds = (members || []).map(m => m.user_id);

  // 2. Mark pod as REJECTED
  const { error: podErr } = await supabase
    .from('pods')
    .update({ status: 'REJECTED', updated_at: new Date().toISOString() })
    .eq('id', podId);

  if (podErr) throw new Error(`Failed to reject pod: ${podErr.message}`);

  // 3. Reset users' matching_status back to IN_POOL
  if (memberIds.length > 0) {
    try {
      await supabase
        .from('users')
        .update({ matching_status: 'IN_POOL' })
        .in('id', memberIds);
    } catch (uErr) {
      console.warn('Failed to reset user matching_status:', uErr);
    }

    try {
      await supabase
        .from('pod_members')
        .delete()
        .eq('pod_id', podId);
    } catch (memErr) {
      console.warn('Failed to delete pod_members on rejection:', memErr);
    }
  }

  return true;
}
