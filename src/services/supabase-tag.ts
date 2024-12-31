import { supabase } from '../config/supabase';
import type { Tag } from '../types/tag';

export async function getAllTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) throw error;

  return data.map(tag => ({
    id: tag.id,
    name: tag.name,
    createdAt: new Date(tag.created_at)
  }));
}

export async function createTag(name: string): Promise<Tag> {
  const { data, error } = await supabase
    .from('tags')
    .insert({ name })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    createdAt: new Date(data.created_at)
  };
}

export async function deleteTag(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function validateTags(tagNames: string[]): Promise<boolean> {
  const { data, error } = await supabase
    .from('tags')
    .select('name')
    .in('name', tagNames);

  if (error) throw error;
  return data.length === tagNames.length;
}