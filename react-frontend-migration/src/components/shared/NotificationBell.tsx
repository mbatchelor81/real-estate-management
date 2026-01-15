import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { NotificationBadge } from './NotificationBadge';
import type { Notification } from '@/types';

interface NotificationBellProps {
  notifications: Notification[];
  onDeleteNotification: (id: string) => Promise<void>;
  onMarkAsRead: (ids: string[]) => Promise<void>;
}

const DEBOUNCE_DELAY = 2000;
const MAX_VISIBLE_NOTIFICATIONS = 3;

export function NotificationBell({
  notifications,
  onDeleteNotification,
  onMarkAsRead,
}: NotificationBellProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const visibleNotifications = notifications.slice(0, MAX_VISIBLE_NOTIFICATIONS);
  const unreadNotifications = notifications.filter((item) => !item.read);

  const handleToggle = useCallback((): void => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleDelete = useCallback(
    (id: string): void => {
      void onDeleteNotification(id);
    },
    [onDeleteNotification]
  );

  const handleViewAll = useCallback((): void => {
    setIsOpen(false);
    setTimeout(() => {
      void navigate('/user/account/notifications');
    }, 500);
  }, [navigate]);

  const markUnreadAsRead = useCallback((): void => {
    if (unreadNotifications.length === 0) {
      return;
    }
    const ids = unreadNotifications.map((item) => item.id);
    onMarkAsRead(ids).catch((error: unknown) => {
      console.error('Failed to mark notifications as read:', error);
    });
  }, [unreadNotifications, onMarkAsRead]);

  useEffect(() => {
    if (isOpen && unreadNotifications.length > 0) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        markUnreadAsRead();
      }, DEBOUNCE_DELAY);
    }

    return (): void => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isOpen, unreadNotifications.length, markUnreadAsRead]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={!isAuthenticated}
        className="relative p-0 bg-transparent border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isAuthenticated ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
            <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth={2} />
          </svg>
        )}

        {unreadNotifications.length > 0 && (
          <span className="absolute -top-1 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white border border-slate-200 dark:border-slate-800">
            {unreadNotifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 min-w-[300px] md:min-w-[400px] rounded-md bg-gray-100 dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {visibleNotifications.length > 0 ? (
            <div className="p-4">
              <h1 className="text-base md:text-xl font-light m-0 p-0 mb-2">
                Notifications
              </h1>

              <ul className="flex flex-col gap-1 bg-transparent list-none p-0 m-0">
                {visibleNotifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="group p-2 bg-white dark:bg-gray-900 rounded-md border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <div className="flex flex-col w-full">
                      <NotificationBadge notificationType={notification.type} />
                      <p
                        className={`w-full flex justify-between items-start text-xs mt-1 ${
                          !notification.read ? 'font-bold' : ''
                        }`}
                      >
                        <span className="text-ellipsis line-clamp-1 group-hover:line-clamp-none">
                          {notification.message}
                        </span>

                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="hover:bg-red-700 py-1 px-2 ml-1 rounded-md bg-red-600 border border-slate-200 dark:border-slate-800"
                          aria-label={`Delete notification: ${notification.message}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex justify-center py-3 w-full">
                <button
                  onClick={handleViewAll}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-none"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          ) : (
            <div className="h-24 flex justify-center items-center text-lg">
              You have no notifications.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
