export { default as authReducer } from './authSlice';
export { default as propertiesReducer } from './propertiesSlice';
export { default as uiReducer } from './uiSlice';

export {
  setUser,
  signOut,
  clearError as clearAuthError,
  restoreSession,
  signIn,
  register,
  googleAuth,
  changePassword,
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
