import { supabase } from '../config/supabase';
import type { Tag } from '../types/tag'; 

async function transformTagData(data: any): Promise<Tag> {
  return {
    id: data.id,
    name: data.name,
    createdAt: new Date(data.created_at)
  };
}

class TagStorageService {
  private static instance: TagStorageService;

  private constructor() {
    // Initialize Supabase client in constructor if needed
  }

  static getInstance(): TagStorageService {
    if (!TagStorageService.instance) {
      TagStorageService.instance = new TagStorageService();
    }
    return TagStorageService.instance;
  }

  async getAllTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return Promise.all(data.map(transformTagData));
  }

  async createTag(name: string): Promise<Tag> {
    const normalizedName = name.trim();
    
    if (!normalizedName) {
      throw new Error('Tag name cannot be empty');
    }

    if (normalizedName.length < 2) {
      throw new Error('Tag name must be at least 2 characters long');
    }

    if (normalizedName.length > 20) {
      throw new Error('Tag name cannot exceed 20 characters');
    }

    // Check if tag already exists
    const { data: existingTags, error: checkError } = await supabase
      .from('tags')
      .select('name')
      .ilike('name', normalizedName);

    if (checkError) throw checkError;
    
    if (existingTags && existingTags.length > 0) {
      throw new Error('Tag already exists');
    }

    const { data, error } = await supabase
      .from('tags')
      .insert({ name: normalizedName })
      .select()
      .single();

    if (error) throw error;
    return transformTagData(data);
  }

  async deleteTag(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async getTagById(id: string): Promise<Tag | null> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return transformTagData(data);
  }

  async validateTags(tagNames: string[]): Promise<boolean> {
    const { data, error } = await supabase
      .from('tags')
      .select('name')
      .in('name', tagNames);

    if (error) throw error;
    return data.length === tagNames.length;
  }
}

export const tagStorage = TagStorageService.getInstance();