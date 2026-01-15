import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isDarkTheme: boolean;
  isRestrictedMode: boolean;
  sideMenuOpen: boolean;
  isLoading: boolean;
}

const initialState: UiState = {
  isDarkTheme: false,
  isRestrictedMode: false,
  sideMenuOpen: false,
  isLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDarkTheme: (state, action: PayloadAction<boolean>) => {
      state.isDarkTheme = action.payload;
      localStorage.setItem('darkTheme', JSON.stringify(action.payload));
    },
    toggleDarkTheme: (state) => {
      state.isDarkTheme = !state.isDarkTheme;
      localStorage.setItem('darkTheme', JSON.stringify(state.isDarkTheme));
    },
    setRestrictedMode: (state, action: PayloadAction<boolean>) => {
      state.isRestrictedMode = action.payload;
    },
    setSideMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.sideMenuOpen = action.payload;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    restoreTheme: (state) => {
      const savedTheme = localStorage.getItem('darkTheme');
      if (savedTheme !== null) {
        state.isDarkTheme = JSON.parse(savedTheme) as boolean;
      }
    },
  },
});

export const {
  setDarkTheme,
  toggleDarkTheme,
  setRestrictedMode,
  setSideMenuOpen,
  setGlobalLoading,
  restoreTheme,
} = uiSlice.actions;
export default uiSlice.reducer;
