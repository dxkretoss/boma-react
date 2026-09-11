import { supabase } from '../supabaseClient';
import { calculateReadinessScore } from './onboarding';

const inFlightUserPromises = new Map();

/**
 * Helper to invoke the manage-users Supabase Edge Function
 */
async function invokeUsers(action, payload = {}) {
  const { data, error } = await supabase.functions.invoke('manage-users', {
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
    throw new Error(errorMessage || 'User operation failed');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Updates a user's profile and database fields via Edge Function.
 * @param {string} userId
 * @param {object} updates
 * @returns {Promise<object>} Updated user object
 */
export async function updateUser(userId, updates) {
  if (!userId) {
    throw new Error('User ID is required for updates.');
  }

  const result = await invokeUsers('update-profile', {
    userId,
    updates,
  });

  // Clear cache entry on update
  inFlightUserPromises.delete(userId);

  return result.user;
}

/**
 * Fetches a user's profile from the database via Edge Function with in-flight request deduplication.
 */
export async function fetchUserProfile(userId) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  // If a request for this userId is already pending, reuse the existing promise
  if (inFlightUserPromises.has(userId)) {
    return inFlightUserPromises.get(userId);
  }

  const promise = invokeUsers('get-profile', { userId })
    .then(result => {
      setTimeout(() => inFlightUserPromises.delete(userId), 1500); // 1.5s deduplication window
      return result.user;
    })
    .catch(err => {
      inFlightUserPromises.delete(userId);
      throw err;
    });

  inFlightUserPromises.set(userId, promise);
  return promise;
}

/**
 * Updates user preferences dynamically and updates profile via Edge Function.
 */
export async function updateUserPreferencesAndScore(userId, prefs) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  // 1. Calculate readiness score
  let newScore = 82;
  try {
    newScore = await calculateReadinessScore(userId);
  } catch (err) {
    console.error('Failed to calculate readiness score:', err);
  }

  // 2. Update user profile via manage-users edge function
  const updatedUser = await updateUser(userId, {
    ...prefs,
    readiness_score: newScore,
  });

  return updatedUser;
}

/**
 * Uploads a user avatar image to Supabase Storage bucket ('avatars')
 * and updates the user's avatar_url via Edge Function.
 * @param {string} userId
 * @param {File} file
 * @returns {Promise<string>} Generated public image URL
 */
export async function uploadUserAvatar(userId, file) {
  if (!userId || !file) {
    throw new Error('User ID and image file are required.');
  }

  const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  // 1. Upload to Supabase Storage bucket 'avatars'
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // 2. Generate public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  const publicUrl = publicUrlData?.publicUrl;

  // 3. Save the clean public URL into the users table via manage-users Edge Function
  await updateUser(userId, { avatar_url: publicUrl });

  return publicUrl;
}

/**
 * Uploads a base64-encoded image directly through manage-users Edge Function.
 * Ideal for Mobile App integrations (React Native, Flutter, Swift, Kotlin).
 * @param {string} userId
 * @param {string} base64Image
 * @param {string} [fileExt='jpg']
 * @returns {Promise<{ avatarUrl: string, user: Object }>}
 */
export async function uploadAvatarBase64(userId, base64Image, fileExt = 'jpg') {
  const result = await invokeUsers('upload-avatar', {
    userId,
    base64Image,
    fileExt,
  });
  return {
    avatarUrl: result.avatarUrl,
    user: result.user,
  };
}

/**
 * Deletes user account and associated records (onboarding, pod memberships, scores).
 * Compliant with Apple / Google mobile account deletion guidelines.
 * @param {string} userId
 * @param {string} [confirmationText]
 * @returns {Promise<boolean>}
 */
export async function deleteUserAccount(userId, confirmationText) {
  await invokeUsers('delete-account', {
    userId,
    confirmationText,
  });
  return true;
}
