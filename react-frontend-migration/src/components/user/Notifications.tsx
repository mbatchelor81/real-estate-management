import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { store } from '@/store/store';
import { NotificationBadge } from '@/components/shared/NotificationBadge';
import { createNotificationsService, getNotifications, getNotificationsLoading } from '@/services/notificationsService';
import type { Notification } from '@/types';

const DEBOUNCE_DELAY = 3000;

interface NotificationItemProps {
  notification: Notification;
  isChecked: boolean;
  onCheckChange: (id: string, checked: boolean) => void;
  onVisible: (id: string) => void;
}

function NotificationItem({
  notification,
  isChecked,
  onCheckChange,
  onVisible,
}: NotificationItemProps): React.ReactElement {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = itemRef.current;
    if (!element || notification.read) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !notification.read) {
          onVisible(notification.id);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return (): void => {
      observer.disconnect();
    };
  }, [notification.id, notification.read, onVisible]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onCheckChange(notification.id, e.target.checked);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div
      ref={itemRef}
      className={`flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-md ${
        !notification.read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
      }`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label={`Select notification: ${notification.message}`}
      />
      <div className="flex flex-col md:flex-row md:items-center flex-1 gap-2">
        <span className="text-sm md:text-base text-ellipsis line-clamp-1 flex-1">
          {notification.message}
        </span>
        <div className="flex items-center gap-2">
          <NotificationBadge notificationType={notification.type} />
          <span className="text-xs md:text-sm text-gray-500">
            {formatDate(notification.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Notifications(): React.ReactElement {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(getNotifications);
  const isLoading = useAppSelector(getNotificationsLoading);

  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const notificationsToReadRef = useRef<string[]>([]);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processingReadRef = useRef(false);

  const notificationsService = useMemo(
    () => createNotificationsService(dispatch, () => store.getState()),
    [dispatch]
  );

  const markNotificationsAsRead = useCallback(async (): Promise<void> => {
    if (notificationsToReadRef.current.length === 0 || processingReadRef.current) {
      return;
    }

    processingReadRef.current = true;
    const idsToMark = [...notificationsToReadRef.current];
    notificationsToReadRef.current = [];

    const result = await notificationsService.markAsRead(idsToMark);
    if (result && result.length > 0) {
      notificationsService.setNotificationsAsReadFromState(result.map((n) => n.id));
    }

    processingReadRef.current = false;
  }, [notificationsService]);

  const handleNotificationVisible = useCallback(
    (id: string): void => {
      if (!notificationsToReadRef.current.includes(id)) {
        notificationsToReadRef.current.push(id);

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          void markNotificationsAsRead();
        }, DEBOUNCE_DELAY);
      }
    },
    [markNotificationsAsRead]
  );

  const handleCheckChange = useCallback((id: string, checked: boolean): void => {
    setCheckedIds((prev) => {
      if (checked) {
        return [...prev, id];
      }
      return prev.filter((item) => item !== id);
    });
  }, []);

  const handleDeleteSelected = useCallback(async (): Promise<void> => {
    if (checkedIds.length === 0) {
      return;
    }

    setIsDeleting(true);

    const response = await notificationsService.deleteNotification(checkedIds);

    if (response.success) {
      setToastMessage({ text: response.message ?? 'Notifications deleted successfully', type: 'success' });
      setCheckedIds([]);
    } else {
      setToastMessage({ text: response.message ?? 'Failed to delete notifications', type: 'error' });
    }

    setIsDeleting(false);

    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  }, [checkedIds, notificationsService]);

  useEffect(() => {
    return (): void => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full px-3 lg:px-8 py-4">
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
        <div className="bg-blue-600 px-4 py-3 rounded-t-lg flex flex-row justify-between items-center">
          <h1 className="text-xl md:text-2xl text-white font-semibold">
            Notifications
            {checkedIds.length > 0 && (
              <span className="text-base font-normal ml-2">
                - Selected ({checkedIds.length})
              </span>
            )}
          </h1>

          {checkedIds.length > 0 && (
            <button
              onClick={() => void handleDeleteSelected()}
              disabled={isDeleting || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors"
              aria-label="Delete selected notifications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              Delete
            </button>
          )}
        </div>

        <div className="p-4">
          {notifications.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isChecked={checkedIds.includes(notification.id)}
                  onCheckChange={handleCheckChange}
                  onVisible={handleNotificationVisible}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500">You have no notifications.</p>
            </div>
          )}
        </div>
      </div>

      {toastMessage && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg z-50 ${
            toastMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}
          role="alert"
        >
          {toastMessage.text}
        </div>
      )}
    </div>
  );
}
