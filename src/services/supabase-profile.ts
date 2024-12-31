import { supabase } from '../config/supabase';
import type { UserProfile } from '../types/models';
import { withRetry } from '../utils/retry';

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const profile = await withRetry(async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') {
        throw error;
    }

    if (!data) {
      throw new Error('Profile not found');
    }

    return {
      id: data.id,
      userId: data.user_id,
      displayName: data.display_name,
      avatarUrl: data.avatar_url || '',
      bio: data.bio || '',
      company: data.company,
      location: data.location,
      website: data.website,
      companyLogo: data.company_logo,
      socialLinks: data.social_links as UserProfile['socialLinks'],
      displayPreferences: data.display_preferences as UserProfile['displayPreferences'],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }, {
    maxAttempts: 5,
    delayMs: 1000,
    backoff: true
  }).catch(error => {
    if (error.name === 'RetryError') {
      console.warn('Profile not found after retries');
      return null;
    }
    throw error;
  });

  return profile;
}

export async function saveProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
  // First check if profile exists
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw checkError;
  }

  const { data: result, error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      display_name: data.displayName,
      bio: data.bio,
      company: data.company,
      location: data.location,
      website: data.website,
      company_logo: data.companyLogo,
      social_links: data.socialLinks,
      display_preferences: data.displayPreferences,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single();

  if (upsertError) throw upsertError;

  return getProfile(userId) as Promise<UserProfile>;
}