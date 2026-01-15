import type { Activity, Notification } from './user';
import type { Enquiry } from './enquiry';

export enum SocketNotificationType {
  Activity = 'ACTIVITY',
  Enquiry = 'ENQUIRY',
  Logout = 'USER_LOGOUT',
  User = 'USER',
}

export interface WebSocketNotification {
  type: SocketNotificationType;
  payload: Activity | Enquiry | Notification;
}

export enum WebSocketReadyState {
  Connecting = 0,
  Open = 1,
  Closing = 2,
  Closed = 3,
}

export interface UseWebSocketOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onActivity?: (activity: Activity) => void;
  onEnquiry?: (enquiry: Enquiry) => void;
  onUserNotification?: (notification: Notification) => void;
  onLogout?: () => void;
}

export interface UseWebSocketReturn {
  connect: (token: string) => void;
  disconnect: () => void;
  send: (message: string) => void;
  isConnected: boolean;
  readyState: WebSocketReadyState;
}
