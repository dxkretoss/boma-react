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
      const { count: waitlistCount } = await supabaseAdmin.from('waitlist_submissions').select('*', { count: 'exact', head: true }).catch(() => ({ count: 0 }));
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
      const { userId, status, notes } = body;
      if (!userId || !status) {
        return new Response(
          JSON.stringify({ error: 'userId and status are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const matchingStatus = status === 'APPROVED' ? 'IN_POOL' : 'NOT_ELIGIBLE';

      const { data: updatedUser, error } = await supabaseAdmin
        .from('users')
        .update({
          profile_status: status,
          matching_status: matchingStatus,
          admin_notes: notes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

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

      const { data: updatedPod, error } = await supabaseAdmin
        .from('pods')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', podId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: `Pod status updated to ${status}.`, pod: updatedPod }),
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
