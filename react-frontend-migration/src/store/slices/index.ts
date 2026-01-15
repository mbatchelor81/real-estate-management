export { default as authReducer } from './authSlice';
export { default as propertiesReducer } from './propertiesSlice';
export { default as uiReducer } from './uiSlice';
export { default as notificationsReducer } from './notificationsSlice';

export {
  setUser,
  signOut,
  clearError as clearAuthError,
  restoreSession,
  initializeAuth,
  signIn,
  register,
  googleAuth,
  changePassword,
  selectAuthUser,
  selectAuthIsAuthenticated,
  selectAuthIsLoading,
  selectAuthError,
} from './authSlice';

export {
  resetProperties,
  setCurrentProperty,
  addPropertyToState,
  removePropertyFromState,
  updatePropertyInState,
  clearError as clearPropertiesError,
  fetchProperties,
  fetchProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  fetchOwnedProperties,
} from './propertiesSlice';

export {
  setDarkTheme,
  toggleDarkTheme,
  setRestrictedMode,
  setSideMenuOpen,
  setGlobalLoading,
  restoreTheme,
} from './uiSlice';

export {
  resetNotifications,
  insertNotificationToState,
  removeNotificationsFromState,
  setNotificationsAsReadInState,
  clearNotificationsError,
  fetchNotifications,
  markAsRead,
  selectNotifications,
  selectNotificationsLoading,
  selectNotificationsError,
  selectNotificationsInitialFetchDone,
  selectUnreadNotificationsCount,
} from './notificationsSlice';
