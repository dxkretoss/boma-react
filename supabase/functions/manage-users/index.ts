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
    // 1. ACTION: GET-PROFILE
    // =========================================================================
    if (action === 'get-profile') {
      const { userId, email } = body;
      let query = supabaseAdmin.from('users').select('*');
      if (userId) query = query.eq('id', userId);
      else if (email) query = query.eq('email', email.toLowerCase().trim());
      else {
        return new Response(
          JSON.stringify({ error: 'userId or email is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: user, error } = await query.maybeSingle();
      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, user: sanitizeUser(user) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 2. ACTION: UPDATE-PROFILE
    // =========================================================================
    if (action === 'update-profile') {
      const { userId, updates } = body;
      if (!userId || !updates) {
        return new Response(
          JSON.stringify({ error: 'userId and updates object are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Filter out sensitive fields
      const { password, id, role, ...safeUpdates } = updates;

      const { data: updatedUser, error } = await supabaseAdmin
        .from('users')
        .update(safeUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: 'Profile updated successfully.', user: sanitizeUser(updatedUser) }),
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
