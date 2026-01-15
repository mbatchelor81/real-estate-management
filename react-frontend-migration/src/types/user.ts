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
  type: string;
  description: string;
  date: string;
}

export interface Notification {
  id: string;
  type: string;
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
