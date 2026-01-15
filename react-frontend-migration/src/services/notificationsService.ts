import {
  fetchNotifications as fetchNotificationsThunk,
  markAsRead as markAsReadThunk,
  insertNotificationToState as insertNotificationAction,
  removeNotificationsFromState as removeNotificationsAction,
  setNotificationsAsReadInState,
  resetNotifications,
} from '@/store/slices/notificationsSlice';
import { notificationsApi } from '@/api/notifications';
import type { AppDispatch, RootState } from '@/store/store';
import type { ApiResponse, Notification, DeleteNotificationPayload } from '@/types';

interface NotificationsServiceReturn {
  fetchNotifications: () => Promise<Notification[] | null>;
  markAsRead: (id: string | string[]) => Promise<Notification[] | null>;
  deleteNotification: (id: string | string[]) => Promise<ApiResponse<void>>;
  insertNotificationToState: (notification: Notification) => void;
  removeNotificationsFromState: (ids: string[]) => void;
  setNotificationsAsReadFromState: (ids: string[]) => void;
  resetState: () => void;
}

export function createNotificationsService(
  dispatch: AppDispatch,
  _getState: () => RootState
): NotificationsServiceReturn {
  const fetchNotifications = async (): Promise<Notification[] | null> => {
    const result = await dispatch(fetchNotificationsThunk());
    if (fetchNotificationsThunk.fulfilled.match(result)) {
      return result.payload;
    }
    return null;
  };

  const markAsRead = async (id: string | string[]): Promise<Notification[] | null> => {
    if ((Array.isArray(id) && id.length === 0) || (!Array.isArray(id) && !id)) {
      return null;
    }
    const result = await dispatch(markAsReadThunk({ id }));
    if (markAsReadThunk.fulfilled.match(result)) {
      return result.payload;
    }
    return null;
  };

  const deleteNotification = async (id: string | string[]): Promise<ApiResponse<void>> => {
    const payload: DeleteNotificationPayload = { id };
    const response = await notificationsApi.deleteNotification(payload);
    if (response.success) {
      const ids = Array.isArray(id) ? id : [id];
      dispatch(removeNotificationsAction(ids));
    }
    return response;
  };

  const insertNotificationToState = (notification: Notification): void => {
    dispatch(insertNotificationAction(notification));
  };

  const removeNotificationsFromState = (ids: string[]): void => {
    dispatch(removeNotificationsAction(ids));
  };

  const setNotificationsAsReadFromState = (ids: string[]): void => {
    dispatch(setNotificationsAsReadInState(ids));
  };

  const resetState = (): void => {
    dispatch(resetNotifications());
  };

  return {
    fetchNotifications,
    markAsRead,
    deleteNotification,
    insertNotificationToState,
    removeNotificationsFromState,
    setNotificationsAsReadFromState,
    resetState,
  };
}

export function getNotifications(state: RootState): Notification[] {
  return state.notifications.notifications;
}

export function getNotificationsLoading(state: RootState): boolean {
  return state.notifications.isLoading;
}

export function getNotificationsError(state: RootState): string | null {
  return state.notifications.error;
}

export function getNotificationsInitialFetchDone(state: RootState): boolean {
  return state.notifications.initialFetchDone;
}

export function getUnreadNotificationsCount(state: RootState): number {
  return state.notifications.notifications.filter((n) => !n.read).length;
}
