import { configureStore } from '@reduxjs/toolkit';
import { authReducer, propertiesReducer, uiReducer, enquiriesReducer } from './slices';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    ui: uiReducer,
    enquiries: enquiriesReducer,
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
