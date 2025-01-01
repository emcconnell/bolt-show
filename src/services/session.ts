import { Session } from '@supabase/supabase-js';
import { debugService } from './debug';

const SESSION_KEY = 'bolt_showcase_session';

export const sessionService = {
  /**
   * Get the current session from storage
   */
  getSession(): Session | null {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) {
      debugService.log('session', 'No Session Found');
      return null;
    }

    try {
      const session = JSON.parse(sessionStr);
      debugService.log('session', 'Session Retrieved', {
        userId: session.user?.id,
        expiresAt: session.expires_at
      });
      return session;
    } catch (error) {
      debugService.log('session', 'Session Parse Error', { error }, 'error');
      return null;
    }
  },

  /**
   * Set the current session in storage
   */
  setSession(session: Session | null) {
    if (!session) {
      debugService.log('session', 'Clearing Session');
      localStorage.removeItem(SESSION_KEY);
      return;
    }

    try {
      const sessionStr = JSON.stringify(session);
      localStorage.setItem(SESSION_KEY, sessionStr);
      debugService.log('session', 'Session Stored', {
        userId: session.user?.id,
        expiresAt: session.expires_at
      });
    } catch (error) {
      debugService.log('session', 'Session Store Error', { error }, 'error');
      throw error;
    }
  },

  /**
   * Verify if the current session is valid
   */
  verifySession(session: Session | null): boolean {
    if (!session) {
      debugService.log('session', 'Session Verification Failed', {
        reason: 'no_session'
      });
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const isValid = session.expires_at ? session.expires_at > now : false;

    debugService.log('session', 'Session Verification', {
      userId: session.user?.id,
      expiresAt: session.expires_at,
      isValid,
      now
    });

    return isValid;
  },

  /**
   * Initialize session from stored data
   */
  initializeSession(): Session | null {
    debugService.log('session', 'Initializing Session');
    const session = this.getSession();

    if (session && this.verifySession(session)) {
      debugService.log('session', 'Session Initialized', {
        userId: session.user?.id,
        expiresAt: session.expires_at
      });
      return session;
    }

    debugService.log('session', 'Session Initialization Failed');
    this.setSession(null);
    return null;
  }
}; 