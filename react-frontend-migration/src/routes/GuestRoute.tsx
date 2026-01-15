import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { LoadingSpinner } from '@/components/ui';

interface GuestRouteProps {
  children: React.ReactNode;
}

interface LocationState {
  from?: {
    pathname: string;
  };
}

export function GuestRoute({ children }: GuestRouteProps): React.ReactElement {
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const redirectPath = locationState?.from?.pathname ?? '/map';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated && user !== null) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
