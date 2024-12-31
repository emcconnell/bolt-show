export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          role: 'admin' | 'user' | 'business'
          avatar_url: string | null
          status: 'pending' | 'active' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'user' | 'business'
          avatar_url?: string | null
          status?: 'pending' | 'active' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'user' | 'business'
          avatar_url?: string | null
          status?: 'pending' | 'active' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string
          bio: string | null
          company: string | null
          location: string | null
          website: string | null
          company_logo: string | null
          social_links: Json
          display_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name: string
          bio?: string | null
          company?: string | null
          location?: string | null
          website?: string | null
          company_logo?: string | null
          social_links?: Json
          display_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string
          bio?: string | null
          company?: string | null
          location?: string | null
          website?: string | null
          company_logo?: string | null
          social_links?: Json
          display_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          short_description: string
          features: string[]
          tech_stack: string[]
          status: 'waiting_approval' | 'flagged' | 'approved' | 'changes_requested'
          admin_notes: string | null
          likes_count: number
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          short_description: string
          features?: string[]
          tech_stack?: string[]
          status?: 'waiting_approval' | 'flagged' | 'approved' | 'changes_requested'
          admin_notes?: string | null
          likes_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          short_description?: string
          features?: string[]
          tech_stack?: string[]
          status?: 'waiting_approval' | 'flagged' | 'approved' | 'changes_requested'
          admin_notes?: string | null
          likes_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      project_media: {
        Row: {
          id: string
          project_id: string
          type: 'image' | 'video'
          url: string
          thumbnail: string | null
          title: string | null
          created_at: string
          order: number
        }
        Insert: {
          id?: string
          project_id: string
          type: 'image' | 'video'
          url: string
          thumbnail?: string | null
          title?: string | null
          created_at?: string
          order?: number
        }
        Update: {
          id?: string
          project_id?: string
          type?: 'image' | 'video'
          url?: string
          thumbnail?: string | null
          title?: string | null
          created_at?: string
          order?: number
        }
      }
      project_links: {
        Row: {
          id: string
          project_id: string
          type: 'github' | 'demo' | 'other'
          url: string
          title: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: 'github' | 'demo' | 'other'
          url: string
          title?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: 'github' | 'demo' | 'other'
          url?: string
          title?: string | null
          created_at?: string
        }
      }
      project_tags: {
        Row: {
          project_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          project_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          project_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      project_likes: {
        Row: {
          user_id: string
          project_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          project_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          project_id?: string
          created_at?: string
        }
      }
    }
  }
}