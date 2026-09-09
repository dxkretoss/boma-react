import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import nodemailer from "npm:nodemailer@6.9.1";
import bcrypt from "npm:bcryptjs@2.4.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to hash password securely
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Helper to verify plaintext password against stored hash (with legacy fallback & auto-upgrade support)
async function verifyPassword(plainPassword: string, storedHashOrPlain: string): Promise<boolean> {
  if (!plainPassword || !storedHashOrPlain) return false;
  // If stored value is a bcrypt hash
  if (storedHashOrPlain.startsWith('$2a$') || storedHashOrPlain.startsWith('$2b$') || storedHashOrPlain.startsWith('$2y$')) {
    try {
      return await bcrypt.compare(plainPassword, storedHashOrPlain);
    } catch {
      return false;
    }
  }
  // Backward compatibility fallback for legacy plaintext entries
  return plainPassword === storedHashOrPlain;
}

// Helper to sanitize user object by returning all safe session fields
function sanitizeUser(user: any) {
  if (!user) return null;
  const { password, verification_code, ...safeUser } = user;
  return safeUser;
}

// Helper to send emails via SMTP
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const host = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
  const port = Number(Deno.env.get('SMTP_PORT') || '587');
  const user = Deno.env.get('SMTP_USER');
  const pass = Deno.env.get('SMTP_PASS');
  const from = Deno.env.get('SMTP_FROM') || user;

  if (!user || !pass) {
    console.warn('SMTP credentials not configured in Edge Function environment variables. Skipping email dispatch.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: `"BOMA" <${from}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}

function getEmailTemplate(type: string, email: string, code: string, podName?: string, inviterName?: string, inviteUrl?: string) {
  if (type === 'invitation') {
    return {
      subject: `You've Been Invited to Join a BOMA Pod`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 24px; border: 1px solid #D7E2EE; border-radius: 16px;">
          <h2 style="color: #0E4C8C; margin-top: 0; font-size: 20px;">You've Been Invited to Join a BOMA Pod</h2>
          <p style="color: #2F5FE0; font-weight: bold; font-size: 16px; margin: 8px 0;">${podName || 'A Pod'}</p>
          <p style="color: #5B6B82; font-size: 14px; line-height: 1.6;">
            <strong>${inviterName || 'A neighbor'}</strong> has invited you to join their existing BOMA Pod.
          </p>
          <p style="color: #5B6B82; font-size: 14px; line-height: 1.6;">
            BOMA helps groups organize their community journey before moving into The Commons.
          </p>
          <a href="${inviteUrl || '#'}" style="display: inline-block; background: #2F5FE0; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin: 20px 0;">Accept Invitation</a>
          <p style="color: #5B6B82; font-size: 12px; margin-top: 24px;">If you did not request this or do not wish to join, you can safely ignore this email.</p>
        </div>
      `,
    };
  }

  if (type === 'reset') {
    return {
      subject: 'Reset your BOMA password',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 24px; border: 1px solid #D7E2EE; border-radius: 16px;">
          <h2 style="color: #0E4C8C; margin-top: 0;">Reset your password</h2>
          <p style="color: #5B6B82; font-size: 14px; line-height: 1.6;">Use the following verification code or click the button below to reset your BOMA password:</p>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #0E4C8C; background: #E1EBF7; padding: 12px 24px; border-radius: 8px; width: fit-content; margin: 20px 0;">${code}</div>
          <p style="color: #5B6B82; font-size: 12px; margin-top: 24px;">If you did not request this password reset, you can safely ignore this email.</p>
        </div>
      `,
    };
  }

  // Default: verification code
  return {
    subject: 'Verify your BOMA email address',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; padding: 24px; border: 1px solid #D7E2EE; border-radius: 16px;">
        <h2 style="color: #0E4C8C; margin-top: 0;">Welcome to BOMA!</h2>
        <p style="color: #5B6B82; font-size: 14px; line-height: 1.6;">Please use the following 6-digit code to verify your email address and continue:</p>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #0E4C8C; background: #E1EBF7; padding: 12px 24px; border-radius: 8px; width: fit-content; margin: 20px 0;">${code}</div>
        <p style="color: #5B6B82; font-size: 12px; margin-top: 24px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  };
}

serve(async (req) => {
  // 1. Handle CORS preflight
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

    // ==========================================
    // ACTION: REGISTER
    // ==========================================
    if (action === 'register') {
      const { email, password, name } = body;

      if (!email || !password || !name) {
        return new Response(
          JSON.stringify({ error: 'Email, password, and name are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const { data: existing, error: checkError } = await supabaseAdmin
        .from('users')
        .select('id, email_verified')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (checkError) throw checkError;

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedPassword = await hashPassword(password);

      let userResult;

      if (existing) {
        if (existing.email_verified) {
          return new Response(
            JSON.stringify({ error: 'Email already registered' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update existing unverified user with hashed password
        const { data, error } = await supabaseAdmin
          .from('users')
          .update({
            name,
            password: hashedPassword,
            verification_code: code,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        userResult = data;
      } else {
        // Insert new user with hashed password
        const { data, error } = await supabaseAdmin
          .from('users')
          .insert([
            {
              email: normalizedEmail,
              password: hashedPassword,
              name,
              role: 'user',
              user_onboarded: false,
              verification_code: code,
              email_verified: false,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        userResult = data;
      }

      // Send verification email
      const emailContent = getEmailTemplate('verification', normalizedEmail, code);
      try {
        await sendEmail({ to: normalizedEmail, ...emailContent });
      } catch (mailErr) {
        console.error('Failed to send verification email:', mailErr);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Registration successful.', user: sanitizeUser(userResult) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==========================================
    // ACTION: LOGIN
    // ==========================================
    if (action === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) throw error;

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const isMatch = await verifyPassword(password, user.password);

      if (!isMatch) {
        return new Response(
          JSON.stringify({ error: 'Incorrect password' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Auto-upgrade legacy plaintext password to secure bcrypt hash
      if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$') && !user.password.startsWith('$2y$')) {
        try {
          const newHashed = await hashPassword(password);
          await supabaseAdmin
            .from('users')
            .update({ password: newHashed })
            .eq('id', user.id);
        } catch (upgradeErr) {
          console.warn('Failed to auto-upgrade password hash:', upgradeErr);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Login successful.', user: sanitizeUser(user) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==========================================
    // ACTION: VERIFY-EMAIL
    // ==========================================
    if (action === 'verify-email') {
      const { email, code } = body;

      if (!email || !code) {
        return new Response(
          JSON.stringify({ error: 'Email and code are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) throw error;
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (user.verification_code !== String(code).trim()) {
        return new Response(
          JSON.stringify({ error: 'Incorrect verification code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ email_verified: true })
        .eq('email', normalizedEmail)
        .select()
        .single();

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, message: 'Email verified successfully.', user: sanitizeUser(updatedUser || { ...user, email_verified: true }) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==========================================
    // ACTION: RESEND-VERIFICATION
    // ==========================================
    if (action === 'resend-verification') {
      const { email } = body;

      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Email is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ verification_code: code })
        .eq('email', normalizedEmail)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const emailContent = getEmailTemplate('verification', normalizedEmail, code);
      try {
        await sendEmail({ to: normalizedEmail, ...emailContent });
      } catch (mailErr) {
        console.error('Failed to send verification email:', mailErr);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==========================================
    // ACTION: REQUEST-PASSWORD-RESET
    // ==========================================
    if (action === 'request-password-reset') {
      const { email } = body;

      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Email is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ verification_code: code })
        .eq('email', normalizedEmail);

      if (updateError) throw updateError;

      const emailContent = getEmailTemplate('reset', normalizedEmail, code);
      try {
        await sendEmail({ to: normalizedEmail, ...emailContent });
      } catch (mailErr) {
        console.error('Failed to send reset email:', mailErr);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==========================================
    // ACTION: RESET-PASSWORD
    // ==========================================
    if (action === 'reset-password') {
      const { email, token, newPassword } = body;

      if (!email || !token || !newPassword) {
        return new Response(
          JSON.stringify({ error: 'Email, reset token, and new password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) throw error;
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!user.verification_code || user.verification_code !== String(token).trim()) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired reset link/code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const hashedPassword = await hashPassword(newPassword);

      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          password: hashedPassword,
          verification_code: null,
        })
        .eq('email', normalizedEmail);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==========================================
    // ACTION: UPDATE-ONBOARDING
    // ==========================================
    if (action === 'update-onboarding') {
      const { userId, onboardingData } = body;

      if (!userId || !onboardingData) {
        return new Response(
          JSON.stringify({ error: 'userId and onboardingData are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          user_onboarded: true,
          age_group: onboardingData.ageGroup,
          selected_lifestyles: onboardingData.selectedLifestyles,
          decision_style: onboardingData.decisionStyle,
          pod_size: onboardingData.podSize,
          location_city: onboardingData.locationCity,
          location_radius: onboardingData.locationRadius,
          setting_preference: onboardingData.settingPreference,
          budget_range: onboardingData.budgetRange,
          down_payment_tier: onboardingData.downPaymentTier,
          financing_preference: onboardingData.financingPreference,
          housing_intent: onboardingData.housingIntent,
          commitment_timeline: onboardingData.commitmentTimeline,
          readiness_score: onboardingData.readinessScore || 82,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: 'Onboarding updated successfully.', user: sanitizeUser(data) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==========================================
    // UNKNOWN ACTION
    // ==========================================
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
