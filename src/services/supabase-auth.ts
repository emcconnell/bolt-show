import { supabase } from '../config/supabase';
import type { AuthResponse } from '../types/auth';
import { saveProfile } from './supabase-profile';

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('No user data returned');
  }
  
  // Get user's role from the users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (userError) {
    throw new Error('Failed to get user role');
  }

  // Check if user has a profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  // If no profile exists, create one
  if (profileError?.code === 'PGRST116') {
    const { error: createProfileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        display_name: data.user.user_metadata.name || data.user.email,
        display_preferences: {
          showProfilePicture: true,
          showCompanyLogo: false,
          showSocialLinks: true,
          showContactInfo: false,
          profileVisibility: 'public'
        }
      });

    if (createProfileError) {
      console.error('Failed to create profile:', createProfileError);
    }
  }
  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata.name || '',
      avatar: data.user.user_metadata.avatar_url || '',
      role: userData.role || 'user'
    },
    token: data.session?.access_token || ''
  };
}

export async function signUp(email: string, password: string, username: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: username,
          role: 'user'
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.user) {
      throw new Error('No user data returned from auth signup');
    }

    // Create user record and wait for it
    const { error: userError } = await supabase 
      .from('users')
      .insert({
        id: data.user.id,
        role: 'user',
        status: 'active'
      })
      .single();

    if (userError) {
      throw new Error(`Failed to create user record: ${userError.message}`);
    }
    
    // Create profile record and wait for response
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        display_name: username,
        display_preferences: {
          showProfilePicture: true,
          showCompanyLogo: false,
          showSocialLinks: true,
          showContactInfo: false,
          profileVisibility: 'public'
        }
      })
      .single();

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    // Wait and verify profile was created with retries
    let retries = 3;
    while (retries > 0) {
      try {
        const { data: verifyProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (verifyProfile) break;
      } catch (error) {
        if (retries === 1) console.warn('Profile verification warning:', error);
      }
      retries--;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      success: true,
      message: 'Account created successfully! You can now login.'
    };
  } catch (error) {
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata.name || '',
    avatar: user.user_metadata.avatar_url || '',
    role: user.user_metadata.role || 'user'
  };
}