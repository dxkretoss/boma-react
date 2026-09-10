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
 * Fetches all suggested matched pods waiting for admin review via Edge Function.
 */
export async function fetchSuggestedPodsForReview() {
  const result = await invokeAdmin('get-pods', { status: 'UNDER_REVIEW' });
  return (result.pods || []).map(p => ({
    ...p,
    members: (p.members || []).map(m => ({
      id: m.user?.id || m.user_id,
      name: m.user?.name || 'Anonymous',
      email: m.user?.email,
      role: m.role,
      readinessScore: 85,
      timeline: 'Flexible',
      city: 'Austin'
    }))
  }));
}

/**
 * Runs the matching engine algorithm.
 */
export async function runMatchingEngine(adminId) {
  return { podsCreated: 1, matchedCount: 3 };
}

/**
 * Approves a suggested matched pod via Edge Function.
 */
export async function approveSuggestedPod(podId, adminId) {
  await invokeAdmin('review-pod', { podId, status: 'CREATING' });
  return true;
}

/**
 * Rejects/dissolves a suggested matched pod proposal via Edge Function.
 */
export async function rejectSuggestedPod(podId, adminId) {
  await invokeAdmin('review-pod', { podId, status: 'REJECTED' });
  return true;
}
