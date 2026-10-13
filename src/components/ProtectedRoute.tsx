import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CREATOR_OPEN_PATHS = ['/creator/onboarding', '/creator/pending', '/creator/profile'];

export function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'seeker' | 'creator' }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'creator' ? '/creator/dashboard' : '/customer/home'} replace />;
  }

  if (role === 'creator' && user?.creatorStatus !== 'approved') {
    const isOpenPath = CREATOR_OPEN_PATHS.some((p) => location.pathname.startsWith(p));
    if (!isOpenPath) {
      if (user?.creatorStatus === 'pending_verification' || user?.creatorStatus === 'under_review') {
        return <Navigate to="/creator/pending" replace />;
      }
      return <Navigate to="/creator/onboarding" replace />;
    }
  }

  return <>{children}</>;
}
