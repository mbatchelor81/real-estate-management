import apiClient from './client';
import type {
  ApiResponse,
  Notification,
  MarkAsReadPayload,
  DeleteNotificationPayload,
} from '@/types';

export const notificationsApi = {
  fetchNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
    return response.data;
  },

  markAsRead: async (payload: MarkAsReadPayload): Promise<ApiResponse<Notification[]>> => {
    const response = await apiClient.patch<ApiResponse<Notification[]>>('/notifications', payload);
    return response.data;
  },

  deleteNotification: async (payload: DeleteNotificationPayload): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>('/notifications', { data: payload });
    return response.data;
  },
};
