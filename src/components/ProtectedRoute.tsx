import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireRole?: User['role'];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireRole,
  fallback = <Navigate to="/login" replace />
}: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth();

  // Show loading state only during initial auth check
  if (loading && !initialized) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return fallback;
  }
  
  // Check admin requirement
  if (requireAdmin) {
    if (user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }

  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}