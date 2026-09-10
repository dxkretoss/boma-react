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
  const brandHeader = `
    <!-- Brand Header -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-bottom: 1px solid #EFEAE3; padding-bottom: 20px; margin-bottom: 24px;">
      <tr>
        <td style="vertical-align: middle;">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align: middle;">
                <div style="background-color: #2E2330; width: 40px; height: 40px; border-radius: 10px; text-align: center; line-height: 40px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 800; color: #F7F5F0;">
                  B
                </div>
              </td>
              <td style="padding-left: 12px; vertical-align: middle;">
                <div style="font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 800; color: #2E2330; letter-spacing: 2px; line-height: 1;">
                  BOMA
                </div>
                <div style="font-family: 'IBM Plex Mono', 'JetBrains Mono', monospace; font-size: 9.5px; font-weight: 700; color: #C46A4A; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px;">
                  Community Matching & Co-Living
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const emailWrapper = (contentHtml: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BOMA</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F7F5F0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7F5F0; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #E5DDD2; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(46, 35, 48, 0.08);">
              <!-- Top Terracotta Accent Bar -->
              <tr>
                <td height="5" style="background-color: #C46A4A; font-size: 0; line-height: 0;">&nbsp;</td>
              </tr>
              <!-- Inner Content -->
              <tr>
                <td style="padding: 32px 36px 36px 36px; text-align: left;">
                  ${brandHeader}
                  ${contentHtml}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #FAF8F5; padding: 22px 36px; border-top: 1px solid #E5DDD2; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-family: 'Inter', -apple-system, sans-serif; font-size: 12px; font-weight: 600; color: #2E2330;">
                    BOMA — Finding neighbors who actually fit.
                  </p>
                  <p style="margin: 0; font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; color: #7A746B; line-height: 1.4;">
                    Lifestyle Matching · Pod Formations · Co-Living Agreements
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (type === 'invitation') {
    return {
      subject: `You've Been Invited to Join a BOMA Pod`,
      html: emailWrapper(`
        <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 700; color: #2E2330; margin: 0 0 12px 0;">
          You've Been Invited to Join a Pod
        </h2>
        <div style="background-color: #F7EDE7; border: 1px solid #EAD8CE; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px;">
          <span style="font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; color: #C46A4A; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">POD INVITATION</span>
          <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 700; color: #2E2330;">${podName || 'A BOMA Pod'}</span>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #5C544E; margin: 0 0 16px 0;">
          <strong style="color: #2E2330;">${inviterName || 'A neighbor'}</strong> has invited you to join their existing Pod on BOMA.
        </p>
        <p style="font-size: 13.5px; line-height: 1.6; color: #7A746B; margin: 0 0 24px 0;">
          BOMA helps groups align on lifestyle preferences, shared governance, and co-living agreements before taking the next step into The Commons.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${inviteUrl || '#'}" style="background-color: #C46A4A; color: #FFFFFF; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; padding: 13px 32px; border-radius: 9999px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(196, 106, 74, 0.25);">
            Accept Pod Invitation
          </a>
        </div>
        <p style="font-size: 11.5px; color: #9C968E; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #F2ECE4; padding-top: 16px;">
          If you did not request this or do not wish to join, you can safely ignore this email.
        </p>
      `),
    };
  }

  if (type === 'reset') {
    return {
      subject: 'Reset your BOMA password',
      html: emailWrapper(`
        <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 700; color: #2E2330; margin: 0 0 12px 0;">
          Reset your password
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: #5C544E; margin: 0 0 20px 0;">
          We received a request to reset your BOMA password. Use the following 6-digit verification code to verify your identity and set a new password:
        </p>
        
        <!-- OTP Box -->
        <div style="text-align: center; margin: 24px 0;">
          <div style="background-color: #F7EDE7; border: 1px solid #EAD8CE; border-radius: 12px; padding: 16px 28px; display: inline-block;">
            <span style="font-family: 'IBM Plex Mono', 'JetBrains Mono', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #C46A4A;">
              ${code}
            </span>
          </div>
        </div>

        <p style="font-size: 13px; line-height: 1.5; color: #7A746B; margin: 0 0 16px 0; text-align: center;">
          This code will expire in 15 minutes.
        </p>
        <p style="font-size: 11.5px; color: #9C968E; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #F2ECE4; padding-top: 16px;">
          If you did not request a password reset, you can safely ignore this message. Your password will remain unchanged.
        </p>
      `),
    };
  }

  // Default: Registration email verification code
  return {
    subject: 'Verify your BOMA email address',
    html: emailWrapper(`
      <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 700; color: #2E2330; margin: 0 0 12px 0;">
        Welcome to BOMA
      </h2>
      <p style="font-size: 14px; line-height: 1.6; color: #5C544E; margin: 0 0 20px 0;">
        Please use the following 6-digit verification code to confirm your email address and continue setting up your profile:
      </p>

      <!-- OTP Box -->
      <div style="text-align: center; margin: 24px 0;">
        <div style="background-color: #F7EDE7; border: 1px solid #EAD8CE; border-radius: 12px; padding: 16px 28px; display: inline-block;">
          <span style="font-family: 'IBM Plex Mono', 'JetBrains Mono', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #C46A4A;">
            ${code}
          </span>
        </div>
      </div>

      <p style="font-size: 13px; line-height: 1.5; color: #7A746B; margin: 0 0 16px 0; text-align: center;">
        Enter this code in your browser to verify your account.
      </p>
      <p style="font-size: 11.5px; color: #9C968E; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #F2ECE4; padding-top: 16px;">
        If you did not create a BOMA account, you can safely ignore this email.
      </p>
    `),
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
    // ACTION: VERIFY-RESET-OTP
    // ==========================================
    if (action === 'verify-reset-otp') {
      const { email, token } = body;

      if (!email || !token) {
        return new Response(
          JSON.stringify({ error: 'Email and verification code are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, verification_code')
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
          JSON.stringify({ error: 'Invalid or expired verification code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Verification code verified successfully.' }),
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
