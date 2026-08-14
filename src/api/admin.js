import { supabase } from '../supabaseClient';

/**
 * Fetches all registered users for admin review.
 * Supports filters and search queries.
 */
export async function fetchAdminUsers(filters = {}) {
  let query = supabase
    .from('users')
    .select('*')
    .neq('role', 'admin');

  if (filters.profileStatus && filters.profileStatus !== 'ALL') {
    query = query.eq('profile_status', filters.profileStatus);
  }
  if (filters.onboardingStatus && filters.onboardingStatus !== 'ALL') {
    query = query.eq('onboarding_status', filters.onboardingStatus);
  }
  if (filters.entryPath && filters.entryPath !== 'ALL') {
    query = query.eq('entry_path', filters.entryPath);
  }
  if (filters.matchingStatus && filters.matchingStatus !== 'ALL') {
    query = query.eq('matching_status', filters.matchingStatus);
  }
  if (filters.search && filters.search.trim() !== '') {
    const s = `%${filters.search.trim()}%`;
    query = query.or(`name.ilike.${s},email.ilike.${s}`);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch admin users: ${error.message}`);
  }
  return data || [];
}

/**
 * Fetches a single user's detailed onboarding responses.
 */
export async function fetchUserOnboardingAnswers(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch onboarding responses: ${error.message}`);
  }

  // Fetch questions to associate titles
  const { data: questions, error: qError } = await supabase
    .from('onboarding_questions')
    .select('*');

  if (qError) {
    throw new Error(`Failed to fetch questions reference: ${qError.message}`);
  }

  const questionMap = {};
  (questions || []).forEach(q => {
    questionMap[q.id] = q;
  });

  return (data || []).map(resp => ({
    ...resp,
    question: questionMap[resp.question_id] || { title: resp.question_key, step_number: 0 }
  })).sort((a, b) => (a.question?.display_order || 0) - (b.question?.display_order || 0));
}

/**
 * Submits an admin review action (APPROVE, REJECT, FLAG).
 */
export async function submitProfileReview(reviewData) {
  const { userId, adminId, action, reason } = reviewData;

  // 1. Fetch current user status
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError) throw new Error(`User not found: ${fetchError.message}`);

  let newProfileStatus = 'UNDER_REVIEW';
  let newMatchingStatus = 'NOT_ELIGIBLE';

  if (action === 'APPROVE') {
    newProfileStatus = 'APPROVED';
    newMatchingStatus = 'IN_POOL';
  } else if (action === 'REJECT') {
    newProfileStatus = 'REJECTED';
    newMatchingStatus = 'NOT_ELIGIBLE';
  } else if (action === 'FLAG') {
    newProfileStatus = 'UNDER_REVIEW';
    newMatchingStatus = 'NOT_ELIGIBLE';
  }

  // 2. Insert audit trail in profile_reviews
  const { error: reviewError } = await supabase
    .from('profile_reviews')
    .insert([{
      user_id: userId,
      admin_id: adminId,
      action: action,
      reason: reason || null,
      previous_status: user.profile_status,
      new_status: newProfileStatus
    }]);

  if (reviewError) throw new Error(`Failed to log review details: ${reviewError.message}`);

  // 3. Update user profile status
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({
      profile_status: newProfileStatus,
      matching_status: newMatchingStatus,
      rejection_reason: action === 'REJECT' ? reason : null
    })
    .eq('id', userId)
    .select()
    .single();

  if (updateError) throw new Error(`Failed to update user profile status: ${updateError.message}`);

  // 4. Create or update matching pool entry if approved
  if (action === 'APPROVE') {
    const { error: poolError } = await supabase
      .from('matching_pool_entries')
      .upsert({
        user_id: userId,
        status: 'ACTIVE',
        readiness_score: user.readiness_score || 82,
        entry_path: user.entry_path || 'MATCHING_POOL',
        entered_at: new Date(),
        updated_at: new Date()
      }, {
        onConflict: 'user_id'
      });

    if (poolError) throw new Error(`Failed to add user to Matching Pool: ${poolError.message}`);
  } else {
    // De-activate matching pool entry if rejected or flagged
    await supabase
      .from('matching_pool_entries')
      .delete()
      .eq('user_id', userId);
  }

  return updatedUser;
}

/**
 * Fetches configured matching weights.
 */
export async function fetchMatchingWeights() {
  const { data, error } = await supabase
    .from('matching_weights')
    .select('*')
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to fetch matching weights: ${error.message}`);
  }
  return data || [];
}

/**
 * Updates matching weights.
 */
export async function updateMatchingWeights(weights, adminId) {
  // Validate total equals 100%
  const total = weights.reduce((sum, w) => sum + parseInt(w.weight), 0);
  if (total !== 100) {
    throw new Error(`Total matching weights must sum to exactly 100%. Current sum: ${total}%`);
  }

  for (const wt of weights) {
    const { error } = await supabase
      .from('matching_weights')
      .upsert({
        variable_key: wt.variable_key,
        weight: parseInt(wt.weight),
        is_active: true,
        updated_by: adminId,
        updated_at: new Date()
      }, {
        onConflict: 'variable_key'
      });

    if (error) {
      throw new Error(`Failed to save weight for ${wt.variable_key}: ${error.message}`);
    }
  }

  return true;
}

/**
 * Fetches all questions for administrative management.
 */
export async function fetchAdminQuestionsList() {
  // 1. Get published questionnaire or fallback to latest questionnaire
  let { data: questionnaire } = await supabase
    .from('onboarding_questionnaires')
    .select('id')
    .eq('status', 'PUBLISHED')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!questionnaire) {
    const { data: latest } = await supabase
      .from('onboarding_questionnaires')
      .select('id')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    questionnaire = latest;
  }

  if (!questionnaire) {
    return [];
  }

  // 2. Fetch questions for this questionnaire
  const { data: questions, error } = await supabase
    .from('onboarding_questions')
    .select(`
      *,
      options:onboarding_question_options(*)
    `)
    .eq('questionnaire_id', questionnaire.id)
    .order('step_number', { ascending: true })
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch administrative question list: ${error.message}`);
  }

  // 3. Fetch all readiness scoring rules
  const { data: scoringRules } = await supabase
    .from('readiness_scoring_rules')
    .select('*');

  const rulesMap = {};
  (scoringRules || []).forEach(r => {
    rulesMap[r.option_id] = r.score_value;
  });

  return (questions || []).map(q => {
    if (q.options) {
      q.options = q.options
        .map(opt => ({
          ...opt,
          scoring_points: rulesMap[opt.id] || 0
        }))
        .sort((a, b) => a.display_order - b.display_order);
    }
    return q;
  });
}

/**
 * Saves changes to a question (or creates a new one).
 */
export async function saveAdminQuestion(questionData) {
  const id = questionData.id;
  const questionnaireId = questionData.questionnaireId || questionData.questionnaire_id;
  const questionKey = questionData.questionKey || questionData.question_key;
  const stepNumber = questionData.stepNumber !== undefined ? questionData.stepNumber : questionData.step_number;
  const title = questionData.title;
  const description = questionData.description;
  const questionType = questionData.questionType || questionData.question_type;
  const isRequired = questionData.isRequired !== undefined ? questionData.isRequired : questionData.is_required;
  const isActive = questionData.isActive !== undefined ? questionData.isActive : questionData.is_active;
  const displayOrder = questionData.displayOrder !== undefined ? questionData.displayOrder : questionData.display_order;
  const scoringEnabled = questionData.scoringEnabled !== undefined ? questionData.scoringEnabled : questionData.scoring_enabled;

  let finalQuestionnaireId = questionnaireId;
  if (!finalQuestionnaireId) {
    const { data: qn } = await supabase.from('onboarding_questionnaires').select('id').limit(1);
    if (qn && qn.length > 0) {
      finalQuestionnaireId = qn[0].id;
    }
  }

  const questionPayload = {
    questionnaire_id: finalQuestionnaireId,
    question_key: questionKey,
    step_number: stepNumber ? parseInt(stepNumber) : null,
    title,
    description,
    question_type: questionType,
    is_required: isRequired,
    is_active: isActive,
    display_order: displayOrder ? parseInt(displayOrder) : null,
    scoring_enabled: scoringEnabled,
    updated_at: new Date()
  };

  if (id) {
    const { data, error } = await supabase
      .from('onboarding_questions')
      .update(questionPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('onboarding_questions')
      .insert([questionPayload])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * Saves/inserts an option for a question.
 */
export async function saveAdminQuestionOption(optionData) {
  const id = optionData.id;
  const questionId = optionData.questionId || optionData.question_id;
  const optionKey = optionData.optionKey || optionData.option_key;
  const label = optionData.label;
  const description = optionData.description;
  const value = optionData.value !== undefined ? optionData.value : (optionData.optionKey || optionData.option_key);
  const displayOrder = optionData.displayOrder !== undefined ? optionData.displayOrder : optionData.display_order;
  const isActive = optionData.isActive !== undefined ? optionData.isActive : optionData.is_active;

  const optionPayload = {
    question_id: questionId,
    option_key: optionKey,
    label,
    description,
    value: value,
    display_order: displayOrder ? parseInt(displayOrder) : null,
    is_active: isActive !== undefined ? isActive : true,
    updated_at: new Date()
  };

  if (id) {
    const { data, error } = await supabase
      .from('onboarding_question_options')
      .update(optionPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('onboarding_question_options')
      .insert([optionPayload])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * Deletes/archives an option.
 */
export async function archiveAdminQuestionOption(optionId) {
  // Delete scoring rules referencing this option
  await supabase
    .from('readiness_scoring_rules')
    .delete()
    .eq('option_id', optionId);

  // Delete option from onboarding_question_options
  const { error } = await supabase
    .from('onboarding_question_options')
    .delete()
    .eq('id', optionId);

  if (error) {
    const { error: updateError } = await supabase
      .from('onboarding_question_options')
      .update({ is_active: false })
      .eq('id', optionId);
    if (updateError) throw updateError;
  }
  return true;
}

/**
 * Deletes a question and its options.
 */
export async function deleteAdminQuestion(questionId) {
  // 1. Delete user onboarding responses referencing this question
  await supabase
    .from('onboarding_responses')
    .delete()
    .eq('question_id', questionId);

  // 2. Delete choices options
  await supabase
    .from('onboarding_question_options')
    .delete()
    .eq('question_id', questionId);

  // 3. Delete readiness scoring rules
  await supabase
    .from('readiness_scoring_rules')
    .delete()
    .eq('question_id', questionId);

  // 4. Delete question permanently
  const { error } = await supabase
    .from('onboarding_questions')
    .delete()
    .eq('id', questionId);

  if (error) {
    console.error('Failed to hard delete question:', error);
    throw error;
  }
  return true;
}

/**
 * Publishes a new version of the questionnaire.
 */
export async function publishQuestionnaireVersion(questionnaireId, name, description, adminId) {
  // 1. Get current active questionnaire details
  const { data: currentQ } = await supabase
    .from('onboarding_questionnaires')
    .select('*')
    .eq('id', questionnaireId)
    .single();

  const nextVersion = currentQ ? currentQ.version + 1 : 1;

  // 2. Archive current questionnaire
  if (currentQ) {
    await supabase
      .from('onboarding_questionnaires')
      .update({ status: 'ARCHIVED' })
      .eq('id', currentQ.id);
  }

  // 3. Create new published questionnaire
  const { data: newQ, error: createError } = await supabase
    .from('onboarding_questionnaires')
    .insert([{
      name: name || currentQ.name,
      description: description || currentQ.description,
      status: 'PUBLISHED',
      version: nextVersion,
      published_at: new Date(),
      created_by: adminId
    }])
    .select()
    .single();

  if (createError) throw createError;

  // 4. Duplicate questions and options for version integrity
  const { data: questions } = await supabase
    .from('onboarding_questions')
    .select('*')
    .eq('questionnaire_id', questionnaireId);

  for (const q of (questions || [])) {
    const { data: newQn } = await supabase
      .from('onboarding_questions')
      .insert([{
        questionnaire_id: newQ.id,
        question_key: q.question_key,
        step_number: q.step_number,
        title: q.title,
        description: q.description,
        question_type: q.question_type,
        is_required: q.is_required,
        is_active: q.is_active,
        display_order: q.display_order,
        scoring_enabled: q.scoring_enabled
      }])
      .select()
      .single();

    const { data: options } = await supabase
      .from('onboarding_question_options')
      .select('*')
      .eq('question_id', q.id);

    for (const opt of (options || [])) {
      await supabase
        .from('onboarding_question_options')
        .insert([{
          question_id: newQn.id,
          option_key: opt.option_key,
          label: opt.label,
          description: opt.description,
          value: opt.value,
          display_order: opt.display_order,
          is_active: opt.is_active
        }]);
    }
  }

  return newQ;
}
