import { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { store } from '@/store/store';
import { authApi } from '@/api/auth';
import {
  signIn as signInThunk,
  register as registerThunk,
  googleAuth as googleAuthThunk,
  changePassword as changePasswordThunk,
  signOut as signOutAction,
  setUser as setUserAction,
  restoreSession,
} from '@/store/slices/authSlice';
import type {
  ApiResponse,
  User,
  UserSignedIn,
  UserDetails,
  SignInCredentials,
  RegisterCredentials,
  ChangePasswordPayload,
  GoogleAuthPayload,
  Property,
} from '@/types';

const STORAGE_KEY = 'user';

interface UseUserServiceReturn {
  user: UserSignedIn | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (credentials: SignInCredentials) => Promise<UserSignedIn | null>;
  register: (credentials: RegisterCredentials) => Promise<UserSignedIn | null>;
  googleAuth: (payload: GoogleAuthPayload) => Promise<UserSignedIn | null>;
  signOut: () => void;
  changePassword: (payload: ChangePasswordPayload) => Promise<boolean>;
  updateUser: (user: Partial<User>) => Promise<ApiResponse<User>>;
  getCurrentUser: () => Promise<ApiResponse<UserDetails>>;
  isPropertyOwner: (property: Property | null | undefined) => boolean;
  restoreUserSession: () => void;
}

export function useUserService(): UseUserServiceReturn {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const error = useAppSelector((state) => state.auth.error);

  const token = useMemo(() => user?.token ?? null, [user]);

  const signIn = useCallback(
    async (credentials: SignInCredentials): Promise<UserSignedIn | null> => {
      const result = await dispatch(signInThunk(credentials));
      if (signInThunk.fulfilled.match(result)) {
        return result.payload;
      }
      return null;
    },
    [dispatch]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<UserSignedIn | null> => {
      const result = await dispatch(registerThunk(credentials));
      if (registerThunk.fulfilled.match(result)) {
        return result.payload;
      }
      return null;
    },
    [dispatch]
  );

  const googleAuth = useCallback(
    async (payload: GoogleAuthPayload): Promise<UserSignedIn | null> => {
      const result = await dispatch(googleAuthThunk(payload));
      if (googleAuthThunk.fulfilled.match(result)) {
        return result.payload;
      }
      return null;
    },
    [dispatch]
  );

  const signOut = useCallback((): void => {
    dispatch(signOutAction());
  }, [dispatch]);

  const changePassword = useCallback(
    async (payload: ChangePasswordPayload): Promise<boolean> => {
      const result = await dispatch(changePasswordThunk(payload));
      return changePasswordThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const updateUser = useCallback(
    async (userData: Partial<User>): Promise<ApiResponse<User>> => {
      const response = await authApi.updateUser(userData);
      if (response.success) {
        const currentUser = store.getState().auth.user;
        if (currentUser) {
          const updatedUser: UserSignedIn = {
            ...currentUser,
            ...response.data,
          };
          dispatch(setUserAction(updatedUser));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
        }
      }
      return response;
    },
    [dispatch]
  );

  const getCurrentUser = useCallback(async (): Promise<ApiResponse<UserDetails>> => {
    return authApi.getCurrentUser() as Promise<ApiResponse<UserDetails>>;
  }, []);

  const isPropertyOwner = useCallback(
    (property: Property | null | undefined): boolean => {
      if (!user || !property) {
        return false;
      }
      return user.user_id === property.user_id;
    },
    [user]
  );

  const restoreUserSession = useCallback((): void => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEY);
      if (userStr) {
        const storedUser = JSON.parse(userStr) as UserSignedIn;
        dispatch(restoreSession(storedUser));
      }
    } catch (err) {
      console.error('Failed to restore user session:', err);
    }
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    register,
    googleAuth,
    signOut,
    changePassword,
    updateUser,
    getCurrentUser,
    isPropertyOwner,
    restoreUserSession,
  };
}
