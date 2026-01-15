import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps): React.ReactElement {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/map';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
