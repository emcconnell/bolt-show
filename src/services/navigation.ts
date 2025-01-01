import { debugService } from './debug';

const REDIRECT_KEY = 'redirect_after_login';

export const navigationService = {
  /**
   * Store a path to redirect to after login
   */
  setRedirectPath(path: string) {
    debugService.log('navigation', 'Store Redirect Path', { path });
    sessionStorage.setItem(REDIRECT_KEY, path);
  },

  /**
   * Get and clear the stored redirect path
   */
  getRedirectPath(): string | null {
    const path = sessionStorage.getItem(REDIRECT_KEY);
    if (path) {
      debugService.log('navigation', 'Retrieved Redirect Path', { path });
      sessionStorage.removeItem(REDIRECT_KEY);
      debugService.log('navigation', 'Cleared Redirect Path');
    }
    return path;
  },

  /**
   * Clear any stored navigation state
   */
  clearNavigationState() {
    debugService.log('navigation', 'Clear Navigation State');
    sessionStorage.removeItem(REDIRECT_KEY);
  },

  /**
   * Get the default path for a user based on their role
   */
  getDefaultPath(email: string, role: string): string {
    if (email === 'admin@admin.com' || role === 'admin') {
      const path = '/admin';
      debugService.log('navigation', 'Get Default Path', {
        email,
        role,
        path,
        reason: 'admin_user'
      });
      return path;
    }
    const path = '/explore';
    debugService.log('navigation', 'Get Default Path', {
      email,
      role,
      path,
      reason: 'standard_user'
    });
    return path;
  },

  /**
   * Determine where to navigate after login
   */
  getPostLoginPath(email: string, role: string): string {
    const redirectPath = this.getRedirectPath();
    if (redirectPath) {
      debugService.log('navigation', 'Using Redirect Path', {
        email,
        role,
        path: redirectPath,
        source: 'stored_redirect'
      });
      return redirectPath;
    }
    const defaultPath = this.getDefaultPath(email, role);
    debugService.log('navigation', 'Using Default Path', {
      email,
      role,
      path: defaultPath,
      source: 'default_path'
    });
    return defaultPath;
  }
}; 