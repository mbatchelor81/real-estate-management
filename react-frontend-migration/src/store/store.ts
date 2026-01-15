import { configureStore } from '@reduxjs/toolkit';
import { authReducer, propertiesReducer, uiReducer, notificationsReducer } from './slices';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/signIn/fulfilled', 'auth/register/fulfilled'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
