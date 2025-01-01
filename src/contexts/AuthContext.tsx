import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { sessionService } from '../services/session';
import { navigationService } from '../services/navigation';
import { debugService } from '../services/debug';
import type { User } from '../types/auth';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert Supabase user to our User type
function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name: supabaseUser.user_metadata?.name || '',
    avatar: supabaseUser.user_metadata?.avatar_url || '',
    role: supabaseUser.user_metadata?.role || 'user',
    status: 'active'
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    debugService.log('auth', 'Initializing Auth State');
    const session = sessionService.initializeSession();
    if (session) {
      setSession(session);
      setUser(mapSupabaseUser(session.user));
    }
    setIsLoading(false);
  }, []);

  // Listen for auth changes
  useEffect(() => {
    debugService.log('auth', 'Setting Up Auth Listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        debugService.log('auth', 'Auth State Change', { event, session });
        
        if (session) {
          setSession(session);
          setUser(mapSupabaseUser(session.user));
          sessionService.setSession(session);
        } else {
          setSession(null);
          setUser(null);
          sessionService.setSession(null);
        }
      }
    );

    return () => {
      debugService.log('auth', 'Cleaning Up Auth Listener');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    debugService.log('auth', 'Login Attempt', { email });
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.session || !data.user) {
        throw new Error('No session or user data returned');
      }

      debugService.log('auth', 'Login Success', {
        userId: data.user.id,
        email: data.user.email
      });

      const mappedUser = mapSupabaseUser(data.user);
      setSession(data.session);
      setUser(mappedUser);
      sessionService.setSession(data.session);

      const redirectPath = navigationService.getPostLoginPath(
        mappedUser.email,
        mappedUser.role
      );
      navigate(redirectPath);
    } catch (error) {
      debugService.log('auth', 'Login Error', { error }, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    debugService.log('auth', 'Logout Attempt');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      debugService.log('auth', 'Logout Success');
      setSession(null);
      setUser(null);
      sessionService.setSession(null);
      navigate('/login');
    } catch (error) {
      debugService.log('auth', 'Logout Error', { error }, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isAuthenticated: !!session,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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