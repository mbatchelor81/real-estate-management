import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';
import App from '@/App';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const MapPage = lazy(() => import('@/pages/Map/MapPage'));
const PropertiesPage = lazy(() => import('@/pages/Properties/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('@/pages/Properties/PropertyDetailPage'));
const MortgageCalcPage = lazy(() => import('@/pages/MortgageCalc/MortgageCalcPage'));
const EnquiriesPage = lazy(() => import('@/pages/Enquiries/EnquiriesPage'));
const UserSignInPage = lazy(() => import('@/pages/User/UserSignInPage'));
const UserRegisterPage = lazy(() => import('@/pages/User/UserRegisterPage'));
const UserProfilePage = lazy(() => import('@/pages/User/UserProfilePage'));
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage'));
const AboutPage = lazy(() => import('@/pages/About/AboutPage'));

function SuspenseWrapper({ children }: { children: React.ReactNode }): React.ReactElement {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/map" replace />,
      },
      {
        path: 'map',
        element: (
          <SuspenseWrapper>
            <MapPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'properties',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <PropertiesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <SuspenseWrapper>
                <PropertyDetailPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'mortgage-calc',
        element: (
          <SuspenseWrapper>
            <MortgageCalcPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'enquiries',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <EnquiriesPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'user',
        children: [
          {
            path: 'signin',
            element: (
              <GuestRoute>
                <SuspenseWrapper>
                  <UserSignInPage />
                </SuspenseWrapper>
              </GuestRoute>
            ),
          },
          {
            path: 'register',
            element: (
              <GuestRoute>
                <SuspenseWrapper>
                  <UserRegisterPage />
                </SuspenseWrapper>
              </GuestRoute>
            ),
          },
          {
            path: 'profile',
            element: (
              <ProtectedRoute>
                <SuspenseWrapper>
                  <UserProfilePage />
                </SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'settings',
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'about',
        element: (
          <SuspenseWrapper>
            <AboutPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);
