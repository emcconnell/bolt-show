import { UserProfile } from '../types/models';

const PROFILES_KEY = 'bolt_showcase_profiles';

class ProfileStorageService {
  private static instance: ProfileStorageService;
  private profiles: Map<string, UserProfile>;
  private modificationLog: Array<{ timestamp: Date; userId: string; action: string }>;

  private constructor() {
    this.profiles = new Map();
    this.modificationLog = [];
    this.loadProfilesFromStorage();
  }

  private loadProfilesFromStorage(): void {
    try {
      const storedProfiles = sessionStorage.getItem(PROFILES_KEY);
      if (storedProfiles) {
        const profiles = JSON.parse(storedProfiles);
        Object.entries(profiles).forEach(([userId, profile]: [string, any]) => {
          if (profile && typeof profile === 'object') {
            const normalizedProfile = {
              ...profile,
              createdAt: new Date(profile.createdAt),
              updatedAt: new Date(profile.updatedAt),
              displayName: profile.displayName || profile.userId || '',
              avatarUrl: profile.avatarUrl || '',
            };
            this.profiles.set(userId, normalizedProfile as UserProfile);
          }
        });
      }
    } catch (error) {
      console.error('[ProfileStorage] Failed to load profiles from storage:', error);
      this.profiles.clear();
    }
  }

  private saveProfilesToStorage(): void {
    try {
      const profilesObject = Object.fromEntries(this.profiles);
      sessionStorage.setItem(PROFILES_KEY, JSON.stringify(profilesObject));
    } catch (error) {
      console.error('[ProfileStorage] Failed to save profiles to storage:', error);
      throw error; // Propagate error to caller
    }
  }

  static getInstance(): ProfileStorageService {
    if (!ProfileStorageService.instance) {
      ProfileStorageService.instance = new ProfileStorageService();
    }
    return ProfileStorageService.instance;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.profiles.get(userId) || null;
  }

  async saveProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const existingProfile = this.profiles.get(userId);
      const now = new Date();

      const updatedProfile: UserProfile = {
        ...(existingProfile || {
          id: `profile_${userId}`,
          userId,
          createdAt: now,
          displayName: '',
          avatarUrl: ''
        }),
        ...profile,
        updatedAt: now
      } as UserProfile;

      this.validateProfile(updatedProfile);
      this.profiles.set(userId, updatedProfile);
      this.saveProfilesToStorage();
      this.logModification(userId, 'PROFILE_UPDATE');

      return updatedProfile;
    } catch (error) {
      console.error(`[ProfileStorage] Failed to save profile for user ${userId}:`, error);
      throw new Error(`Failed to save profile: ${(error as Error).message}`);
    }
  }

  async deleteProfile(userId: string): Promise<boolean> {
    try {
      const deleted = this.profiles.delete(userId);
      if (deleted) {
        this.saveProfilesToStorage();
        this.logModification(userId, 'PROFILE_DELETE');
      }
      return deleted;
    } catch (error) {
      console.error(`[ProfileStorage] Failed to delete profile for user ${userId}:`, error);
      throw new Error(`Failed to delete profile: ${(error as Error).message}`);
    }
  }

  getModificationLog(): Array<{ timestamp: Date; userId: string; action: string }> {
    return [...this.modificationLog];
  }

  clearAllProfiles(): void {
    this.profiles.clear();
    this.modificationLog = [];
    sessionStorage.removeItem(PROFILES_KEY);
    console.log('[ProfileStorage] All profiles cleared');
  }

  private validateProfile(profile: UserProfile): void {
    const requiredFields = {
      userId: 'string',
      id: 'string',
      displayName: 'string'
    };

    for (const [field, type] of Object.entries(requiredFields)) {
      if (!profile[field as keyof UserProfile]) {
        if (field === 'displayName') {
          profile.displayName = profile.userId;
        } else {
          throw new Error(`Profile ${field} is required`);
        }
      } else if (typeof profile[field as keyof UserProfile] !== type) {
        throw new Error(`Profile ${field} must be a ${type}`);
      }
    }

    // Initialize optional fields with proper defaults
    profile.avatarUrl = profile.avatarUrl || '';
    profile.socialLinks = profile.socialLinks || {};
    profile.contactInfo = profile.contactInfo || {
      preferredContact: 'email'
    };
    profile.displayPreferences = profile.displayPreferences || {
      showProfilePicture: true,
      showCompanyLogo: true,
      showSocialLinks: true,
      showContactInfo: true,
      profileVisibility: 'public'
    };
  }

  private logModification(userId: string, action: string): void {
    this.modificationLog.push({
      timestamp: new Date(),
      userId,
      action,
    });
  }
}

export const profileStorage = ProfileStorageService.getInstance();