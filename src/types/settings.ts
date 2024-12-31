export interface SocialLinks {
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  instagram?: string;
  youtube?: string;
  custom?: {
    label: string;
    url: string;
  };
}

export interface ContactInfo {
  email: string;
}

export interface DisplayPreferences {
  showProfilePicture: boolean;
  showCompanyLogo: boolean;
  showCompanyName: boolean;
  showSocialLinks: boolean;
  showContactInfo: boolean;
  profileVisibility: 'public' | 'private' | 'limited';
}

export interface UserSettings {
  fullName: string;
  companyName?: string;
  bio?: string;
  companyLogo?: string;
  profilePicture?: string;
  socialLinks: SocialLinks;
  contactInfo: ContactInfo;
  displayPreferences: DisplayPreferences;
}