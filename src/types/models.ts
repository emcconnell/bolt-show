// Base model interface that all entities will implement
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserModel extends BaseModel {
  email: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'user' | 'business';
  status: 'pending' | 'active' | 'suspended';
  verificationToken?: string;
  lastLoginAt?: Date;
}

export interface UserProfile extends BaseModel {
  userId: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
    youtube?: string;
  };
  displayPreferences?: {
    showProfilePicture: boolean;
    showCompanyLogo: boolean;
    showSocialLinks: boolean;
    showContactInfo: boolean;
    profileVisibility: 'public' | 'private' | 'limited';
  };
}