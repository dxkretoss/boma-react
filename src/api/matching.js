import { supabase } from '../supabaseClient';

const formatTimeline = (timeline) => {
  if (!timeline) return 'Not Set';
  if (timeline === 'timeline_5yr') return '5+ years';
  if (timeline === 'timeline_2yr') return '2+ years';
  if (timeline === 'timeline_flexible') return 'Flexible';
  return timeline;
};

/**
 * Calculates a match score between two user profiles.
 * Mapped to standard weights: lifestyle = 30%, location = 30%, commitment = 20%, readiness/intent = 20%.
 */
function calculateMatchScore(u1, u2) {
  let score = 0;

  // 1. City / Location match (30%)
  if (u1.location_city && u2.location_city &&
      u1.location_city.toLowerCase().trim() === u2.location_city.toLowerCase().trim()) {
    score += 30;
  }

  // 2. Setting preference match (30%)
  if (u1.setting_preference && u2.setting_preference &&
      u1.setting_preference.toLowerCase().trim() === u2.setting_preference.toLowerCase().trim()) {
    score += 30;
  }

  // 3. Commitment timeline match (20%)
  if (u1.commitment_timeline && u2.commitment_timeline &&
      u1.commitment_timeline === u2.commitment_timeline) {
    score += 20;
  }

  // 4. Housing intent match (20%)
  if (u1.housing_intent && u2.housing_intent &&
      u1.housing_intent === u2.housing_intent) {
    score += 20;
  } else {
    score += 10; // Partial alignment
  }

  return score;
}

/**
 * Dynamically queries other approved users in the pool and forms a real-time matched Pod suggestion.
 * Follows Rule 1 of SKILL.md.
 * @param {object} currentUser
 * @returns {Promise<object|null>} Dynamic matching suggestion or null
 */
export async function findSuggestedMatches(currentUser) {
  if (!currentUser) return null;

  // 1. Fetch all other eligible users
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .neq('id', currentUser.id)
    .neq('role', 'admin')
    .eq('entry_path', 'MATCHING_POOL')
    .eq('profile_status', 'APPROVED')
    .eq('matching_status', 'IN_POOL');

  if (error) {
    throw new Error(`Failed to query matching pool candidates: ${error.message}`);
  }

  if (!users || users.length === 0) {
    return null;
  }

  // 2. Score compatibility
  const scoredCandidates = users.map(u => ({
    user: u,
    score: calculateMatchScore(currentUser, u)
  })).sort((a, b) => b.score - a.score);

  // Take top 3 compatible neighbors
  const matches = scoredCandidates.slice(0, 3);
  const avgMatchPct = Math.round(
    matches.reduce((acc, m) => acc + m.score, 0) / (matches.length || 1)
  );

  const cityBase = currentUser.location_city ? currentUser.location_city.split(',')[0] : 'Austin';

  return {
    name: `${cityBase} Commons Pod`,
    location: currentUser.location_city || 'Austin, TX',
    formed: 'Today',
    photo: 'assets/pod_austin.png',
    avgReadiness: Math.round(
      matches.reduce((acc, m) => acc + (m.user.readiness_score || 80), 0) / (matches.length || 1)
    ),
    health: 'Stable',
    matchPct: avgMatchPct,
    tags: [
      currentUser.location_city || 'Austin, TX',
      currentUser.setting_preference ? (currentUser.setting_preference.charAt(0).toUpperCase() + currentUser.setting_preference.slice(1)) : 'Suburban',
      currentUser.housing_intent === 'purchase' || currentUser.housing_intent === 'purchase-primary' ? 'Purchase' : 'Co-development',
      `${formatTimeline(currentUser.commitment_timeline) || '5+ year'} commitment`
    ],
    members: matches.map(m => ({
      id: m.user.id,
      name: m.user.name || 'Anonymous Member',
      email: m.user.email,
      score: m.user.readiness_score || 75,
      detail: `${formatTimeline(m.user.commitment_timeline) || '2+ yrs'} commitment · ${m.user.setting_preference || 'suburban'}`
    }))
  };
}

/**
 * Creates a Pod and inserts members dynamically upon joining.
 * Follows Rule 1 of SKILL.md.
 */
/**
 * Accepts the match suggestion for the current user.
 * If all members have accepted, activates the pod.
 */
export async function acceptMatchedPod(podId, userId) {
  if (!podId || !userId) throw new Error('Pod ID and User ID are required.');

  // 1. Update the user's membership_status to ACCEPTED
  const { error: memError } = await supabase
    .from('pod_members')
    .update({ membership_status: 'ACCEPTED' })
    .eq('pod_id', podId)
    .eq('user_id', userId);

  if (memError) {
    throw new Error(`Failed to update membership status: ${memError.message}`);
  }

  // 2. Check if all members of the pod have accepted
  const { data: members, error: fetchMembersError } = await supabase
    .from('pod_members')
    .select('user_id, membership_status')
    .eq('pod_id', podId);

  if (fetchMembersError) {
    throw new Error(`Failed to check pod members: ${fetchMembersError.message}`);
  }

  const allAccepted = members.every(m => m.membership_status === 'ACCEPTED');

  if (allAccepted) {
    // 3. Update Pod status to ACTIVE
    const { error: podError } = await supabase
      .from('pods')
      .update({ status: 'ACTIVE', updated_at: new Date() })
      .eq('id', podId);

    if (podError) {
      throw new Error(`Failed to activate pod: ${podError.message}`);
    }

    // 4. Update all members' users matching_status to MATCHED and delete from matching pool
    const memberUserIds = members.map(m => m.user_id);
    const { error: usersError } = await supabase
      .from('users')
      .update({ matching_status: 'MATCHED' })
      .in('id', memberUserIds);

    if (usersError) {
      throw new Error(`Failed to update users matching status: ${usersError.message}`);
    }

    // Delete matching pool entries
    await supabase
      .from('matching_pool_entries')
      .delete()
      .in('user_id', memberUserIds);
  }

  // Fetch and return the updated user profile
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;
  return userProfile;
}

/**
 * Declines the match suggestion for the current user.
 * Dissolves the pod suggestion and returns all members to the pool.
 */
export async function declineMatchedPod(podId, userId) {
  if (!podId) throw new Error('Pod ID is required.');

  // 1. Fetch proposed members before deleting
  const { data: members, error: memError } = await supabase
    .from('pod_members')
    .select('user_id')
    .eq('pod_id', podId);

  if (memError) throw new Error(`Failed to load members: ${memError.message}`);

  const memberUserIds = (members || []).map(m => m.user_id);

  // 2. Reset members' matching status to IN_POOL
  if (memberUserIds.length > 0) {
    await supabase
      .from('users')
      .update({ matching_status: 'IN_POOL' })
      .in('id', memberUserIds);
  }

  // 3. Delete the pod (cascades and deletes pod_members)
  const { error: deleteError } = await supabase
    .from('pods')
    .delete()
    .eq('id', podId);

  if (deleteError) throw new Error(`Failed to reject pod proposal: ${deleteError.message}`);

  // Fetch and return the updated user profile
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;
  return userProfile;
}

function calculateMatchScoreDynamic(u1, u2, weights) {
  let score = 0;
  const { lifestyleW, locationW, readinessW, commitmentW } = weights;

  // 1. Location match (Location Alignment Weight)
  if (u1.location_city && u2.location_city &&
      u1.location_city.toLowerCase().trim() === u2.location_city.toLowerCase().trim()) {
    score += locationW;
  }

  // 2. Setting preference / lifestyle match (Lifestyle & Values Weight)
  if (u1.setting_preference && u2.setting_preference &&
      u1.setting_preference.toLowerCase().trim() === u2.setting_preference.toLowerCase().trim()) {
    score += lifestyleW;
  }

  // 3. Commitment timeline match (Commitment timeline weight)
  if (u1.commitment_timeline && u2.commitment_timeline &&
      u1.commitment_timeline === u2.commitment_timeline) {
    score += commitmentW;
  }

  // 4. Housing intent match (Readiness / Financial weight)
  if (u1.housing_intent && u2.housing_intent &&
      u1.housing_intent === u2.housing_intent) {
    score += readinessW;
  } else {
    score += (readinessW / 2); // Partial alignment
  }

  return Math.round(score);
}

/**
 * Runs the matching engine algorithm on all eligible users in matching pool.
 * Creates proposed suggested pods with status = 'PENDING_REVIEW'.
 */
export async function runMatchingEngine(adminId) {
  // 1. Fetch matching weights
  const { data: weightsData } = await supabase
    .from('matching_weights')
    .select('*')
    .eq('is_active', true);

  let lifestyleW = 30;
  let locationW = 30;
  let readinessW = 20;
  let commitmentW = 20;

  if (weightsData && weightsData.length > 0) {
    weightsData.forEach(w => {
      if (w.variable_key === 'lifestyle') lifestyleW = w.weight;
      else if (w.variable_key === 'location') locationW = w.weight;
      else if (w.variable_key === 'readiness') readinessW = w.weight;
      else if (w.variable_key === 'commitment') commitmentW = w.weight;
    });
  }
  const weights = { lifestyleW, locationW, readinessW, commitmentW };

  // 2. Fetch all eligible users
  const { data: poolUsers, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('matching_status', 'IN_POOL')
    .eq('profile_status', 'APPROVED')
    .eq('entry_path', 'MATCHING_POOL')
    .neq('role', 'admin');

  if (usersError) throw new Error(`Failed to load pool users: ${usersError.message}`);
  if (!poolUsers || poolUsers.length < 2) {
    return { podsCreated: 0, matchedCount: 0 };
  }

  let matchedUserIds = new Set();
  let podsCreated = 0;
  let matchedCount = 0;

  // 3. Simple Greedy Matching Algorithm
  for (let i = 0; i < poolUsers.length; i++) {
    const user1 = poolUsers[i];
    if (matchedUserIds.has(user1.id)) continue;

    // Find compatible neighbors for user1
    let scoredMatches = [];
    for (let j = 0; j < poolUsers.length; j++) {
      const user2 = poolUsers[j];
      if (user1.id === user2.id || matchedUserIds.has(user2.id)) continue;

      const compatibility = calculateMatchScoreDynamic(user1, user2, weights);
      scoredMatches.push({ user: user2, score: compatibility });
    }

    // Sort neighbors by compatibility score descending
    scoredMatches.sort((a, b) => b.score - a.score);

    // Find if we have matches above threshold (lowered to 40% for easier matching/testing of different preferences)
    const validMatches = scoredMatches.filter(m => m.score >= 40).slice(0, 3); // Pair, Trio, or Quad

    if (validMatches.length >= 1) { // At least 1 compatible partner -> Forms a group of size 2+
      const group = [user1, ...validMatches.map(m => m.user)];
      
      // Create a proposed pod in draft/review state
      const cityBase = user1.location_city ? user1.location_city.split(',')[0] : 'Austin';
      const ADJECTIVES = ["Cedar", "Oak", "Sunrise", "Bluebell", "Meadow", "Hillside", "Maple", "Summit", "Valley", "Elm", "Pine", "Redwood"];
      const randomAdj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const uniquePodName = `${cityBase} ${randomAdj} Pod`;
      
      const { data: pod, error: podError } = await supabase
        .from('pods')
        .insert({
          name: uniquePodName,
          description: `Engine-generated suggested pod proposal. Weights used: Lifestyle ${lifestyleW}%, Location ${locationW}%, Budget ${readinessW}%, Commitment ${commitmentW}%.`,
          group_type: 'Community Group',
          status: 'UNDER_REVIEW',
          created_by: user1.id
        })
        .select()
        .single();

      if (podError) throw new Error(`Failed to create proposed pod: ${podError.message}`);

      // Insert members with membership_status = 'PENDING'
      for (let k = 0; k < group.length; k++) {
        const member = group[k];
        matchedUserIds.add(member.id);

        const { error: memError } = await supabase
          .from('pod_members')
          .insert({
            pod_id: pod.id,
            user_id: member.id,
            role: k === 0 ? 'CREATOR' : 'MEMBER',
            membership_status: 'PENDING'
          });

        if (memError) throw new Error(`Failed to add member to proposal: ${memError.message}`);

        // Update user matching status to show they are proposed/reserved
        await supabase
          .from('users')
          .update({ matching_status: 'POD_ASSIGNED' })
          .eq('id', member.id);
      }

      podsCreated++;
      matchedCount += group.length;
    }
  }

  return { podsCreated, matchedCount };
}

/**
 * Fetches all suggested matched pods waiting for admin review.
 */
export async function fetchSuggestedPodsForReview() {
  const { data: proposedPods, error: podError } = await supabase
    .from('pods')
    .select('*')
    .eq('group_type', 'Community Group')
    .eq('status', 'UNDER_REVIEW');

  if (podError) throw new Error(`Failed to load proposed pods: ${podError.message}`);
  if (!proposedPods || proposedPods.length === 0) return [];

  const list = [];
  for (const pod of proposedPods) {
    // Fetch members
    const { data: members, error: memError } = await supabase
      .from('pod_members')
      .select(`
        *,
        user:users(*)
      `)
      .eq('pod_id', pod.id);

    if (memError) throw new Error(`Failed to load members for proposed pod: ${memError.message}`);

    list.push({
      ...pod,
      members: (members || []).map(m => ({
        id: m.user_id,
        name: m.user?.name || 'Anonymous',
        email: m.user?.email,
        role: m.role,
        readinessScore: m.user?.readiness_score || 70,
        timeline: m.user?.commitment_timeline || 'Flexible',
        city: m.user?.location_city || 'Austin'
      }))
    });
  }

  return list;
}

/**
 * Approves a suggested matched pod.
 */
export async function approveSuggestedPod(podId, adminId) {
  if (!podId) throw new Error('Pod ID is required.');

  // 1. Update pod status to approved (CREATING in DB check constraint)
  const { error: podError } = await supabase
    .from('pods')
    .update({
      status: 'CREATING',
      updated_at: new Date()
    })
    .eq('id', podId);

  if (podError) throw new Error(`Failed to approve pod: ${podError.message}`);

  // 2. Fetch proposed members
  const { data: members, error: memError } = await supabase
    .from('pod_members')
    .select('user_id')
    .eq('pod_id', podId);

  if (memError) throw new Error(`Failed to load members: ${memError.message}`);

  // 3. Insert admin audit record
  await supabase
    .from('profile_reviews')
    .insert([{
      user_id: members[0]?.user_id || adminId,
      admin_id: adminId,
      action: 'APPROVE',
      reason: `Approved suggested Matched Pod (ID: ${podId})`,
      previous_status: 'UNDER_REVIEW',
      new_status: 'APPROVED'
    }]);

  return true;
}

/**
 * Rejects/dissolves a suggested matched pod proposal.
 */
export async function rejectSuggestedPod(podId, adminId) {
  if (!podId) throw new Error('Pod ID is required.');

  // 1. Fetch proposed members before deleting
  const { data: members, error: memError } = await supabase
    .from('pod_members')
    .select('user_id')
    .eq('pod_id', podId);

  if (memError) throw new Error(`Failed to load members: ${memError.message}`);

  // 2. Reset members' matching status to IN_POOL
  for (const m of (members || [])) {
    await supabase
      .from('users')
      .update({ matching_status: 'IN_POOL' })
      .eq('id', m.user_id);
  }

  // 3. Delete the pod (cascades and deletes pod_members)
  const { error: deleteError } = await supabase
    .from('pods')
    .delete()
    .eq('id', podId);

  if (deleteError) throw new Error(`Failed to reject pod proposal: ${deleteError.message}`);

  // 4. Log audit record
  await supabase
    .from('profile_reviews')
    .insert([{
      user_id: members[0]?.user_id || adminId,
      admin_id: adminId,
      action: 'REJECT',
      reason: `Rejected suggested Matched Pod (ID: ${podId})`,
      previous_status: 'UNDER_REVIEW',
      new_status: 'DELETED'
    }]);

  return true;
}

/**
 * Creates a Pod and inserts members dynamically upon joining.
 * Used for joining simulated matches in the prototype.
 */
export async function joinMatchedPod(currentUser, suggestedPod) {
  if (!currentUser?.id || !suggestedPod) {
    throw new Error('User and Pod details are required to join.');
  }

  // 1. Create the new Pod
  const { data: pod, error: podError } = await supabase
    .from('pods')
    .insert({
      name: suggestedPod.name,
      description: 'Group created via BOMA dynamic matching compatibility engine.',
      group_type: 'Community Group',
      created_by: currentUser.id,
      status: 'ACTIVE'
    })
    .select()
    .single();

  if (podError) {
    throw new Error(`Failed to create matched pod: ${podError.message}`);
  }

  // 2. Add current user as CREATOR/MEMBER
  const { error: creatorError } = await supabase
    .from('pod_members')
    .insert({
      pod_id: pod.id,
      user_id: currentUser.id,
      role: 'CREATOR',
      membership_status: 'ACCEPTED'
    });

  if (creatorError) {
    throw new Error(`Failed to register creator: ${creatorError.message}`);
  }

  // 3. Add other matched users from database as MEMBERS
  for (const m of suggestedPod.members) {
    await supabase
      .from('pod_members')
      .insert({
        pod_id: pod.id,
        user_id: m.id,
        role: 'MEMBER',
        membership_status: 'ACCEPTED'
      });
  }

  // 4. Update current user's matching status
  await supabase
    .from('users')
    .update({ matching_status: 'MATCHED' })
    .eq('id', currentUser.id);

  return pod;
}

