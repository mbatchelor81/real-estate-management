import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/user/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
