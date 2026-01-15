import apiClient from './client';
import type { ApiResponse, Property, PropertyFilters, PropertiesResponse } from '@/types';

export const propertiesApi = {
  getProperties: async (filters: PropertyFilters = {}): Promise<ApiResponse<PropertiesResponse>> => {
    const params = new URLSearchParams();
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.filter) params.append('filter', filters.filter);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.lastCreatedAt) params.append('lastCreatedAt', filters.lastCreatedAt);
    if (filters.lastPrice) params.append('lastPrice', filters.lastPrice);
    if (filters.lastName) params.append('lastName', filters.lastName);

    const response = await apiClient.get<ApiResponse<PropertiesResponse>>(
      `/properties?${params.toString()}`
    );
    return response.data;
  },

  getProperty: async (id: string): Promise<ApiResponse<Property>> => {
    const response = await apiClient.get<ApiResponse<Property>>(`/properties/${id}`);
    return response.data;
  },

  createProperty: async (property: Omit<Property, 'property_id'>): Promise<ApiResponse<Property>> => {
    const response = await apiClient.post<ApiResponse<Property>>('/properties', property);
    return response.data;
  },

  updateProperty: async (id: string, property: Partial<Property>): Promise<ApiResponse<Property>> => {
    const response = await apiClient.patch<ApiResponse<Property>>(`/properties/${id}`, property);
    return response.data;
  },

  deleteProperty: async (id: string): Promise<ApiResponse<Property>> => {
    const response = await apiClient.delete<ApiResponse<Property>>(`/properties/${id}`);
    return response.data;
  },

  getOwnedProperties: async (): Promise<ApiResponse<Property[]>> => {
    const response = await apiClient.get<ApiResponse<Property[]>>('/properties/me');
    return response.data;
  },

  uploadImages: async (id: string, files: File[]): Promise<ApiResponse<string[]>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post<ApiResponse<string[]>>(
      `/properties/upload/images/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteImages: async (id: string, images: string[]): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.delete<ApiResponse<string[]>>(
      `/properties/upload/images/${id}`,
      { data: { images } }
    );
    return response.data;
  },
};
