import { supabase } from '../supabaseClient';

/**
 * Fetches the currently published questionnaire, its questions, and options.
 * Follows Rule 1 of SKILL.md.
 */
export async function fetchActiveQuestionnaire() {
  // 1. Get published questionnaire
  const { data: questionnaire, error: qError } = await supabase
    .from('onboarding_questionnaires')
    .select('*')
    .eq('status', 'PUBLISHED')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (qError) {
    throw new Error(`Failed to fetch questionnaire: ${qError.message}`);
  }

  if (!questionnaire) {
    return null;
  }

  // 2. Get questions with options
  const { data: questions, error: qnsError } = await supabase
    .from('onboarding_questions')
    .select(`
      *,
      options:onboarding_question_options(*)
    `)
    .eq('questionnaire_id', questionnaire.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (qnsError) {
    throw new Error(`Failed to fetch questions: ${qnsError.message}`);
  }

  // Sort options inside each question by display_order
  const processedQuestions = (questions || []).map(q => {
    if (q.options) {
      q.options = q.options
        .filter(opt => opt.is_active)
        .sort((a, b) => a.display_order - b.display_order);
    }
    return q;
  });

  return {
    ...questionnaire,
    questions: processedQuestions
  };
}

/**
 * Gets or initializes the user's onboarding progress.
 */
export async function fetchOnboardingProgress(userId) {
  if (!userId) return null;

  const { data: progress, error } = await supabase
    .from('onboarding_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch progress: ${error.message}`);
  }

  if (!progress) {
    // Get published questionnaire first
    const activeQ = await fetchActiveQuestionnaire();
    if (!activeQ) return null;

    // Create a new progress record
    const { data: newProgress, error: insertError } = await supabase
      .from('onboarding_progress')
      .insert([{
        user_id: userId,
        questionnaire_id: activeQ.id,
        current_step: 1,
        total_steps: 9,
        status: 'NOT_STARTED'
      }])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to initialize progress: ${insertError.message}`);
    }
    return newProgress;
  }

  return progress;
}

/**
 * Fetches all onboarding responses submitted by a user.
 */
export async function fetchSavedResponses(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch saved responses: ${error.message}`);
  }
  return data || [];
}

/**
 * Saves a single onboarding response and updates progress.
 */
export async function saveOnboardingResponse(userId, responseData) {
  const { questionnaireId, questionnaireVersion, questionId, questionKey, answerJson, stepNumber } = responseData;

  // 1. Upsert response
  const { error: responseError } = await supabase
    .from('onboarding_responses')
    .upsert({
      user_id: userId,
      questionnaire_id: questionnaireId,
      questionnaire_version: questionnaireVersion,
      question_id: questionId,
      question_key: questionKey,
      answer_json: answerJson,
      answered_at: new Date()
    }, {
      onConflict: 'user_id,question_id'
    });

  if (responseError) {
    throw new Error(`Failed to save answer: ${responseError.message}`);
  }

  // 2. Fetch current progress
  const { data: currentProgress } = await supabase
    .from('onboarding_progress')
    .select('current_step')
    .eq('user_id', userId)
    .maybeSingle();

  const nextStep = currentProgress ? Math.max(currentProgress.current_step, stepNumber) : stepNumber;

  // 3. Update onboarding progress
  const { error: progressError } = await supabase
    .from('onboarding_progress')
    .update({
      current_step: nextStep,
      status: 'IN_PROGRESS',
      last_saved_at: new Date()
    })
    .eq('user_id', userId);

  if (progressError) {
    throw new Error(`Failed to update progress: ${progressError.message}`);
  }

  return true;
}

/**
 * Calculates user's readiness score using dynamic DB rules.
 */
export async function calculateReadinessScore(userId) {
  // 1. Fetch user's responses
  const responses = await fetchSavedResponses(userId);
  if (responses.length === 0) return 0;

  // 2. Fetch all readiness rules
  const { data: rules, error: rulesError } = await supabase
    .from('readiness_scoring_rules')
    .select('*')
    .eq('is_active', true);

  if (rulesError) {
    throw new Error(`Failed to fetch scoring rules: ${rulesError.message}`);
  }

  // Map rules for quick lookup by option_key / option_id
  const rulesMap = {};
  (rules || []).forEach(r => {
    rulesMap[r.option_id] = r.score_value;
  });

  // Fetch the question options to match option keys/values
  const { data: options, error: optError } = await supabase
    .from('onboarding_question_options')
    .select('*')
    .eq('is_active', true);

  if (optError) {
    throw new Error(`Failed to fetch options: ${optError.message}`);
  }

  // Map option_key, value, and label -> id
  const optionKeyToIdMap = {};
  options.forEach(opt => {
    optionKeyToIdMap[opt.option_key] = opt.id;
    if (opt.value) optionKeyToIdMap[opt.value] = opt.id;
    if (opt.label) optionKeyToIdMap[opt.label] = opt.id;
  });

  let totalScore = 0;
  let scoredCategoriesCount = 0;

  for (const resp of responses) {
    const val = resp.answer_json?.value;
    const optionId = optionKeyToIdMap[val];
    const scoreVal = rulesMap[optionId];

    if (scoreVal !== undefined) {
      totalScore += scoreVal;
      scoredCategoriesCount++;
    }
  }

  if (scoredCategoriesCount === 0) {
    return 82; // Default fallback readiness score
  }

  return Math.round(totalScore / scoredCategoriesCount);
}

/**
 * Submits the user's completed onboarding profile.
 */
export async function submitOnboardingProfile(userId) {
  if (!userId) throw new Error('User ID is required to submit profile.');

  // 1. Calculate readiness score
  const readinessScore = await calculateReadinessScore(userId);

  // 2. Fetch active questionnaire to log questionnaire_id
  const activeQ = await fetchActiveQuestionnaire();
  const questionnaireId = activeQ ? activeQ.id : null;

  // 3. Update onboarding progress
  const { error: progressError } = await supabase
    .from('onboarding_progress')
    .update({
      status: 'COMPLETED',
      completed_at: new Date()
    })
    .eq('user_id', userId);

  if (progressError) {
    throw new Error(`Failed to complete onboarding progress: ${progressError.message}`);
  }

  // Get the response data to sync with fields on users table
  const responses = await fetchSavedResponses(userId);
  const userUpdates = {
    onboarding_status: 'COMPLETED',
    profile_status: 'UNDER_REVIEW',
    readiness_status: 'CALCULATED',
    readiness_score: readinessScore,
    matching_status: 'NOT_ELIGIBLE',
    user_onboarded: true // sync for UI shell checks
  };

  // Map DB answers back to user fields to preserve standard user object shape
  responses.forEach(resp => {
    const val = resp.answer_json?.value || resp.answer_json?.values;
    if (resp.question_key === 'age_group') userUpdates.age_group = val;
    else if (resp.question_key === 'lifestyles') userUpdates.selected_lifestyles = val;
    else if (resp.question_key === 'decision_style') userUpdates.decision_style = val;
    else if (resp.question_key === 'pod_size') userUpdates.pod_size = val;
    else if (resp.question_key === 'location_city') userUpdates.location_city = val;
    else if (resp.question_key === 'location_radius') userUpdates.location_radius = val;
    else if (resp.question_key === 'setting_preference') userUpdates.setting_preference = val;
    else if (resp.question_key === 'budget_range') userUpdates.budget_range = val;
    else if (resp.question_key === 'down_payment_tier') userUpdates.down_payment_tier = val;
    else if (resp.question_key === 'financing_preference') userUpdates.financing_preference = val;
    else if (resp.question_key === 'housing_intent') userUpdates.housing_intent = val;
    else if (resp.question_key === 'commitment_timeline') userUpdates.commitment_timeline = val;
  });

  // 4. Update users table details
  const { data: user, error: userError } = await supabase
    .from('users')
    .update(userUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (userError) {
    throw new Error(`Failed to submit user profile: ${userError.message}`);
  }

  return user;
}
