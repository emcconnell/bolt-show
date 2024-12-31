import type { User, AuthResponse, SignupData } from '../types/auth';
import { hashPassword, verifyPassword } from '../utils/auth';
import type { UserProfile } from '../types/models';
import { profileStorage } from './profile-storage';
import { getRandomDefaultImage } from './default-images';

export const MOCK_USERS: User[] = [];

const users: User[] = [
  {
    id: '1',
    email: 'user@user.com',
    name: 'Demo User',
    passwordHash: '',
    avatar: getRandomDefaultImage().url,
    role: 'user',
    isTestAccount: true
  },
  {
    id: '2',
    email: 'business@user.com',
    name: 'Business User',
    passwordHash: '',
    avatar: getRandomDefaultImage().url,
    role: 'business',
    isTestAccount: true
  },
  {
    id: 'admin',
    email: 'admin@admin.com',
    name: 'Test Administrator',
    passwordHash: '',
    avatar: getRandomDefaultImage().url,
    role: 'admin',
    isTestAccount: true
  }
];

// Initialize default profiles for test accounts
const initializeTestProfiles = () => {
  users.forEach(user => {
    const defaultProfile = {
      id: `profile_${user.id}`,
      userId: user.id,
      displayName: user.name,
      avatarUrl: user.avatar,
      bio: `This is a test account for ${user.role} role.`,
      company: user.role === 'business' ? 'Test Company' : undefined,
      website: 'https://sqyer.com',
      displayPreferences: {
        showProfilePicture: true,
        showCompanyLogo: false,
        showSocialLinks: true,
        showContactInfo: false,
        profileVisibility: 'public'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log(`[Auth] Initializing test profile for ${user.id}:`, defaultProfile);
    updateUserProfile(user.id, defaultProfile);
  });
};

export function updateUserProfile(userId: string, profileData: Partial<UserProfile>) {
  // Ensure we're not passing undefined values
  const cleanedData = Object.fromEntries(
    Object.entries(profileData).filter(([_, value]) => value !== undefined)
  );

  return profileStorage.saveProfile(userId, cleanedData);
}

export function getUserProfile(userId: string): UserProfile | null {
  return profileStorage.getProfile(userId);
}

export function updateMockUser(userId: string, updates: Partial<User>) {
  const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...updates };
  }
}

// Initialize mock users with hashed passwords
Promise.all(users.map(async user => {
  const hash = await hashPassword('demo123$');
  MOCK_USERS.push({ ...user, passwordHash: hash });
})).then(() => {
  // Initialize test profiles after users are created
  initializeTestProfiles();
});

export function login(email: string, password: string): Promise<AuthResponse> {
  return new Promise((resolve, reject) => {
    // Simulate API call delay
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email);

      if (!user) {
        reject(new Error('Invalid credentials. If you\'re having trouble accessing your account, try the Forgot Password link above. If that doesn\'t work contact <a href="https://sqyer.com" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300">SQYER</a>.'));
        return;
      }

      verifyPassword(password, user.passwordHash).then(isValid => {
        if (isValid) {
          // Generate a mock JWT token
          const token = `mock_token_${user.id}_${Date.now()}`;
          
          // Ensure profile exists
          const profile = getUserProfile(user.id);
          if (!profile) {
            updateUserProfile(user.id, {
              displayName: user.name,
              avatarUrl: user.avatar,
              displayPreferences: {
                showProfilePicture: true,
                showCompanyLogo: false,
                showSocialLinks: true,
                showContactInfo: false,
                profileVisibility: 'public'
              }
            });
          }
          
          resolve({
            user,
            token
          });
        } else {
          reject(new Error('Invalid credentials. If you\'re having trouble accessing your account, try the Forgot Password link above. If that doesn\'t work contact <a href="https://sqyer.com" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300">SQYER</a>.'));
        }
      });
    }, 800);
  });
}

export function signup(data: SignupData): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if email already exists
      const existingUser = MOCK_USERS.find(u => u.email === data.email);
      
      if (existingUser) {
        reject(new Error('Email already registered'));
        return;
      }
      
      // In a real app, we would save the user to a database here
      const newUser = {
        id: `user_${Date.now()}`,
        email: data.email,
        name: data.username,
        passwordHash: '',
        avatar: getRandomDefaultImage().url,
        role: 'user',
        status: 'active', // Automatically set as active
        createdAt: new Date()
      };
      
      // Hash the password before storing
      hashPassword(data.password).then(async hash => {
        newUser.passwordHash = hash;
        MOCK_USERS.push(newUser);
        
        // Create default profile with showContactInfo set to false
        await updateUserProfile(newUser.id, {
          displayName: newUser.name,
          avatarUrl: newUser.avatar,
          displayPreferences: {
            showProfilePicture: true,
            showCompanyLogo: false,
            showSocialLinks: true,
            showContactInfo: false,
            profileVisibility: 'public'
          }
        });
        
        resolve({
          success: true,
          message: 'Signup successful! You can now login to your account.'
        });
      });
    }, 800);
  });
}