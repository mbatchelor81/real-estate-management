import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/user/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
