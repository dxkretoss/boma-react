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

function parseDescription(pod: any) {
  if (!pod) return null;
  const desc = pod.description || '';
  const parts = desc.split(' ||| ');
  let cleanDesc = desc;
  let aligned = [0, 1];
  if (parts.length >= 2) {
    cleanDesc = parts[0];
    try {
      aligned = JSON.parse(parts[1]);
    } catch {
      // fallback
    }
  }
  return {
    ...pod,
    description: cleanDesc,
    aligned_agreements: aligned,
  };
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
    // 1. ACTION: GET-POD
    // =========================================================================
    if (action === 'get-pod') {
      const { podId, userId } = body;

      let targetPodId = podId;
      if (!targetPodId && userId) {
        const { data: member } = await supabaseAdmin
          .from('pod_members')
          .select('pod_id')
          .eq('user_id', userId)
          .eq('membership_status', 'ACCEPTED')
          .maybeSingle();

        targetPodId = member?.pod_id;
      }

      if (!targetPodId) {
        return new Response(
          JSON.stringify({ success: true, pod: null, members: [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: pod, error: podError } = await supabaseAdmin
        .from('pods')
        .select('*')
        .eq('id', targetPodId)
        .single();

      if (podError) throw podError;

      const { data: members, error: memError } = await supabaseAdmin
        .from('pod_members')
        .select(`*, user:users(*)`)
        .eq('pod_id', targetPodId);

      if (memError) throw memError;

      return new Response(
        JSON.stringify({
          success: true,
          pod: parseDescription(pod),
          members: (members || []).map((m: any) => ({
            id: m.id,
            role: m.role,
            membership_status: m.membership_status,
            joined_at: m.joined_at,
            user: sanitizeUser(m.user),
          })),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 2. ACTION: GET-USER-PODS
    // =========================================================================
    if (action === 'get-user-pods') {
      const { userId } = body;
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: memberships, error } = await supabaseAdmin
        .from('pod_members')
        .select(`*, pod:pods(*)`)
        .eq('user_id', userId);

      if (error) throw error;

      const pods = (memberships || [])
        .map((m: any) => ({
          membership: { id: m.id, role: m.role, status: m.membership_status },
          pod: parseDescription(m.pod),
        }))
        .filter((item: any) => item.pod);

      return new Response(
        JSON.stringify({ success: true, pods }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 3. ACTION: UPDATE-AGREEMENTS
    // =========================================================================
    if (action === 'update-agreements') {
      const { podId, currentDescription, alignedArray } = body;
      if (!podId) {
        return new Response(
          JSON.stringify({ error: 'podId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const cleanDesc = (currentDescription || '').split(' ||| ')[0];
      const payload = `${cleanDesc} ||| ${JSON.stringify(alignedArray || [0, 1])}`;

      const { data: updatedPod, error } = await supabaseAdmin
        .from('pods')
        .update({
          description: payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', podId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, pod: parseDescription(updatedPod) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 4. ACTION: GET-MESSAGES
    // =========================================================================
    if (action === 'get-messages') {
      const { podId, limit = 50 } = body;
      if (!podId) {
        return new Response(
          JSON.stringify({ error: 'podId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: messages, error } = await supabaseAdmin
        .from('pod_chat_messages')
        .select(`*, user:users(id, name, avatar_url)`)
        .eq('pod_id', podId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          messages: (messages || []).map((msg: any) => ({
            id: msg.id,
            pod_id: msg.pod_id,
            user_id: msg.user_id,
            sender_name: msg.user?.name || msg.sender_name || 'Neighbor',
            sender_avatar: msg.user?.avatar_url || null,
            message: msg.message,
            created_at: msg.created_at,
          })),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 5. ACTION: SEND-MESSAGE
    // =========================================================================
    if (action === 'send-message') {
      const { podId, userId, message } = body;
      if (!podId || !userId || !message) {
        return new Response(
          JSON.stringify({ error: 'podId, userId, and message are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: user } = await supabaseAdmin.from('users').select('name, avatar_url').eq('id', userId).single();

      const { data: newMsg, error } = await supabaseAdmin
        .from('pod_chat_messages')
        .insert({
          pod_id: podId,
          user_id: userId,
          sender_name: user?.name || 'Neighbor',
          message: message.trim(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          message: {
            ...newMsg,
            sender_name: user?.name || 'Neighbor',
            sender_avatar: user?.avatar_url || null,
          },
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 6. ACTION: ACCEPT-PROPOSAL
    // =========================================================================
    if (action === 'accept-proposal') {
      const { podId, userId } = body;
      if (!podId || !userId) {
        return new Response(
          JSON.stringify({ error: 'podId and userId are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: member, error } = await supabaseAdmin
        .from('pod_members')
        .update({
          membership_status: 'ACCEPTED',
          joined_at: new Date().toISOString(),
        })
        .eq('pod_id', podId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      await supabaseAdmin
        .from('users')
        .update({ matching_status: 'MATCHED' })
        .eq('id', userId);

      return new Response(
        JSON.stringify({ success: true, message: 'Pod match proposal accepted.', member }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 7. ACTION: DECLINE-PROPOSAL
    // =========================================================================
    if (action === 'decline-proposal') {
      const { podId, userId } = body;
      if (!podId || !userId) {
        return new Response(
          JSON.stringify({ error: 'podId and userId are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabaseAdmin
        .from('pod_members')
        .delete()
        .eq('pod_id', podId)
        .eq('user_id', userId);

      await supabaseAdmin
        .from('users')
        .update({ matching_status: 'IN_POOL' })
        .eq('id', userId);

      return new Response(
        JSON.stringify({ success: true, message: 'Returned to matching pool.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 8. ACTION: LEAVE-POD
    // =========================================================================
    if (action === 'leave-pod') {
      const { podId, userId } = body;
      if (!podId || !userId) {
        return new Response(
          JSON.stringify({ error: 'podId and userId are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabaseAdmin
        .from('pod_members')
        .delete()
        .eq('pod_id', podId)
        .eq('user_id', userId);

      await supabaseAdmin
        .from('users')
        .update({ matching_status: 'IN_POOL' })
        .eq('id', userId);

      return new Response(
        JSON.stringify({ success: true, message: 'Successfully left Pod.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 9. ACTION: JOIN-BY-TOKEN
    // =========================================================================
    if (action === 'join-by-token') {
      const { token, userId } = body;
      if (!token || !userId) {
        return new Response(
          JSON.stringify({ error: 'token and userId are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: inv, error: invErr } = await supabaseAdmin
        .from('pod_invitations')
        .select('*')
        .eq('token_hash', token)
        .eq('status', 'PENDING')
        .maybeSingle();

      if (invErr) throw invErr;
      if (!inv) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired invitation token' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Add user to Pod Members
      const { data: member, error: memErr } = await supabaseAdmin
        .from('pod_members')
        .insert({
          pod_id: inv.pod_id,
          user_id: userId,
          role: 'MEMBER',
          membership_status: 'ACCEPTED',
          joined_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (memErr) throw memErr;

      // Mark invitation accepted
      await supabaseAdmin
        .from('pod_invitations')
        .update({ status: 'ACCEPTED', accepted_at: new Date().toISOString() })
        .eq('id', inv.id);

      return new Response(
        JSON.stringify({ success: true, message: 'Joined Pod successfully.', pod_id: inv.pod_id, member }),
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
