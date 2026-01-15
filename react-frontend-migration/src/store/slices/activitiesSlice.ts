import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Activity } from '@/types';
import { activitiesApi } from '@/api/activities';

interface ActivitiesState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ActivitiesState = {
  activities: [],
  isLoading: false,
  error: null,
};

export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await activitiesApi.getActivities();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch activities');
    }
  }
);

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    insertActivity: (state, action: PayloadAction<Activity>) => {
      state.activities = [action.payload, ...state.activities];
    },
    resetActivities: (state) => {
      state.activities = [];
      state.isLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { insertActivity, resetActivities, clearError } = activitiesSlice.actions;

export const selectActivities = (state: { activities: ActivitiesState }): Activity[] =>
  state.activities.activities;
export const selectActivitiesLoading = (state: { activities: ActivitiesState }): boolean =>
  state.activities.isLoading;
export const selectActivitiesError = (state: { activities: ActivitiesState }): string | null =>
  state.activities.error;

export default activitiesSlice.reducer;
