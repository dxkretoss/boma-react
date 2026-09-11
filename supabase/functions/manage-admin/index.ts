import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function sanitizeUser(user: any) {
  if (!user) return null;
  const { password, verification_code, ...safeUser } = user;
  return safeUser;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const body = await req.json();
    const { action } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing "action" parameter in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 1. ACTION: GET-DASHBOARD-STATS
    // =========================================================================
    if (action === 'get-dashboard-stats') {
      const { count: usersCount } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).neq('role', 'admin');
      const { count: podsCount } = await supabaseAdmin.from('pods').select('*', { count: 'exact', head: true });
      
      let waitlistCount = 0;
      try {
        const { count, error } = await supabaseAdmin.from('waitlist').select('*', { count: 'exact', head: true });
        if (!error && typeof count === 'number') {
          waitlistCount = count;
        } else {
          const { count: subCount } = await supabaseAdmin.from('waitlist_submissions').select('*', { count: 'exact', head: true });
          if (typeof subCount === 'number') waitlistCount = subCount;
        }
      } catch (_e) {
        waitlistCount = 0;
      }

      const { count: pendingReviewsCount } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('profile_status', 'UNDER_REVIEW');

      return new Response(
        JSON.stringify({
          success: true,
          stats: {
            totalUsers: usersCount || 0,
            activePods: podsCount || 0,
            waitlistCount: waitlistCount || 0,
            pendingReviewsCount: pendingReviewsCount || 0,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 2. ACTION: GET-USERS
    // =========================================================================
    if (action === 'get-users') {
      const { profileStatus, search, limit = 50 } = body;
      let query = supabaseAdmin.from('users').select('*').neq('role', 'admin').order('created_at', { ascending: false }).limit(limit);

      if (profileStatus && profileStatus !== 'ALL') {
        query = query.eq('profile_status', profileStatus);
      }
      if (search && search.trim()) {
        const s = `%${search.trim()}%`;
        query = query.or(`name.ilike.${s},email.ilike.${s}`);
      }

      const { data: users, error } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          users: (users || []).map(sanitizeUser),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 3. ACTION: REVIEW-USER-PROFILE
    // =========================================================================
    if (action === 'review-user-profile') {
      const { userId, status, notes, adminId } = body;
      if (!userId || !status) {
        return new Response(
          JSON.stringify({ error: 'userId and status are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const matchingStatus = status === 'APPROVED' ? 'IN_POOL' : 'NOT_ELIGIBLE';

      const updatePayload: Record<string, any> = {
        profile_status: status,
        matching_status: matchingStatus,
        admin_notes: notes || null,
        rejection_reason: status === 'REJECTED' ? (notes || 'Profile requires revision.') : null,
        reviewed_at: new Date().toISOString(),
      };

      const { data: updatedUser, error } = await supabaseAdmin
        .from('users')
        .update(updatePayload)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Sync matching pool entries
      if (status === 'APPROVED') {
        try {
          await supabaseAdmin
            .from('matching_pool_entries')
            .upsert({
              user_id: userId,
              status: 'ACTIVE',
              readiness_score: updatedUser.readiness_score || 82,
              entry_path: updatedUser.entry_path || 'MATCHING_POOL',
              entered_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        } catch (_poolErr) {
          // ignore if table does not exist
        }
      } else {
        try {
          await supabaseAdmin
            .from('matching_pool_entries')
            .delete()
            .eq('user_id', userId);
        } catch (_delErr) {
          // ignore
        }
      }

      // Safe audit log in profile_reviews
      try {
        await supabaseAdmin
          .from('profile_reviews')
          .insert([{
            user_id: userId,
            admin_id: adminId || null,
            action: status,
            reason: notes || null,
            new_status: status,
          }]);
      } catch (_logErr) {
        // ignore
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `User profile ${status.toLowerCase()} successfully.`,
          user: sanitizeUser(updatedUser),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 4. ACTION: GET-PODS
    // =========================================================================
    if (action === 'get-pods') {
      const { status } = body;
      let query = supabaseAdmin.from('pods').select(`*, members:pod_members(*, user:users(id, name, email, avatar_url))`).order('created_at', { ascending: false });

      if (status && status !== 'ALL') {
        query = query.eq('status', status);
      }

      const { data: pods, error } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, pods: pods || [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 5. ACTION: REVIEW-POD
    // =========================================================================
    if (action === 'review-pod') {
      const { podId, status } = body;
      if (!podId || !status) {
        return new Response(
          JSON.stringify({ error: 'podId and status are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (status === 'DELETED' || status === 'DISSOLVED') {
        // Reset members matching_status
        const { data: members } = await supabaseAdmin
          .from('pod_members')
          .select('user_id')
          .eq('pod_id', podId);

        const memberIds = (members || []).map((m: any) => m.user_id).filter(Boolean);
        if (memberIds.length > 0) {
          await supabaseAdmin
            .from('users')
            .update({ matching_status: 'IN_POOL' })
            .in('id', memberIds);
        }

        await supabaseAdmin
          .from('pod_members')
          .delete()
          .eq('pod_id', podId);

        const { error: delErr } = await supabaseAdmin
          .from('pods')
          .delete()
          .eq('id', podId);

        if (delErr) {
          await supabaseAdmin
            .from('pods')
            .update({
              status: 'DISSOLVED',
              updated_at: new Date().toISOString(),
            })
            .eq('id', podId);
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Pod dissolved successfully.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const podUpdates: any = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (body.reason || body.rejectionReason) {
        podUpdates.rejection_reason = body.reason || body.rejectionReason;
      }

      const { data: updatedPod, error } = await supabaseAdmin
        .from('pods')
        .update(podUpdates)
        .eq('id', podId)
        .select()
        .single();

      if (error) throw error;

      // When pod is approved (ACTIVE), activate all members and unlock Commons
      if (status === 'ACTIVE') {
        const { data: members } = await supabaseAdmin
          .from('pod_members')
          .select('user_id')
          .eq('pod_id', podId);

        const memberIds = (members || []).map((m: any) => m.user_id).filter(Boolean);

        await supabaseAdmin
          .from('pod_members')
          .update({ membership_status: 'ACCEPTED' })
          .eq('pod_id', podId);

        if (memberIds.length > 0) {
          await supabaseAdmin
            .from('users')
            .update({
              matching_status: 'POD_ASSIGNED',
              onboarding_status: 'COMPLETED',
              profile_status: 'APPROVED',
              user_onboarded: true,
            })
            .in('id', memberIds);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: `Pod status updated to ${status}.`, pod: updatedPod }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 6. ACTION: RUN-MATCHING-ENGINE
    // =========================================================================
    if (action === 'run-matching-engine') {
      const { adminId } = body;

      // 1. Fetch active pod members to exclude already assigned users
      const { data: existingMembers } = await supabaseAdmin
        .from('pod_members')
        .select('user_id, pod:pods(status)')
        .neq('membership_status', 'DECLINED');

      const busyUserIds = new Set(
        (existingMembers || [])
          .filter((m: any) => m.pod && ['ACTIVE', 'CREATING', 'UNDER_REVIEW', 'PENDING_REVIEW'].includes(m.pod.status))
          .map((m: any) => m.user_id)
      );

      // 2. Fetch candidates in matching pool with approved profiles
      const { data: candidates, error: cErr } = await supabaseAdmin
        .from('users')
        .select('*')
        .neq('role', 'admin')
        .eq('entry_path', 'MATCHING_POOL')
        .eq('profile_status', 'APPROVED');

      if (cErr) throw cErr;

      const eligibleCandidates = (candidates || []).filter((u: any) => !busyUserIds.has(u.id));

      if (eligibleCandidates.length < 2) {
        return new Response(
          JSON.stringify({
            success: true,
            podsCreated: 0,
            matchedCount: 0,
            message: `Not enough unassigned candidates in matching pool (found ${eligibleCandidates.length}, minimum 2 required).`,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 3. Group candidates into 2–4 member Pod proposals
      const cityGroups: Record<string, any[]> = {};
      for (const u of eligibleCandidates) {
        const cityKey = (u.location_city || 'General Area').split(',')[0].trim().toLowerCase();
        if (!cityGroups[cityKey]) cityGroups[cityKey] = [];
        cityGroups[cityKey].push(u);
      }

      let podsCreatedCount = 0;
      let matchedUsersCount = 0;
      const createdPods = [];

      for (const [cityKey, group] of Object.entries(cityGroups)) {
        if (group.length < 2) continue;

        for (let i = 0; i < group.length; i += 4) {
          const chunk = group.slice(i, i + 4);
          if (chunk.length < 2) break;

          const primaryUser = chunk[0];
          const cityName = primaryUser.location_city ? primaryUser.location_city.split(',')[0] : 'Community';
          const podName = `${cityName} Commons Pod ${Math.floor(100 + Math.random() * 900)}`;

          // Attempt insertion with status 'UNDER_REVIEW', with graceful fallback
          let insertedPod = null;
          const statusCandidates = ['UNDER_REVIEW', 'CREATING', 'PENDING_REVIEW', 'ACTIVE'];

          for (const statusOption of statusCandidates) {
            const podPayload = {
              name: podName,
              description: `Algorithmic match formed by BOMA Matching Engine for ${chunk.length} compatible members ||| [0,1]`,
              group_type: 'Matching Pool',
              created_by: primaryUser.id,
              status: statusOption,
            };

            const { data, error } = await supabaseAdmin
              .from('pods')
              .insert(podPayload)
              .select()
              .single();

            if (!error && data) {
              insertedPod = data;
              break;
            } else {
              console.warn(`Pod insert with status ${statusOption} failed:`, error?.message);
            }
          }

          if (!insertedPod) {
            throw new Error('Failed to insert pod with any valid status check constraint.');
          }

          // Insert member rows (All matched users are normal members; matching engine pods have no creator)
          const memberRows = chunk.map((u: any) => ({
            pod_id: insertedPod.id,
            user_id: u.id,
            role: 'MEMBER',
            membership_status: 'PENDING',
          }));

          const { error: memErr } = await supabaseAdmin
            .from('pod_members')
            .insert(memberRows);

          if (memErr) {
            console.warn('Member insertion warning:', memErr.message);
          }

          // Update users' matching_status
          const userIds = chunk.map((u: any) => u.id);
          await supabaseAdmin
            .from('users')
            .update({ matching_status: 'MATCHED' })
            .in('id', userIds);

          podsCreatedCount++;
          matchedUsersCount += chunk.length;
          createdPods.push(insertedPod);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          podsCreated: podsCreatedCount,
          matchedCount: matchedUsersCount,
          pods: createdPods,
          message: `Successfully formed ${podsCreatedCount} pod match proposal(s) with ${matchedUsersCount} members.`,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // ACTION: LOGOUT
    // =========================================================================
    if (action === 'logout') {
      return new Response(
        JSON.stringify({ success: true, message: 'Logged out successfully.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action "${action}"` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
