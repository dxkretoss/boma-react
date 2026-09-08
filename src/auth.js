import { supabase } from './supabaseClient';

// Helper to invoke the custom-auth Edge Function
async function invokeAuth(action, payload = {}) {
  const { data, error } = await supabase.functions.invoke('custom-auth', {
    body: {
      action,
      ...payload,
    },
  });

  if (error) {
    // Attempt to parse edge function custom JSON error message
    let errorMessage = error.message;
    try {
      if (error.context && typeof error.context.json === 'function') {
        const errJson = await error.context.json();
        if (errJson?.error) errorMessage = errJson.error;
      }
    } catch {
      // fallback to error.message
    }
    throw new Error(errorMessage || 'Authentication request failed');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

// Helper to send email via Supabase Edge Function (backward compatible)
export async function sendVerificationEmail(email, code, type = 'verification') {
  if (type === 'reset') {
    return customRequestPasswordReset(email);
  }
  return customResendVerification(email);
}

// Custom register function
export async function customRegister(email, password, name) {
  const result = await invokeAuth('register', {
    email,
    password,
    name,
  });
  return result.user;
}

// Resend verification code
export async function customResendVerification(email) {
  await invokeAuth('resend-verification', { email });
  return true;
}

// Verify verification code
export async function customVerifyEmail(email, code) {
  const result = await invokeAuth('verify-email', {
    email,
    code,
  });
  return result.user;
}

// Custom login function
export async function customLogin(email, password) {
  const result = await invokeAuth('login', {
    email,
    password,
  });
  return result.user;
}

// Update onboarding state
export async function updateOnboarding(userId, onboardingData) {
  const result = await invokeAuth('update-onboarding', {
    userId,
    onboardingData,
  });
  return result.user;
}

// Request password reset
export async function customRequestPasswordReset(email) {
  await invokeAuth('request-password-reset', { email });
  return true;
}

// Reset password using token/code
export async function customResetPassword(email, token, newPassword) {
  await invokeAuth('reset-password', {
    email,
    token,
    newPassword,
  });
  return true;
}

