import { supabase } from './supabaseClient';

// Helper to send email via SMTP (SmtpJS relay)
export async function sendVerificationEmail(email, code) {
  const host = import.meta.env.VITE_SMTP_HOST;
  const port = import.meta.env.VITE_SMTP_PORT || '25';
  const username = import.meta.env.VITE_SMTP_USER;
  const password = import.meta.env.VITE_SMTP_PASS;
  const from = import.meta.env.VITE_SMTP_FROM || username;

  if (!host || !username || !password) {
    console.warn('SMTP credentials not configured in .env. Logging verification code to console:', code);
    return false;
  }

  const subject = "Verify your BOMA email address";
  const body = `
    <div style="font-family: sans-serif; max-width: 500px; padding: 24px; border: 1px solid #D7E2EE; border-radius: 16px;">
      <h2 style="color: #0E4C8C; margin-top: 0;">Welcome to BOMA!</h2>
      <p style="color: #5B6B82; font-size: 14px; line-height: 1.6;">Please use the following 6-digit code to verify your email address and continue to the Learning Hub:</p>
      <div style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #0E4C8C; background: #E1EBF7; padding: 12px 24px; border-radius: 8px; width: fit-content; margin: 20px 0;">${code}</div>
      <p style="color: #5B6B82; font-size: 12px; margin-top: 24px;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  const params = new URLSearchParams();
  params.append('Action', 'Send');
  params.append('host', host);
  params.append('port', port);
  params.append('username', username);
  params.append('password', password);
  params.append('to', email);
  params.append('from', from);
  params.append('subject', subject);
  params.append('body', body);

  const response = await fetch('https://smtpjs.com/v3/smtpjs.aspx', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const result = await response.text();
  if (result !== 'OK') {
    throw new Error(`Failed to send email: ${result}`);
  }
  return true;
}

// Custom register function
export async function customRegister(email, password, name) {
  // 1. Check if user already exists
  const { data: existing, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (checkError) throw checkError;
  if (existing) {
    throw new Error('User already exists');
  }

  // Generate random 6-digit numeric verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 2. Insert new user
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email: email.toLowerCase().trim(),
        password, // custom auth plain-text/custom format password
        name,
        role: 'user',
        user_onboarded: false,
        verification_code: code,
        email_verified: false
      }
    ])
    .select()
    .single();

  if (error) throw error;

  // 3. Send verification email via SMTP
  try {
    await sendVerificationEmail(email.toLowerCase().trim(), code);
  } catch (emailErr) {
    console.error('SMTP email send error:', emailErr);
  }

  return data;
}

// Resend verification code
export async function customResendVerification(email) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  const { data, error } = await supabase
    .from('users')
    .update({ verification_code: code })
    .eq('email', email.toLowerCase().trim())
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('User not found');

  await sendVerificationEmail(email.toLowerCase().trim(), code);
  return true;
}

// Verify verification code
export async function customVerifyEmail(email, code) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('User not found');

  if (data.verification_code !== code) {
    throw new Error('Incorrect verification code');
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ email_verified: true })
    .eq('email', email.toLowerCase().trim());

  if (updateError) throw updateError;
  return data;
}

// Custom login function
export async function customLogin(email, password) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('User not found');
  }

  if (data.password !== password) {
    throw new Error('Incorrect password');
  }

  return data;
}

// Update onboarding state
export async function updateOnboarding(userId, onboardingData) {
  const { data, error } = await supabase
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
      readiness_score: onboardingData.readinessScore || 82
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
