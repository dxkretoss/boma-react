import { supabase } from '../supabaseClient';
import { calculateReadinessScore } from './onboarding';

/**
 * Updates a user's profile and database fields.
 * Follows Rule 1 of SKILL.md (Custom Supabase Abstraction).
 * @param {string} userId
 * @param {object} updates
 * @returns {Promise<object>} Updated user object
 */
export async function updateUser(userId, updates) {
  if (!userId) {
    throw new Error('User ID is required for updates.');
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  return data;
}

/**
 * Fetches a user's profile from the database.
 */
export async function fetchUserProfile(userId) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
}

/**
 * Updates user preferences dynamically in both 'users' and 'onboarding_responses',
 * then recalculates their readiness score.
 */
export async function updateUserPreferencesAndScore(userId, prefs) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  // 1. Fetch onboarding questions to map keys to IDs
  const { data: questions, error: qError } = await supabase
    .from('onboarding_questions')
    .select('id, questionnaire_id, question_key')
    .in('question_key', ['location_city', 'setting_preference', 'housing_intent']);

  if (!qError && questions && questions.length > 0) {
    // 2. Fetch active questionnaire version
    const { data: qn } = await supabase
      .from('onboarding_questionnaires')
      .select('version')
      .eq('id', questions[0].questionnaire_id)
      .maybeSingle();
    const version = qn?.version || 1;

    // 3. Upsert responses into onboarding_responses to maintain questionnaire sync
    const responseUpserts = [];
    if (prefs.location_city !== undefined) {
      const q = questions.find(x => x.question_key === 'location_city');
      if (q) {
        responseUpserts.push({
          user_id: userId,
          questionnaire_id: q.questionnaire_id,
          questionnaire_version: version,
          question_id: q.id,
          question_key: 'location_city',
          answer_json: { value: prefs.location_city },
          answered_at: new Date()
        });
      }
    }
    if (prefs.setting_preference !== undefined) {
      const q = questions.find(x => x.question_key === 'setting_preference');
      if (q) {
        responseUpserts.push({
          user_id: userId,
          questionnaire_id: q.questionnaire_id,
          questionnaire_version: version,
          question_id: q.id,
          question_key: 'setting_preference',
          answer_json: { value: prefs.setting_preference },
          answered_at: new Date()
        });
      }
    }
    if (prefs.housing_intent !== undefined) {
      const q = questions.find(x => x.question_key === 'housing_intent');
      if (q) {
        responseUpserts.push({
          user_id: userId,
          questionnaire_id: q.questionnaire_id,
          questionnaire_version: version,
          question_id: q.id,
          question_key: 'housing_intent',
          answer_json: { value: prefs.housing_intent },
          answered_at: new Date()
        });
      }
    }

    if (responseUpserts.length > 0) {
      await supabase
        .from('onboarding_responses')
        .upsert(responseUpserts, { onConflict: 'user_id,question_id' });
    }
  }

  // 4. Calculate new readiness score
  let newScore = 82;
  try {
    newScore = await calculateReadinessScore(userId);
  } catch (err) {
    console.error('Failed to calculate new readiness score:', err);
  }

  // 5. Update user table fields along with the newly calculated score
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({
      ...prefs,
      readiness_score: newScore
    })
    .eq('id', userId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to update user preferences: ${updateError.message}`);
  }

  return updatedUser;
}
