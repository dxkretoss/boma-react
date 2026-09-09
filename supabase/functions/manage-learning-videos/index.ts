import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase environment variables are not configured in edge function environment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const url = new URL(req.url);

    // 1. GET: Fetch learning videos
    if (req.method === 'GET') {
      const includeUnpublished = url.searchParams.get('all') === 'true';
      let query = supabase
        .from('learning_videos')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (!includeUnpublished) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, videos: data || [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. POST: Create a new learning video
    if (req.method === 'POST') {
      const body = await req.json();
      const { title, description, video_url, thumbnail_url, tag, order_index, is_published } = body;

      if (!title || !description || !video_url || !thumbnail_url) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: title, description, video_url, thumbnail_url' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('learning_videos')
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            video_url: video_url.trim(),
            thumbnail_url: thumbnail_url.trim(),
            tag: tag ? tag.trim() : 'Getting Started',
            order_index: typeof order_index === 'number' ? order_index : 0,
            is_published: is_published !== undefined ? Boolean(is_published) : true,
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, video: data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. PUT / PATCH: Update an existing learning video
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = await req.json();
      const { id, title, description, video_url, thumbnail_url, tag, order_index, is_published } = body;

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Missing video ID for update' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      if (title !== undefined) updatePayload.title = title.trim();
      if (description !== undefined) updatePayload.description = description.trim();
      if (video_url !== undefined) updatePayload.video_url = video_url.trim();
      if (thumbnail_url !== undefined) updatePayload.thumbnail_url = thumbnail_url.trim();
      if (tag !== undefined) updatePayload.tag = tag.trim();
      if (order_index !== undefined) updatePayload.order_index = Number(order_index);
      if (is_published !== undefined) updatePayload.is_published = Boolean(is_published);

      const { data, error } = await supabase
        .from('learning_videos')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, video: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. DELETE: Delete a learning video
    if (req.method === 'DELETE') {
      const body = await req.json().catch(() => ({}));
      const id = url.searchParams.get('id') || body.id;

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Missing video ID for deletion' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('learning_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: 'Video deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Method ${req.method} not allowed` }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
