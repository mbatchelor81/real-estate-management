import apiClient from './client';
import type { ApiResponse, Enquiry, CreateEnquiryPayload } from '@/types';

export interface EnquiriesResponse {
  items: Enquiry[];
}

export const enquiriesApi = {
  getEnquiries: async (): Promise<ApiResponse<Enquiry[]>> => {
    const response = await apiClient.get<ApiResponse<Enquiry[]>>('/enquiries');
    return response.data;
  },

  getEnquiry: async (id: string): Promise<ApiResponse<Enquiry>> => {
    const response = await apiClient.get<ApiResponse<Enquiry>>(`/enquiries/${id}`);
    return response.data;
  },

  createEnquiry: async (payload: CreateEnquiryPayload): Promise<ApiResponse<Enquiry>> => {
    const formData = {
      title: payload.title,
      content: payload.content,
      topic: payload.topic,
      property: {
        property_id: payload.property_id,
        name: payload.property_id,
      },
      userTo: payload.to_user_id,
      replyTo: payload.replyTo ? { enquiry_id: payload.replyTo } : undefined,
    };
    const response = await apiClient.post<ApiResponse<Enquiry>>('/enquiries', formData);
    return response.data;
  },

  deleteEnquiry: async (id: string): Promise<ApiResponse<{ status: number }>> => {
    const response = await apiClient.delete<ApiResponse<{ status: number }>>(`/enquiries/${id}`);
    return response.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<Enquiry>> => {
    const response = await apiClient.patch<ApiResponse<Enquiry>>(`/enquiries/${id}`, {
      read: true,
    });
    return response.data;
  },
};
