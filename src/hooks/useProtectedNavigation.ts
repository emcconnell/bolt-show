import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { navigationService } from '../services/navigation';
import { debugService } from '../services/debug';

export function useProtectedNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const navigateWithAuth = (path: string) => {
    debugService.log('navigation', 'Protected Navigation Attempt', {
      path,
      isAuthenticated,
      currentPath: location.pathname,
      user: user ? { id: user.id, email: user.email, role: user.role } : null
    });

    if (!isAuthenticated) {
      debugService.log('auth', 'Authentication Required', {
        requiredPath: path,
        redirectTo: '/login'
      });
      navigationService.setRedirectPath(path);
      navigate('/login');
    } else {
      debugService.log('navigation', 'Protected Navigation Success', {
        from: location.pathname,
        to: path,
        user: user ? { id: user.id, email: user.email, role: user.role } : null
      });
      navigate(path);
    }
  };

  return { navigateWithAuth };
}