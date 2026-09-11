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

    // =========================================================================
    // 3. ACTION: UPLOAD-AVATAR (Base64 direct upload for Mobile & REST API)
    // =========================================================================
    if (action === 'upload-avatar') {
      const { userId, base64Image, fileExt = 'jpg' } = body;
      if (!userId || !base64Image) {
        return new Response(
          JSON.stringify({ error: 'userId and base64Image are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse base64 header if present (e.g. data:image/jpeg;base64,...)
      let cleanBase64 = base64Image;
      let contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
      if (base64Image.includes(';base64,')) {
        const parts = base64Image.split(';base64,');
        const matchMime = parts[0].match(/data:(.*)/);
        if (matchMime) contentType = matchMime[1];
        cleanBase64 = parts[1];
      }

      // Decode base64 to binary Uint8Array
      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      // Ensure 'avatars' storage bucket exists and is public
      try {
        const { data: bucketData, error: getBucketError } = await supabaseAdmin.storage.getBucket('avatars');
        if (getBucketError || !bucketData) {
          await supabaseAdmin.storage.createBucket('avatars', {
            public: true,
            fileSizeLimit: 10485760,
          });
        } else if (!bucketData.public) {
          await supabaseAdmin.storage.updateBucket('avatars', {
            public: true,
          });
        }
      } catch (bucketErr) {
        console.warn('Bucket ensure error:', bucketErr);
      }

      // Upload to 'avatars' storage bucket
      const { error: uploadError } = await supabaseAdmin.storage
        .from('avatars')
        .upload(filePath, bytes, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Avatar storage upload failed: ${uploadError.message}`);
      }

      // Generate public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData?.publicUrl;

      // Update user record with the new avatar_url
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Avatar uploaded and profile updated successfully.',
          avatarUrl,
          user: sanitizeUser(updatedUser),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 4. ACTION: DELETE-ACCOUNT (Mobile compliance & Account deletion)
    // =========================================================================
    if (action === 'delete-account') {
      const { userId, confirmationText } = body;
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 1. Check user exists
      const { data: existingUser, error: userFetchError } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('id', userId)
        .maybeSingle();

      if (userFetchError || !existingUser) {
        return new Response(
          JSON.stringify({ error: 'User not found or already deleted.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 2. Cascade delete dependent tables
      try {
        await supabaseAdmin.from('pod_members').delete().eq('user_id', userId);
      } catch (e) {
        console.warn('pod_members delete cleanup note:', e);
      }

      try {
        await supabaseAdmin.from('onboarding_responses').delete().eq('user_id', userId);
      } catch (e) {
        console.warn('onboarding_responses delete cleanup note:', e);
      }

      try {
        await supabaseAdmin.from('readiness_scores').delete().eq('user_id', userId);
      } catch (e) {
        console.warn('readiness_scores delete cleanup note:', e);
      }

      // 3. Delete user row from custom 'users' table
      const { error: deleteError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;

      // 4. Attempt to delete from Supabase Auth auth.users if exists
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (authDeleteErr) {
        console.warn('Supabase auth.users delete notice:', authDeleteErr);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Account and associated profile data deleted successfully.',
          deletedUserId: userId,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 5. ACTION: LOGOUT
    // =========================================================================
    if (action === 'logout') {
      const { userId } = body;
      return new Response(
        JSON.stringify({ success: true, message: 'User logged out successfully.', userId: userId || null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 6. ACTION: ENSURE-STORAGE-BUCKET
    // =========================================================================
    if (action === 'ensure-storage-bucket') {
      const { data: bucketData, error: getBucketError } = await supabaseAdmin.storage.getBucket('avatars');
      let result = 'unchanged';
      if (getBucketError || !bucketData) {
        const { error: createErr } = await supabaseAdmin.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 10485760,
        });
        if (createErr) throw createErr;
        result = 'created';
      } else if (!bucketData.public) {
        const { error: updateErr } = await supabaseAdmin.storage.updateBucket('avatars', {
          public: true,
        });
        if (updateErr) throw updateErr;
        result = 'updated_to_public';
      }
      return new Response(
        JSON.stringify({ success: true, message: `Storage bucket 'avatars' is public.`, result }),
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
