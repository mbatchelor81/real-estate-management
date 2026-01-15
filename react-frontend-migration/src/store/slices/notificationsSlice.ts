import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Notification, MarkAsReadPayload } from '@/types';
import { notificationsApi } from '@/api/notifications';


interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  initialFetchDone: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  isLoading: false,
  error: null,
  initialFetchDone: false,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsApi.fetchNotifications();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (payload: MarkAsReadPayload, { rejectWithValue }) => {
    try {
      const response = await notificationsApi.markAsRead(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark notifications as read');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotifications: (state) => {
      state.notifications = [];
      state.initialFetchDone = false;
      state.error = null;
    },
    insertNotificationToState: (state, action: PayloadAction<Notification>) => {
      state.notifications = [action.payload, ...state.notifications];
    },
    removeNotificationsFromState: (state, action: PayloadAction<string[]>) => {
      state.notifications = state.notifications.filter(
        (notification) => !action.payload.includes(notification.id)
      );
    },
    setNotificationsAsReadInState: (state, action: PayloadAction<string[]>) => {
      state.notifications = state.notifications.map((notification) =>
        action.payload.includes(notification.id)
          ? { ...notification, read: true }
          : notification
      );
    },
    clearNotificationsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.initialFetchDone = true;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch notifications';
        state.initialFetchDone = true;
      })
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to mark notifications as read';
      });
  },
});

export const {
  resetNotifications,
  insertNotificationToState,
  removeNotificationsFromState,
  setNotificationsAsReadInState,
  clearNotificationsError,
} = notificationsSlice.actions;

export const selectNotifications = (state: { notifications: NotificationsState }): Notification[] =>
  state.notifications.notifications;
export const selectNotificationsLoading = (state: { notifications: NotificationsState }): boolean =>
  state.notifications.isLoading;
export const selectNotificationsError = (state: { notifications: NotificationsState }): string | null =>
  state.notifications.error;
export const selectNotificationsInitialFetchDone = (state: { notifications: NotificationsState }): boolean =>
  state.notifications.initialFetchDone;
export const selectUnreadNotificationsCount = (state: { notifications: NotificationsState }): number =>
  state.notifications.notifications.filter((n) => !n.read).length;

export default notificationsSlice.reducer;
