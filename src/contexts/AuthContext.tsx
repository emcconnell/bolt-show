import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/auth';
import { signIn, signUp, signOut } from '../services/supabase-auth';
import { getProfile, saveProfile } from '../services/supabase-profile';
import { backgroundSync } from '../utils/backgroundSync';
import { sessionManager } from '../utils/sessionManager';
import type { UserProfile } from '../types/models';
import { supabase } from '../config/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [persistedUser, setPersistedUser] = useState<User | null>(() => sessionManager.getPersistedUser());

  // Helper function to transform profile data
  const transformProfileData = (data: any): UserProfile => ({
    id: data.id,
    userId: data.user_id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url || '',
    bio: data.bio || '',
    company: data.company,
    location: data.location,
    website: data.website,
    companyLogo: data.company_logo,
    socialLinks: data.social_links,
    displayPreferences: data.display_preferences,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  });

  // Load initial auth state
  useEffect(() => {
    let mounted = true;
    
    // Clear any stale data
    if (!persistedUser) {
      localStorage.removeItem('bolt_showcase_session');
      sessionStorage.clear();
    }
    
    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // If no session but we have persisted user, try to restore session
        if (!session?.user && persistedUser) {
          try {
            const { data: { session: restoredSession } } = await supabase.auth.refreshSession();
            if (restoredSession?.user) {
              session = restoredSession;
            }
          } catch (error) {
            console.warn('Failed to restore session:', error);
            setPersistedUser(null);
            sessionStorage.clear();
          }
        }
        
        if (session?.user) {
          let userRole = 'user';
          
          // First try to get role from stored session
          const storedSession = localStorage.getItem('bolt_showcase_session');
          if (storedSession) {
            try {
              const { user: storedUser } = JSON.parse(storedSession);
              if (storedUser?.role) {
                userRole = storedUser.role;
              }
            } catch (error) {
              console.warn('Failed to parse stored session:', error);
            }
          }

          // Verify/update role from database
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (!userError && userData?.role) {
              userRole = userData.role;
            }
          } catch (error) {
            console.error('Failed to verify user role:', error);
          }

          // Transform user data
          const userInfo = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.name || '',
            avatar: session.user.user_metadata.avatar_url || '',
            role: userRole
          };

          if (mounted) {
            setUser(userInfo);
            setPersistedUser(userInfo);
            setLoading(false);
            
            localStorage.setItem('bolt_showcase_session', JSON.stringify({
              user: userInfo,
              timestamp: Date.now()
            }));

            // Load profile in background
            try {
              const userProfile = await getProfile(userInfo.id);
              if (mounted) {
                setProfile(userProfile);
              }
            } catch (error: any) {
              console.error('Failed to load profile:', error);
            }
          }
        } else {
          if (mounted) {
            setUser(null);
            setPersistedUser(null);
            setProfile(null);
            setLoading(false);
          }
          localStorage.removeItem('bolt_showcase_session');
          sessionStorage.clear();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        if (mounted) {
          setInitialized(true);
          setSessionChecked(true);
          setLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Subscribe to auth and profile changes
  useEffect(() => {
    // Don't set up subscriptions until initial session check
    if (!sessionChecked) {
      return;
    }

    let mounted = true;

    // Subscribe to profile changes
    const profileSubscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${user?.id}`
      }, payload => {
        if (payload.new) {
          if (mounted) {
            setProfile(transformProfileData(payload.new));
          }
        }
      })
      .subscribe();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setLoading(true);

        const userData = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || '',
          avatar: session.user.user_metadata.avatar_url || '',
          role: session.user.user_metadata.role || 'user'
        };
        if (mounted) {
          setUser(userData);
          
          // Update stored session
          localStorage.setItem('bolt_showcase_session', JSON.stringify({
            user: userData,
            timestamp: Date.now()
          }));
        }
        
        // Get initial profile after auth change
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (profile && mounted) {
          setProfile(transformProfileData(profile));
        }
        if (mounted) {
          setLoading(false);
        }
      } else {
        if (mounted) {
          setUser(null);
          localStorage.removeItem('bolt_showcase_session');
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      profileSubscription.unsubscribe();
      subscription.unsubscribe();
    };
  }, [sessionChecked, user?.id]);

  // Handle visibility changes and session restoration
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user?.id) {
        // Always refresh profile when tab becomes visible
        try {
          const userProfile = await getProfile(user.id);
          setProfile(userProfile);
        } catch (error) {
          console.error('Failed to refresh profile:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    const { user: userData } = await signIn(email, password);
    setUser(userData);
  };

  const logout = () => {
    signOut().then(() => {
      // Clear all Supabase-related localStorage keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear state
      setUser(null);
      setProfile(null);
      
      // Clear session storage
      sessionStorage.clear();
    }).catch(error => {
      console.error('Error during logout:', error);
    });
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    
    // TODO: Implement user metadata update with Supabase
    console.warn('User metadata updates not implemented yet');
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    
    // Register background sync task for profile update
    backgroundSync.registerTask('SYNC_PROFILE', {
      userId: user.id,
      updates: data
    }, 1);

    // Optimistically update local state
    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user: user || persistedUser,
        profile,
        loading, 
        initialized,
        login, 
        updateUser,
        updateProfile,
        logout,
        isAuthenticated: !!(user || persistedUser)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}