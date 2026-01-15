import type { UserNotificationType } from './notification';

export enum ActivityType {
  EnquiryNew = 'ENQUIRY_NEW',
  EnquiryDelete = 'ENQUIRY_DELETE',
  PropertyNew = 'PROPERTY_NEW',
  PropertyDelete = 'PROPERTY_DELETE',
  PropertyUpdate = 'PROPERTY_UPDATE',
  UserLogin = 'USER_LOGIN',
  UserLogout = 'USER_LOGOUT',
  UserRegister = 'USER_REGISTER',
  UserUpdate = 'USER_UPDATE',
}

export interface User {
  user_id: string;
  fullName: string;
  email: string;
  properties?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSignedIn extends User {
  token: string;
}

export interface UserDetails extends User {
  activities: Activity[];
  notifications: Notification[];
}

export interface Activity {
  action: string;
  description: string;
  property_id?: string;
  enquiry_id?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  type: UserNotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  passwordCurrent: string;
  passwordNew: string;
}

export interface GoogleAuthPayload {
  credential: string;
  clientId: string;
}
