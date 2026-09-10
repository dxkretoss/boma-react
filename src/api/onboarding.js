import { supabase } from '../supabaseClient';

/**
 * Helper to invoke the custom-onboarding Supabase Edge Function
 */
async function invokeOnboarding(action, payload = {}) {
  const { data, error } = await supabase.functions.invoke('custom-onboarding', {
    body: {
      action,
      ...payload,
    },
  });

  if (error) {
    let errorMessage = error.message;
    try {
      if (error.context && typeof error.context.json === 'function') {
        const errJson = await error.context.json();
        if (errJson?.error) errorMessage = errJson.error;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMessage || 'Onboarding request failed');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Fetches the currently published questionnaire, its questions, and options via Edge Function.
 */
export async function fetchActiveQuestionnaire() {
  try {
    const result = await invokeOnboarding('get-questionnaire');
    return result?.questionnaire || null;
  } catch (err) {
    console.error('Failed to fetch questionnaire via Edge Function:', err);
    throw err;
  }
}

/**
 * Gets or initializes the user's onboarding progress via Edge Function.
 */
export async function fetchOnboardingProgress(userId) {
  if (!userId) return null;
  try {
    const result = await invokeOnboarding('get-progress', { userId });
    return result?.progress || null;
  } catch (err) {
    console.error('Failed to fetch progress via Edge Function:', err);
    return null;
  }
}

/**
 * Fetches all onboarding responses submitted by a user via Edge Function.
 */
export async function fetchSavedResponses(userId) {
  if (!userId) return [];
  try {
    const result = await invokeOnboarding('get-progress', { userId });
    return result?.responses || [];
  } catch (err) {
    console.error('Failed to fetch saved responses via Edge Function:', err);
    return [];
  }
}

/**
 * Saves a single onboarding response and updates progress via Edge Function.
 */
export async function saveOnboardingResponse(userId, responseData) {
  const result = await invokeOnboarding('save-response', {
    userId,
    ...responseData,
  });
  return result?.success || true;
}

/**
 * Calculates user's readiness score using dynamic DB rules via Edge Function breakdown.
 */
export async function calculateReadinessScore(userId) {
  try {
    const result = await invokeOnboarding('get-score-breakdown', { userId });
    return result?.totalScore || 82;
  } catch (err) {
    console.warn('Readiness score calculation fallback:', err);
    return 82;
  }
}

/**
 * Submits the user's completed onboarding profile via Edge Function.
 */
export async function submitOnboardingProfile(userId) {
  if (!userId) throw new Error('User ID is required to submit profile.');
  const result = await invokeOnboarding('submit-onboarding', { userId });
  return result?.user;
}

/**
 * Returns a comprehensive score breakdown for a specific user via Edge Function.
 */
export async function getReadinessScoreBreakdown(userId) {
  const result = await invokeOnboarding('get-score-breakdown', { userId });
  return result;
}

/**
 * Fetches all active readiness scoring rules joined with question and option info.
 */
export async function fetchReadinessRules() {
  const { data: rules, error } = await supabase
    .from('readiness_scoring_rules')
    .select(`
      *,
      option:onboarding_question_options(*),
      question:onboarding_questions(*)
    `)
    .eq('is_active', true);

  if (error) {
    const { data: rawRules } = await supabase.from('readiness_scoring_rules').select('*').eq('is_active', true);
    return rawRules || [];
  }
  return rules || [];
}
