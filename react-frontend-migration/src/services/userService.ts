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
import type { AppDispatch, RootState } from '@/store/store';
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

interface UserServiceReturn {
  signIn: (credentials: SignInCredentials) => Promise<UserSignedIn | null>;
  register: (credentials: RegisterCredentials) => Promise<UserSignedIn | null>;
  googleAuth: (payload: GoogleAuthPayload) => Promise<UserSignedIn | null>;
  signOut: () => void;
  changePassword: (payload: ChangePasswordPayload) => Promise<boolean>;
  updateUser: (user: Partial<User>) => Promise<ApiResponse<User>>;
  getCurrentUser: () => Promise<ApiResponse<UserDetails>>;
  isPropertyOwner: (property: Property | null | undefined) => boolean;
  getStoredUser: () => UserSignedIn | null;
  restoreUserSession: () => void;
}

export function createUserService(
  dispatch: AppDispatch,
  getState: () => RootState
): UserServiceReturn {
  const signIn = async (credentials: SignInCredentials): Promise<UserSignedIn | null> => {
    const result = await dispatch(signInThunk(credentials));
    if (signInThunk.fulfilled.match(result)) {
      return result.payload;
    }
    return null;
  };

  const register = async (credentials: RegisterCredentials): Promise<UserSignedIn | null> => {
    const result = await dispatch(registerThunk(credentials));
    if (registerThunk.fulfilled.match(result)) {
      return result.payload;
    }
    return null;
  };

  const googleAuth = async (payload: GoogleAuthPayload): Promise<UserSignedIn | null> => {
    const result = await dispatch(googleAuthThunk(payload));
    if (googleAuthThunk.fulfilled.match(result)) {
      return result.payload;
    }
    return null;
  };

  const signOut = (): void => {
    dispatch(signOutAction());
  };

  const changePassword = async (payload: ChangePasswordPayload): Promise<boolean> => {
    const result = await dispatch(changePasswordThunk(payload));
    return changePasswordThunk.fulfilled.match(result);
  };

  const updateUser = async (user: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await authApi.updateUser(user);
    if (response.success) {
      const currentUser = getState().auth.user;
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
  };

  const getCurrentUser = async (): Promise<ApiResponse<UserDetails>> => {
    return authApi.getCurrentUser() as Promise<ApiResponse<UserDetails>>;
  };

  const isPropertyOwner = (property: Property | null | undefined): boolean => {
    const user = getState().auth.user;
    if (!user || !property) {
      return false;
    }
    return user.user_id === property.user_id;
  };

  const getStoredUser = (): UserSignedIn | null => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEY);
      if (userStr) {
        return JSON.parse(userStr) as UserSignedIn;
      }
    } catch (error) {
      console.error('Failed to parse stored user:', error);
    }
    return null;
  };

  const restoreUserSession = (): void => {
    const storedUser = getStoredUser();
    if (storedUser) {
      dispatch(restoreSession(storedUser));
    }
  };

  return {
    signIn,
    register,
    googleAuth,
    signOut,
    changePassword,
    updateUser,
    getCurrentUser,
    isPropertyOwner,
    getStoredUser,
    restoreUserSession,
  };
}

export function getUser(state: RootState): UserSignedIn | null {
  return state.auth.user;
}

export function getToken(state: RootState): string | null {
  return state.auth.user?.token ?? null;
}

export function getIsAuthenticated(state: RootState): boolean {
  return state.auth.isAuthenticated;
}

export function getAuthLoading(state: RootState): boolean {
  return state.auth.isLoading;
}

export function getAuthError(state: RootState): string | null {
  return state.auth.error;
}

export function isPropertyOwnerSelector(
  state: RootState,
  property: Property | null | undefined
): boolean {
  const user = state.auth.user;
  if (!user || !property) {
    return false;
  }
  return user.user_id === property.user_id;
}
