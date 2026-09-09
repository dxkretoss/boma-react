import { supabase } from '../supabaseClient';

const DEFAULT_LEARNING_VIDEOS = [
  {
    id: 'default-1',
    title: 'Intro to BOMA Co-housing',
    thumbnail_url: '/assets/pod_community_realistic.png',
    tag: 'Getting Started',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Learn why matching neighbors first creates resilient, vibrant communities without financial risks up front.',
    order_index: 1,
    is_published: true
  },
  {
    id: 'default-2',
    title: 'How Pod Matching Works',
    thumbnail_url: '/assets/pod_austin.png',
    tag: 'Matching Engine',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Discover how our transparent rules-based engine evaluates lifestyle, decision-making style, and metro radius.',
    order_index: 2,
    is_published: true
  },
  {
    id: 'default-3',
    title: 'Understanding Readiness Scores',
    thumbnail_url: '/assets/pod_denver.png',
    tag: 'Scoring Guide',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Learn how self-reported readiness tiers and commitment timelines build your transparent readiness score.',
    order_index: 3,
    is_published: true
  },
  {
    id: 'default-4',
    title: 'The Pod Commons & Agreements',
    thumbnail_url: '/assets/pod_charleston.png',
    tag: 'Community Commons',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Explore Pod chat, agreement scaffolding, and consensus decision making before moving to Phase 2.',
    order_index: 4,
    is_published: true
  }
];

/**
 * Fetch all published or all learning videos.
 * Gracefully falls back to default seed tutorials if database table is not yet populated.
 */
export async function fetchLearningVideos(includeUnpublished = false) {
  try {
    let query = supabase
      .from('learning_videos')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Could not fetch from learning_videos table (using defaults):', error.message);
      return DEFAULT_LEARNING_VIDEOS;
    }

    if (!data || data.length === 0) {
      return DEFAULT_LEARNING_VIDEOS;
    }

    return data;
  } catch (err) {
    console.error('Error in fetchLearningVideos:', err);
    return DEFAULT_LEARNING_VIDEOS;
  }
}

/**
 * Create a new learning video record.
 */
export async function createLearningVideo(videoData) {
  const payload = {
    title: videoData.title?.trim(),
    description: videoData.description?.trim(),
    video_url: videoData.video_url?.trim(),
    thumbnail_url: videoData.thumbnail_url?.trim(),
    tag: videoData.tag?.trim() || 'Getting Started',
    order_index: typeof videoData.order_index === 'number' ? videoData.order_index : 0,
    is_published: videoData.is_published !== undefined ? Boolean(videoData.is_published) : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('learning_videos')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create learning video: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing learning video record.
 */
export async function updateLearningVideo(id, videoData) {
  const payload = {
    ...videoData,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('learning_videos')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update learning video: ${error.message}`);
  }

  return data;
}

/**
 * Delete a learning video record by ID.
 */
export async function deleteLearningVideo(id) {
  const { error } = await supabase
    .from('learning_videos')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete learning video: ${error.message}`);
  }

  return true;
}
