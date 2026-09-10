import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function calculateMatchScore(u1: any, u2: any) {
  let score = 0;
  if (u1.location_city && u2.location_city && u1.location_city.toLowerCase().trim() === u2.location_city.toLowerCase().trim()) {
    score += 30;
  }
  if (u1.setting_preference && u2.setting_preference && u1.setting_preference.toLowerCase().trim() === u2.setting_preference.toLowerCase().trim()) {
    score += 30;
  }
  if (u1.commitment_timeline && u2.commitment_timeline && u1.commitment_timeline === u2.commitment_timeline) {
    score += 20;
  }
  if (u1.housing_intent && u2.housing_intent && u1.housing_intent === u2.housing_intent) {
    score += 20;
  } else {
    score += 10;
  }
  return score;
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
    // 1. ACTION: FIND-MATCHES (Suggest Pod & Neighbors)
    // =========================================================================
    if (action === 'find-matches') {
      const { userId } = body;
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: currentUser, error: uErr } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (uErr) throw uErr;

      const { data: candidates, error: cErr } = await supabaseAdmin
        .from('users')
        .select('*')
        .neq('id', userId)
        .neq('role', 'admin')
        .eq('entry_path', 'MATCHING_POOL')
        .eq('profile_status', 'APPROVED');

      if (cErr) throw cErr;

      const scored = (candidates || []).map((c: any) => ({
        user: {
          id: c.id,
          name: c.name,
          email: c.email,
          location_city: c.location_city,
          setting_preference: c.setting_preference,
          selected_lifestyles: c.selected_lifestyles,
          readiness_score: c.readiness_score || 82,
        },
        score: calculateMatchScore(currentUser, c),
      })).sort((a: any, b: any) => b.score - a.score);

      const topMatches = scored.slice(0, 3);
      const avgMatchPct = topMatches.length > 0
        ? Math.round(topMatches.reduce((acc: number, m: any) => acc + m.score, 0) / topMatches.length)
        : 85;

      const cityBase = currentUser.location_city ? currentUser.location_city.split(',')[0] : 'Austin';

      const suggestedPod = {
        name: `${cityBase} Commons Pod`,
        location: currentUser.location_city || 'Austin, TX',
        formed: 'Recently',
        matchPct: avgMatchPct,
        health: 'Stable',
        tags: [
          currentUser.location_city || 'Austin, TX',
          currentUser.setting_preference || 'Suburban',
          ...(currentUser.selected_lifestyles || []).slice(0, 2),
        ],
        members: topMatches.map((m: any) => ({
          id: m.user.id,
          name: m.user.name,
          score: m.user.readiness_score,
          matchPct: m.score,
        })),
      };

      return new Response(
        JSON.stringify({
          success: true,
          suggestedPod,
          candidates: topMatches,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 2. ACTION: GET-MATCHING-WEIGHTS
    // =========================================================================
    if (action === 'get-matching-weights') {
      const { data: weights, error } = await supabaseAdmin
        .from('matching_algorithm_weights')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, weights: weights || [] }),
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
