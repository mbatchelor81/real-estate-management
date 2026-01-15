import apiClient from './client';
import type {
  ApiResponse,
  UserSignedIn,
  SignInCredentials,
  RegisterCredentials,
  ChangePasswordPayload,
  GoogleAuthPayload,
  User,
} from '@/types';

export const authApi = {
  signIn: async (credentials: SignInCredentials): Promise<ApiResponse<UserSignedIn>> => {
    const response = await apiClient.post<ApiResponse<UserSignedIn>>('/auth/signin', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<ApiResponse<UserSignedIn>> => {
    const response = await apiClient.post<ApiResponse<UserSignedIn>>('/auth/register', credentials);
    return response.data;
  },

  googleAuth: async (payload: GoogleAuthPayload): Promise<ApiResponse<UserSignedIn>> => {
    const response = await apiClient.post<ApiResponse<UserSignedIn>>('/auth/google', payload);
    return response.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/change-password', payload);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data;
  },

  updateUser: async (user: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>('/users/me', user);
    return response.data;
  },
};
