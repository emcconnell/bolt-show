import type { BaseModel } from './models';

export interface ProjectMedia {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title?: string;
}

export interface ProjectLink {
  type: 'github' | 'demo' | 'other';
  url: string;
  title?: string;
}

export type ProjectStatus = 'waiting_approval' | 'flagged' | 'approved' | 'changes_requested';

export interface Project extends BaseModel {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  media: ProjectMedia[];
  tags: string[];
  links: ProjectLink[];
  features: string[];
  techStack: string[];
  userId: string; 
  status: ProjectStatus;
  likes: number;
  views: number;
  adminNotes?: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  shortDescription: string;
  media: ProjectMedia[];
  tags: string[];
  links: ProjectLink[];
  features: string[];
  techStack: string[];
}