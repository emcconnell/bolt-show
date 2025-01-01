import { supabase } from '../config/supabase';
import { sessionService } from './session';
import { signIn } from './supabase-auth';
import { getProfile } from './supabase-profile';
import type { User, AuthResponse } from '../types/auth';
import type { UserProfile } from '../types/models';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
}

interface AuthResult {
  success: boolean;
  state: AuthState;
  error?: string;
}

export const authFlow = {
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Step 1: Sign in and get session
      console.log('🔑 [Auth] Starting login process...');
      const { session, user: userData } = await signIn(email, password);

      if (!session) {
        console.error('❌ [Auth] No session returned from login');
        return { success: false, state: { user: null, profile: null }, error: 'No session returned from login' };
      }

      // Step 2: Set session in Supabase client
      console.log('🔄 [Auth] Setting session in Supabase client...');
      const sessionSet = await sessionService.setSession(session.access_token, session.refresh_token);
      if (!sessionSet) {
        console.error('❌ [Auth] Failed to set session in Supabase client');
        return { success: false, state: { user: null, profile: null }, error: 'Failed to set session' };
      }

      // Step 3: Store session in local storage
      console.log('💾 [Auth] Storing session...');
      const sessionStored = sessionService.storeSession({
        user: userData,
        timestamp: Date.now(),
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
      if (!sessionStored) {
        console.error('❌ [Auth] Failed to store session');
        return { success: false, state: { user: null, profile: null }, error: 'Failed to store session' };
      }

      // Step 4: Load user profile
      console.log('👤 [Auth] Loading user profile...');
      const profile = await getProfile(userData.id);
      if (!profile) {
        console.warn('⚠️ [Auth] No profile found for user');
      }

      // Step 5: Verify final session state
      console.log('✅ [Auth] Verifying final session state...');
      const finalSession = await sessionService.getSession();
      if (!finalSession) {
        console.error('❌ [Auth] Final session verification failed');
        return { success: false, state: { user: null, profile: null }, error: 'Session verification failed' };
      }

      console.log('✨ [Auth] Login process completed successfully');
      return {
        success: true,
        state: {
          user: userData,
          profile
        }
      };
    } catch (error) {
      console.error('❌ [Auth] Login process failed:', error);
      // Clean up any partial state
      await this.cleanup();
      return {
        success: false,
        state: { user: null, profile: null },
        error: error instanceof Error ? error.message : 'Unknown error during login'
      };
    }
  },

  async cleanup() {
    console.log('🧹 [Auth] Cleaning up auth state...');
    sessionService.clearSession();
    await supabase.auth.signOut();
  }
}; 