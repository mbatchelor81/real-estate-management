export { default as authReducer } from './authSlice';
export { default as propertiesReducer } from './propertiesSlice';
export { default as uiReducer } from './uiSlice';
export { default as activitiesReducer } from './activitiesSlice';

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
  insertActivity,
  resetActivities,
  clearError as clearActivitiesError,
  fetchActivities,
  selectActivities,
  selectActivitiesLoading,
  selectActivitiesError,
} from './activitiesSlice';
