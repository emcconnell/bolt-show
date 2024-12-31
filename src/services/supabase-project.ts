import { supabase } from '../config/supabase';
import type { Project, ProjectFormData } from '../types/project';

export async function getPublicProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_media (*),
      project_links (*),
      project_tags (
        tag_id,
        tags (name)
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(transformProjectData);
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_media (*),
      project_links (*),
      project_tags (
        tag_id,
        tags (name)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(transformProjectData);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_media (*),
      project_links (*),
      project_tags (
        tag_id,
        tags (name)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) return null;

  return transformProjectData(data);
}

export async function createProject(userId: string, data: ProjectFormData): Promise<Project> {
  const { title, description, shortDescription, features, techStack, media, links, tags } = data;

  // Start a transaction by using single batch
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      title,
      description,
      short_description: shortDescription,
      features,
      tech_stack: techStack
    })
    .select()
    .single();

  if (projectError) throw projectError;

  // Insert media
  if (media.length > 0) {
    const { error: mediaError } = await supabase
      .from('project_media')
      .insert(
        media.map((m, index) => ({
          project_id: project.id,
          type: m.type,
          url: m.url,
          title: m.title,
          order: index
        }))
      );

    if (mediaError) throw mediaError;
  }

  // Insert links
  if (links.length > 0) {
    const { error: linksError } = await supabase
      .from('project_links')
      .insert(
        links.map(l => ({
          project_id: project.id,
          type: l.type,
          url: l.url,
          title: l.title
        }))
      );

    if (linksError) throw linksError;
  }

  // Insert tags
  if (tags.length > 0) {
    // Get tag IDs
    const { data: tagData, error: tagError } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', tags);

    if (tagError) throw tagError;

    const { error: tagLinkError } = await supabase
      .from('project_tags')
      .insert(
        tagData.map(tag => ({
          project_id: project.id,
          tag_id: tag.id
        }))
      );

    if (tagLinkError) throw tagLinkError;
  }

  return getProjectById(project.id) as Promise<Project>;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      title: updates.title,
      description: updates.description,
      short_description: updates.shortDescription,
      features: updates.features,
      tech_stack: updates.techStack,
      status: updates.status,
      admin_notes: updates.adminNotes,
      likes_count: updates.likes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return getProjectById(data.id) as Promise<Project>;
}

function transformProjectData(data: any): Project {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description,
    shortDescription: data.short_description,
    features: data.features || [],
    techStack: data.tech_stack || [],
    media: data.project_media?.map((m: any) => ({
      type: m.type,
      url: m.url,
      title: m.title,
      thumbnail: m.thumbnail
    })) || [],
    links: data.project_links?.map((l: any) => ({
      type: l.type,
      url: l.url,
      title: l.title
    })) || [],
    tags: data.project_tags?.map((t: any) => t.tags.name) || [],
    status: data.status,
    adminNotes: data.admin_notes,
    likes: data.likes_count,
    views: data.views_count,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}