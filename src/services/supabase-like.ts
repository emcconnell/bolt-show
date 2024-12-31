import { supabase } from '../config/supabase';

export async function hasLiked(userId: string, projectId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('project_likes')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return !!data;
}

export async function likeProject(userId: string, projectId: string): Promise<boolean> {
  const alreadyLiked = await hasLiked(userId, projectId);
  if (alreadyLiked) return false;

  const { error } = await supabase
    .from('project_likes')
    .insert({
      user_id: userId,
      project_id: projectId
    });

  if (error) throw error;

  // Increment likes count
  const { error: updateError } = await supabase.rpc('increment_project_likes', {
    project_id: projectId
  });

  if (updateError) throw updateError;

  return true;
}