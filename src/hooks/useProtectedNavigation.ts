import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export function useProtectedNavigation() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const navigateWithAuth = (path: string) => {
    if (!isAuthenticated) {
      // Store the intended destination
      sessionStorage.setItem('redirect_after_login', path);
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return { navigateWithAuth };
}