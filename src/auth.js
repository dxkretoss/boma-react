import { supabase } from './supabaseClient';

// Helper to send email via Supabase Edge Function
export async function sendVerificationEmail(email, code, type = 'verification') {
  const { error } = await supabase.functions.invoke(
    'send-verification-email',
    {
      body: {
        email: email.toLowerCase().trim(),
        code,
        type,
      },
    }
  );

  if (error) {
    throw error;
  }
  return true;
}

// Custom register function
export async function customRegister(email, password, name) {
  // 1. Check if user already exists
  const { data: existing, error: checkError } = await supabase
    .from('users')
    .select('id, email_verified')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (checkError) throw checkError;

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  if (existing) {
    if (existing.email_verified) {
      throw new Error('Email already registered');
    }

    // Update existing unverified user name, password, and code
    const { data, error } = await supabase
      .from('users')
      .update({
        name,
        password,
        verification_code: code
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    // Send verification email via Edge Function
    await sendVerificationEmail(email.toLowerCase().trim(), code);

    return data;
  }

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

  // 3. Send verification email via Edge Function
  await sendVerificationEmail(email.toLowerCase().trim(), code);

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

// Request password reset
export async function customRequestPasswordReset(email) {
  const normalizedEmail = email.toLowerCase().trim();
  
  // 1. Check if user exists
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('User not found');

  // 2. Generate reset code (re-using verification_code)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  const { error: updateError } = await supabase
    .from('users')
    .update({ verification_code: code })
    .eq('email', normalizedEmail);

  if (updateError) throw updateError;

  // 3. Send email with type 'reset'
  await sendVerificationEmail(normalizedEmail, code, 'reset');
  return true;
}

// Reset password using token/code
export async function customResetPassword(email, token, newPassword) {
  const normalizedEmail = email.toLowerCase().trim();
  
  // 1. Query user to verify code
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('User not found');

  if (!data.verification_code || data.verification_code !== token) {
    throw new Error('Invalid or expired reset link');
  }

  // 2. Update password and clear verification code
  const { error: updateError } = await supabase
    .from('users')
    .update({
      password: newPassword,
      verification_code: null
    })
    .eq('email', normalizedEmail);

  if (updateError) throw updateError;
  return true;
}
