import { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppDispatch, useAppSelector, restoreSession, initializeAuth, restoreTheme } from '@/store';
import type { UserSignedIn } from '@/types';

export default function App(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { isDarkTheme } = useAppSelector((state) => state.ui);
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as UserSignedIn;
        dispatch(restoreSession(parsedUser));
      } catch {
        localStorage.removeItem('user');
        dispatch(initializeAuth());
      }
    } else {
      dispatch(initializeAuth());
    }
    dispatch(restoreTheme());
  }, [dispatch]);

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  const navLinks = [
    { path: '/map', label: 'Map' },
    { path: '/properties', label: 'Properties' },
    { path: '/mortgage-calc', label: 'Mortgage Calculator' },
    { path: '/about', label: 'About' },
  ];

  const authLinks = isAuthenticated
    ? [
        { path: '/enquiries', label: 'Enquiries' },
        { path: '/user/profile', label: 'Profile' },
      ]
    : [
        { path: '/user/signin', label: 'Sign In' },
        { path: '/user/register', label: 'Register' },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold text-blue-600">
            Real Estate Management
          </Link>
          <div className="flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  location.pathname === link.path ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-4 border-l pl-4">
              {authLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`ml-4 text-sm font-medium transition-colors hover:text-blue-600 ${
                    location.pathname === link.path ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && user && (
                <span className="ml-4 text-sm text-gray-500">Hi, {user.fullName}</span>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Real Estate Management. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
