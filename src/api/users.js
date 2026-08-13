import { supabase } from '../supabaseClient';

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
