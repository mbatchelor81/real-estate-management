import { useCallback, useEffect, useRef, useState } from 'react';
import type { Activity, Notification, Enquiry } from '@/types';
import {
  SocketNotificationType,
  WebSocketReadyState,
  type UseWebSocketOptions,
  type UseWebSocketReturn,
  type WebSocketNotification,
} from '@/types';

const DEFAULT_RECONNECT_ATTEMPTS = 5;
const DEFAULT_RECONNECT_INTERVAL = 3000;

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/websocket';

function parseMessage(message: string): WebSocketNotification | string {
  try {
    const parsedMessage = JSON.parse(message) as WebSocketNotification;
    return parsedMessage;
  } catch {
    return message;
  }
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    reconnectAttempts = DEFAULT_RECONNECT_ATTEMPTS,
    reconnectInterval = DEFAULT_RECONNECT_INTERVAL,
    onActivity,
    onEnquiry,
    onUserNotification,
    onLogout,
  } = options;

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = useRef<string | null>(null);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [readyState, setReadyState] = useState<WebSocketReadyState>(WebSocketReadyState.Closed);

  const handleNotification = useCallback(
    (notification: WebSocketNotification): void => {
      switch (notification.type) {
        case SocketNotificationType.Activity:
          onActivity?.(notification.payload as Activity);
          break;

        case SocketNotificationType.Enquiry:
          onEnquiry?.(notification.payload as Enquiry);
          break;

        case SocketNotificationType.User:
          onUserNotification?.(notification.payload as Notification);
          break;

        case SocketNotificationType.Logout:
          onLogout?.();
          break;

        default:
          break;
      }
    },
    [onActivity, onEnquiry, onUserNotification, onLogout]
  );

  const clearReconnectTimeout = useCallback((): void => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connectRef = useRef<((token: string) => void) | null>(null);

  const attemptReconnect = useCallback((): void => {
    if (reconnectAttemptsRef.current >= reconnectAttempts) {
      return;
    }

    if (!tokenRef.current) {
      return;
    }

    reconnectAttemptsRef.current += 1;
    const delay = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (tokenRef.current && connectRef.current) {
        connectRef.current(tokenRef.current);
      }
    }, delay);
  }, [reconnectAttempts, reconnectInterval]);

  const connect = useCallback(
    (token: string): void => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      clearReconnectTimeout();
      tokenRef.current = token;

      const wsUrl = `${WS_BASE_URL}?userToken=${token}`;
      socketRef.current = new WebSocket(wsUrl);
      setReadyState(WebSocketReadyState.Connecting);

      socketRef.current.onopen = (): void => {
        setIsConnected(true);
        setReadyState(WebSocketReadyState.Open);
        reconnectAttemptsRef.current = 0;
      };

      socketRef.current.onmessage = (event: MessageEvent<string>): void => {
        const message = parseMessage(event.data);
        if (typeof message !== 'string') {
          handleNotification(message);
        }
      };

      socketRef.current.onclose = (): void => {
        setIsConnected(false);
        setReadyState(WebSocketReadyState.Closed);
        attemptReconnect();
      };

      socketRef.current.onerror = (): void => {
        setReadyState(WebSocketReadyState.Closed);
      };
    },
    [clearReconnectTimeout, handleNotification, attemptReconnect]
  );

  // Keep connectRef in sync with connect
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback((): void => {
    clearReconnectTimeout();
    reconnectAttemptsRef.current = reconnectAttempts;
    tokenRef.current = null;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setIsConnected(false);
    setReadyState(WebSocketReadyState.Closed);
  }, [clearReconnectTimeout, reconnectAttempts]);

  const send = useCallback((message: string): void => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    }
  }, []);

  return {
    connect,
    disconnect,
    send,
    isConnected,
    readyState,
  };
}
