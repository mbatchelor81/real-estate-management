import apiClient from './client';
import type { ApiResponse, Activity } from '@/types';

export const activitiesApi = {
  getActivities: async (): Promise<ApiResponse<Activity[]>> => {
    const response = await apiClient.get<ApiResponse<Activity[]>>('/activities');
    return response.data;
  },
};
