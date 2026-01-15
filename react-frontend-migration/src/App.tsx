import { useEffect, useCallback, useState, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import {
  useAppDispatch,
  useAppSelector,
  restoreSession,
  initializeAuth,
  restoreTheme,
  signOut,
  toggleDarkTheme,
  setSideMenuOpen,
  fetchEnquiries,
  fetchNotifications,
  resetEnquiries,
  resetNotifications,
  resetActivities,
  insertEnquiryToState,
  insertNotificationToState,
  insertActivity,
  removeNotificationsFromState,
  setNotificationsAsReadInState,
} from '@/store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { notificationsApi } from '@/api/notifications';
import type { UserSignedIn, Activity, Enquiry, Notification } from '@/types';

interface NavLink {
  title: string;
  path: string;
  icon: string;
  requiresAuth?: boolean;
  guestOnly?: boolean;
}

const MAIN_NAV_LINKS: NavLink[] = [
  { title: 'Map', path: '/map', icon: 'map' },
  { title: 'Properties', path: '/properties', icon: 'home' },
  { title: 'Enquiries', path: '/enquiries', icon: 'mail', requiresAuth: true },
  { title: 'Mortgage Calc', path: '/mortgage-calc', icon: 'calculator' },
  { title: 'Settings', path: '/settings', icon: 'cog' },
];

const LOWER_NAV_LINKS: NavLink[] = [
  { title: 'About', path: '/about', icon: 'info' },
];

const AUTH_NAV_LINKS: NavLink[] = [
  { title: 'Account', path: '/user/account', icon: 'user', requiresAuth: true },
];

const GUEST_NAV_LINKS: NavLink[] = [
  { title: 'Register', path: '/user/register', icon: 'user-plus', guestOnly: true },
  { title: 'Sign In', path: '/user/signin', icon: 'log-in', guestOnly: true },
];

function getIconSvg(iconName: string): React.ReactElement {
  switch (iconName) {
    case 'map':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      );
    case 'home':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case 'mail':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'calculator':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'cog':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'info':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'user':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'user-plus':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      );
    case 'log-in':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      );
    case 'log-out':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      );
    case 'menu':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case 'x':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'sun':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'moon':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
  }
}

export default function App(): React.ReactElement {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isInitialized } = useAppSelector((state) => state.auth);
  const { isDarkTheme, sideMenuOpen } = useAppSelector((state) => state.ui);
  const { enquiries } = useAppSelector((state) => state.enquiries);
  const { notifications } = useAppSelector((state) => state.notifications);
  const initialFetchDoneRef = useRef(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const unreadEnquiriesCount = enquiries.filter(
    (enquiry) => !enquiry.read && enquiry.users.to.user_id === user?.user_id
  ).length;

  const handleActivity = useCallback(
    (activity: Activity): void => {
      dispatch(insertActivity(activity));
    },
    [dispatch]
  );

  const handleEnquiry = useCallback(
    (enquiry: Enquiry): void => {
      dispatch(insertEnquiryToState(enquiry));
      toast.success(`New enquiry: ${enquiry.title}`);
    },
    [dispatch]
  );

  const handleUserNotification = useCallback(
    (notification: Notification): void => {
      dispatch(insertNotificationToState(notification));
      toast.success(notification.message);
    },
    [dispatch]
  );

  const handleLogout = useCallback((): void => {
    dispatch(signOut());
    dispatch(resetEnquiries());
    dispatch(resetNotifications());
    dispatch(resetActivities());
    void navigate('/');
    toast.success('You have been signed out');
  }, [dispatch, navigate]);

  const { connect, disconnect } = useWebSocket({
    onActivity: handleActivity,
    onEnquiry: handleEnquiry,
    onUserNotification: handleUserNotification,
    onLogout: handleLogout,
  });

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
      document.documentElement.classList.add('ion-palette-dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('ion-palette-dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkTheme]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (isAuthenticated && user?.token) {
      connect(user.token);

      if (!initialFetchDoneRef.current) {
        initialFetchDoneRef.current = true;
        void dispatch(fetchEnquiries());
        void dispatch(fetchNotifications());
      }
    } else {
      disconnect();
      initialFetchDoneRef.current = false;
      dispatch(resetEnquiries());
      dispatch(resetNotifications());
      dispatch(resetActivities());
    }
  }, [isAuthenticated, user?.token, isInitialized, connect, disconnect, dispatch]);

  useEffect(() => {
    return (): void => {
      disconnect();
    };
  }, [disconnect]);

  const handleToggleMenu = useCallback((): void => {
    dispatch(setSideMenuOpen(!sideMenuOpen));
  }, [dispatch, sideMenuOpen]);

  const handleCloseMenu = useCallback((): void => {
    dispatch(setSideMenuOpen(false));
  }, [dispatch]);

  const handleToggleTheme = useCallback((): void => {
    dispatch(toggleDarkTheme());
  }, [dispatch]);

  const handleSignOut = useCallback((): void => {
    setShowSignOutConfirm(true);
  }, []);

  const confirmSignOut = useCallback((): void => {
    setShowSignOutConfirm(false);
    disconnect();
    dispatch(signOut());
    dispatch(resetEnquiries());
    dispatch(resetNotifications());
    dispatch(resetActivities());
    void navigate('/');
    toast.success('You have been signed out');
  }, [dispatch, disconnect, navigate]);

  const cancelSignOut = useCallback((): void => {
    setShowSignOutConfirm(false);
  }, []);

  const handleDeleteNotification = useCallback(
    async (id: string): Promise<void> => {
      try {
        await notificationsApi.deleteNotification({ id });
        dispatch(removeNotificationsFromState([id]));
      } catch (error) {
        console.error('Failed to delete notification:', error);
        toast.error('Failed to delete notification');
      }
    },
    [dispatch]
  );

  const handleMarkNotificationsAsRead = useCallback(
    async (ids: string[]): Promise<void> => {
      try {
        await notificationsApi.markAsRead({ id: ids });
        dispatch(setNotificationsAsReadInState(ids));
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
      }
    },
    [dispatch]
  );

  const isLinkHidden = useCallback(
    (link: NavLink): boolean => {
      if (link.requiresAuth && !isAuthenticated) {
        return true;
      }
      if (link.guestOnly && isAuthenticated) {
        return true;
      }
      return false;
    },
    [isAuthenticated]
  );

  const getLowerNavLinks = useCallback((): NavLink[] => {
    const links = [...LOWER_NAV_LINKS];
    if (isAuthenticated) {
      return [...links, ...AUTH_NAV_LINKS];
    }
    return [...links, ...GUEST_NAV_LINKS];
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-center" />

      {sideMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={handleCloseMenu}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:translate-x-0 ${
          sideMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <Link to="/" className="flex items-center gap-2" onClick={handleCloseMenu}>
              <img src="/logo.png" alt="Logo" className="h-10 w-10" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Real Estate
              </span>
            </Link>
            <button
              onClick={handleCloseMenu}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
              aria-label="Close menu"
            >
              {getIconSvg('x')}
            </button>
          </div>

          {isAuthenticated && user && (
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {user.fullName}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {MAIN_NAV_LINKS.filter((link) => !isLinkHidden(link)).map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={handleCloseMenu}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {getIconSvg(link.icon)}
                    <span>{link.title}</span>
                    {link.path === '/enquiries' && unreadEnquiriesCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
                        {unreadEnquiriesCount}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

            <ul className="space-y-1">
              {getLowerNavLinks().map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={handleCloseMenu}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {getIconSvg(link.icon)}
                    <span>{link.title}</span>
                  </Link>
                </li>
              ))}
              {isAuthenticated && (
                <li>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {getIconSvg('log-out')}
                    <span>Sign Out</span>
                  </button>
                </li>
              )}
            </ul>
          </nav>

          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              onClick={handleToggleTheme}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {isDarkTheme ? getIconSvg('sun') : getIconSvg('moon')}
              <span>{isDarkTheme ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 bg-white shadow-sm dark:bg-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleMenu}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
                aria-label="Open menu"
              >
                {getIconSvg('menu')}
              </button>
              <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 lg:hidden">
                Real Estate
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell
                notifications={notifications}
                onDeleteNotification={handleDeleteNotification}
                onMarkAsRead={handleMarkNotificationsAsRead}
              />

              <button
                onClick={handleToggleTheme}
                className="hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:block"
                aria-label={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkTheme ? getIconSvg('sun') : getIconSvg('moon')}
              </button>

              {isAuthenticated && user && (
                <div className="hidden items-center gap-2 lg:flex">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Hi, {user.fullName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px-80px)] py-6">
          <Outlet />
        </main>

        <footer className="border-t bg-white py-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Real Estate Management. All rights reserved.
          </div>
        </footer>
      </div>

      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Are you sure?
            </h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              You will be signed out of your account.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelSignOut}
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
