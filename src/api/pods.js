import { supabase } from '../supabaseClient';

/**
 * SHA-256 Token Hashing Utility
 */
async function hashToken(token) {
  if (!token) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a new Pod in the database and registers the creator.
 */
export async function createPod(creatorId, name, description, groupType) {
  if (!creatorId || !name) throw new Error('Creator ID and Pod Name are required.');

  // 1. Insert pod record
  const { data: pod, error: podError } = await supabase
    .from('pods')
    .insert({
      name,
      description,
      group_type: groupType,
      created_by: creatorId,
      status: 'CREATING'
    })
    .select()
    .single();

  if (podError) {
    throw new Error(`Failed to create pod: ${podError.message}`);
  }

  // 2. Insert creator membership
  const { error: memberError } = await supabase
    .from('pod_members')
    .insert({
      pod_id: pod.id,
      user_id: creatorId,
      role: 'CREATOR',
      membership_status: 'ACCEPTED'
    });

  if (memberError) {
    throw new Error(`Failed to register creator membership: ${memberError.message}`);
  }

  // 3. Update creator's entry_path to EXISTING_POD
  const { error: userError } = await supabase
    .from('users')
    .update({ entry_path: 'EXISTING_POD' })
    .eq('id', creatorId);

  if (userError) {
    throw new Error(`Failed to update creator entry path: ${userError.message}`);
  }

  return pod;
}

/**
 * Fetches the Pod a user is currently associated with.
 */
export async function fetchPodDetails(userId) {
  if (!userId) return null;

  // 1. Find user's pod member record
  const { data: members, error: memberError } = await supabase
    .from('pod_members')
    .select('pod_id, role, membership_status')
    .eq('user_id', userId);

  if (memberError) {
    throw new Error(`Failed to fetch pod membership: ${memberError.message}`);
  }

  if (!members || members.length === 0) return null;
  const member = members[0];

  // 2. Fetch pod details
  const { data: pods, error: podError } = await supabase
    .from('pods')
    .select('*')
    .eq('id', member.pod_id);

  if (podError) {
    throw new Error(`Failed to fetch pod: ${podError.message}`);
  }

  if (!pods || pods.length === 0) return null;
  const pod = pods[0];

  return {
    ...pod,
    memberRole: member.role,
    membershipStatus: member.membership_status
  };
}

/**
 * Fetches pod details directly by its ID.
 */
export async function fetchPodById(podId) {
  if (!podId) return null;
  const { data, error } = await supabase
    .from('pods')
    .select('*')
    .eq('id', podId);

  if (error) {
    throw new Error(`Failed to fetch pod by ID: ${error.message}`);
  }
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Fetches all members of a Pod.
 */
export async function fetchPodMembers(podId) {
  if (!podId) return [];

  const { data, error } = await supabase
    .from('pod_members')
    .select(`
      id,
      role,
      membership_status,
      joined_at,
      user_id,
      users:user_id (
        name,
        email,
        profile_status,
        readiness_score,
        onboarding_status,
        avatar_url
      )
    `)
    .eq('pod_id', podId);

  if (error) {
    throw new Error(`Failed to fetch pod members: ${error.message}`);
  }

  return (data || []).map(m => ({
    id: m.id,
    userId: m.user_id,
    role: m.role,
    membershipStatus: m.membership_status,
    joinedAt: m.joined_at,
    name: m.users?.name || 'Anonymous',
    email: m.users?.email || '',
    profileStatus: m.users?.profile_status || 'INCOMPLETE',
    onboardingStatus: m.users?.onboarding_status || 'NOT_STARTED',
    readinessScore: m.users?.readiness_score || 0,
    avatarUrl: m.users?.avatar_url
  }));
}

/**
 * Fetches all invitations sent from a Pod.
 */
export async function fetchPodInvitations(podId) {
  if (!podId) return [];

  const { data, error } = await supabase
    .from('pod_invitations')
    .select('*')
    .eq('pod_id', podId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch invitations: ${error.message}`);
  }

  return data || [];
}

/**
 * Invites a user via email. Generates and hashes secure token, sends email notification.
 */
export async function createAndSendInvitation(podId, email, invitedById, inviterName, podName) {
  if (!podId || !email || !invitedById) throw new Error('Missing invitation parameters.');

  const normEmail = email.toLowerCase().trim();

  // 1. Check if there is an active pending invitation already
  const { data: existing, error: existError } = await supabase
    .from('pod_invitations')
    .select('id')
    .eq('pod_id', podId)
    .eq('email', normEmail)
    .eq('status', 'PENDING')
    .maybeSingle();

  if (existError) throw existError;
  if (existing) {
    throw new Error('An invitation is already pending for this email in this Pod.');
  }

  // 2. Generate secure token
  const rawToken = crypto.randomUUID().replace(/-/g, '') + Math.random().toString(36).substring(2);
  const tokenHash = await hashToken(rawToken);

  // 24 hours expiry
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // 3. Save invitation record
  const { error: insertError } = await supabase
    .from('pod_invitations')
    .insert({
      pod_id: podId,
      email: normEmail,
      invited_by: invitedById,
      token_hash: tokenHash,
      status: 'PENDING',
      expires_at: expiresAt
    });

  if (insertError) {
    throw new Error(`Failed to register invitation: ${insertError.message}`);
  }

  // 4. Send email notification via Edge Function
  const inviteUrl = `${window.location.origin}/join-pod?token=${rawToken}`;
  const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
    body: {
      email: normEmail,
      code: rawToken,
      type: 'invitation',
      podName,
      inviterName,
      inviteUrl
    }
  });

  if (emailError) {
    console.error('Edge function email invocation failed:', emailError);
    // We don't fail the transaction, but we log the error
  }

  return true;
}

/**
 * Cancels a pending invitation.
 */
export async function cancelInvitation(invitationId) {
  if (!invitationId) throw new Error('Invitation ID is required.');

  const { error } = await supabase
    .from('pod_invitations')
    .update({ status: 'CANCELLED' })
    .eq('id', invitationId);

  if (error) {
    throw new Error(`Failed to cancel invitation: ${error.message}`);
  }
  return true;
}

/**
 * Resends a pending invitation. Invalidates old token, generates new, updates DB.
 */
export async function resendInvitation(invitationId, inviterName, podName) {
  if (!invitationId) throw new Error('Invitation ID is required.');

  // 1. Fetch current invitation details
  const { data: invite, error: fetchError } = await supabase
    .from('pod_invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (fetchError) throw fetchError;
  if (invite.status !== 'PENDING') throw new Error('Only pending invitations can be resent.');

  // 2. Generate new token
  const rawToken = crypto.randomUUID().replace(/-/g, '') + Math.random().toString(36).substring(2);
  const tokenHash = await hashToken(rawToken);

  // Update expiry to 24 hours from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // 3. Update database record with new token and expiry
  const { error: updateError } = await supabase
    .from('pod_invitations')
    .update({
      token_hash: tokenHash,
      expires_at: expiresAt,
      updated_at: new Date()
    })
    .eq('id', invitationId);

  if (updateError) throw updateError;

  // 4. Send email notification
  const inviteUrl = `${window.location.origin}/join-pod?token=${rawToken}`;
  const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
    body: {
      email: invite.email,
      code: rawToken,
      type: 'invitation',
      podName,
      inviterName,
      inviteUrl
    }
  });

  if (emailError) {
    console.error('Edge function email resend failed:', emailError);
  }

  return true;
}

/**
 * Verifies if an invitation token is valid.
 */
export async function verifyInvitationToken(token) {
  if (!token) throw new Error('Token is required.');

  const tokenHash = await hashToken(token);

  // 1. Query invitation
  const { data: invite, error: inviteError } = await supabase
    .from('pod_invitations')
    .select(`
      *,
      pods:pod_id (name, status),
      invited_by_user:invited_by (name)
    `)
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (inviteError) {
    throw new Error(`Verification query error: ${inviteError.message}`);
  }

  if (!invite) {
    throw new Error('This invitation is no longer valid.');
  }

  // 2. Perform validations
  if (invite.status !== 'PENDING') {
    throw new Error('This invitation is no longer valid (already accepted or cancelled).');
  }

  const isExpired = new Date(invite.expires_at) < new Date();
  if (isExpired) {
    throw new Error('This invitation has expired.');
  }

  if (invite.pods?.status === 'ACTIVE') {
    throw new Error('This Pod has already been finalized and is no longer accepting members.');
  }

  return {
    invitationId: invite.id,
    email: invite.email,
    podId: invite.pod_id,
    podName: invite.pods?.name || 'Oak Grove Community',
    inviterName: invite.invited_by_user?.name || 'BOMA Creator'
  };
}

/**
 * Accepts a Pod invitation, registers membership status.
 */
export async function acceptPodInvitation(invitationId, userId, userEmail) {
  if (!invitationId || !userId || !userEmail) throw new Error('Missing verification parameters.');

  // 1. Fetch the invitation to verify details
  const { data: invite, error: fetchError } = await supabase
    .from('pod_invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (fetchError) throw fetchError;

  if (invite.status !== 'PENDING') {
    throw new Error('Invitation is no longer pending.');
  }

  if (new Date(invite.expires_at) < new Date()) {
    throw new Error('Invitation has expired.');
  }

  // Security Check: Verify email match
  if (invite.email.toLowerCase().trim() !== userEmail.toLowerCase().trim()) {
    throw new Error('This invitation was sent to another email address. Please sign in using the invited email.');
  }

  // 2. Insert pod member record (UNIQUE constraint handles duplicate protection)
  const { error: insertError } = await supabase
    .from('pod_members')
    .insert({
      pod_id: invite.pod_id,
      user_id: userId,
      role: 'MEMBER',
      membership_status: 'ACCEPTED'
    });

  if (insertError) {
    if (insertError.code === '23505') {
      // Duplicate key error, user is already a member
      console.warn('Membership already exists, proceeding to mark accepted');
    } else {
      throw new Error(`Failed to join pod: ${insertError.message}`);
    }
  }

  // 3. Mark invitation as accepted
  const { error: updateInviteError } = await supabase
    .from('pod_invitations')
    .update({
      status: 'ACCEPTED',
      accepted_by: userId,
      accepted_at: new Date()
    })
    .eq('id', invitationId);

  if (updateInviteError) throw updateInviteError;

  // 4. Update member entry_path to EXISTING_POD
  const { error: userError } = await supabase
    .from('users')
    .update({ entry_path: 'EXISTING_POD' })
    .eq('id', userId);

  if (userError) throw userError;

  return invite.pod_id;
}

/**
 * Submits the Pod for Admin Review.
 */
export async function submitPodForReview(podId) {
  if (!podId) throw new Error('Pod ID is required.');

  const { error } = await supabase
    .from('pods')
    .update({ status: 'UNDER_REVIEW', updated_at: new Date() })
    .eq('id', podId);

  if (error) {
    throw new Error(`Failed to submit pod: ${error.message}`);
  }
  return true;
}

/**
 * Fetches all Pods from the database (for admin management).
 */
export async function fetchAllPods() {
  const { data, error } = await supabase
    .from('pods')
    .select(`
      *,
      pod_members (
        id
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch all pods: ${error.message}`);
  }

  return (data || []).map(p => ({
    ...p,
    membersCount: p.pod_members?.length || 0
  }));
}

/**
 * Fetches all Pods currently in the UNDER_REVIEW queue.
 */
export async function fetchPodsUnderReview() {
  const { data, error } = await supabase
    .from('pods')
    .select('*')
    .eq('status', 'UNDER_REVIEW')
    .neq('group_type', 'Community Group')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch pods under review: ${error.message}`);
  }
  return data || [];
}

/**
 * Approves a Pod, setting its status to ACTIVE.
 */
export async function approvePod(podId) {
  if (!podId) throw new Error('Pod ID is required.');

  const { error } = await supabase
    .from('pods')
    .update({ 
      status: 'ACTIVE', 
      updated_at: new Date() 
    })
    .eq('id', podId);

  if (error) {
    throw new Error(`Failed to approve pod: ${error.message}`);
  }
  return true;
}

/**
 * Rejects a Pod, setting its status to REJECTED with feedback.
 */
export async function rejectPod(podId, reason) {
  if (!podId) throw new Error('Pod ID is required.');

  const { error } = await supabase
    .from('pods')
    .update({ 
      status: 'REJECTED', 
      description: reason ? `Rejected: ${reason}` : 'Rejected', 
      updated_at: new Date() 
    })
    .eq('id', podId);

  if (error) {
    throw new Error(`Failed to reject pod: ${error.message}`);
  }
  return true;
}

/**
 * Removes a member from a Pod and resets their matching status.
 */
export async function leavePod(userId, podId) {
  if (!userId || !podId) throw new Error('User ID and Pod ID are required.');

  // 1. Remove from pod_members
  const { error: deleteError } = await supabase
    .from('pod_members')
    .delete()
    .eq('pod_id', podId)
    .eq('user_id', userId);

  if (deleteError) {
    throw new Error(`Failed to remove pod membership: ${deleteError.message}`);
  }

  // 2. Reset user's matching status to IN_POOL
  const { data: user, error: userError } = await supabase
    .from('users')
    .update({ 
      matching_status: 'IN_POOL',
      entry_path: 'MATCHING_POOL'
    })
    .eq('id', userId)
    .select()
    .single();

  if (userError) {
    throw new Error(`Failed to reset user matching status: ${userError.message}`);
  }

  return user;
}

/**
 * Dissolves/Deletes a Pod. Resets matching status for all members and deletes the Pod.
 */
export async function dissolvePod(podId, creatorId) {
  if (!podId || !creatorId) throw new Error('Pod ID and Creator ID are required.');

  // 1. Fetch all members first to reset their user records
  const { data: members, error: membersError } = await supabase
    .from('pod_members')
    .select('user_id')
    .eq('pod_id', podId);

  if (membersError) {
    throw new Error(`Failed to fetch pod members for dissolution: ${membersError.message}`);
  }

  const userIds = (members || []).map(m => m.user_id);

  // 2. Reset users table records
  if (userIds.length > 0) {
    const { error: usersError } = await supabase
      .from('users')
      .update({ 
        matching_status: 'IN_POOL',
        entry_path: 'MATCHING_POOL' // reset so they can match again
      })
      .in('id', userIds);

    if (usersError) {
      throw new Error(`Failed to reset members user records: ${usersError.message}`);
    }
  }

  // 3. Delete the pod (will cascade delete pod_members and pod_invitations)
  const { error: deleteError } = await supabase
    .from('pods')
    .delete()
    .eq('id', podId);

  if (deleteError) {
    throw new Error(`Failed to delete pod: ${deleteError.message}`);
  }

  // Fetch and return the updated creator's user profile
  const { data: creatorProfile, error: creatorError } = await supabase
    .from('users')
    .select('*')
    .eq('id', creatorId)
    .single();

  if (creatorError) {
    throw creatorError;
  }

  return creatorProfile;
}

/**
 * Dissolves/Deletes a Pod from Admin Console.
 */
export async function adminDissolvePod(podId, adminId) {
  if (!podId) throw new Error('Pod ID is required.');

  // 1. Fetch all members first to reset their user records
  const { data: members, error: membersError } = await supabase
    .from('pod_members')
    .select('user_id')
    .eq('pod_id', podId);

  if (membersError) {
    throw new Error(`Failed to fetch pod members for dissolution: ${membersError.message}`);
  }

  const userIds = (members || []).map(m => m.user_id);

  // 2. Reset users table records
  if (userIds.length > 0) {
    const { error: usersError } = await supabase
      .from('users')
      .update({ 
        matching_status: 'IN_POOL'
      })
      .in('id', userIds);

    if (usersError) {
      throw new Error(`Failed to reset members user records: ${usersError.message}`);
    }
  }

  // 3. Delete the pod (will cascade delete pod_members and pod_invitations)
  const { error: deleteError } = await supabase
    .from('pods')
    .delete()
    .eq('id', podId);

  if (deleteError) {
    throw new Error(`Failed to delete pod: ${deleteError.message}`);
  }

  // 4. Insert admin audit record
  await supabase
    .from('profile_reviews')
    .insert([{
      user_id: userIds[0] || adminId,
      admin_id: adminId,
      action: 'REJECT',
      reason: `Admin dissolved/deleted Pod (ID: ${podId})`,
      previous_status: 'ACTIVE',
      new_status: 'DELETED'
    }]);

  return true;
}

