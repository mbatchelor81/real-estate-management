import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Enquiry, CreateEnquiryPayload } from '@/types';
import { enquiriesApi } from '@/api/enquiries';

interface EnquiriesState {
  enquiries: Enquiry[];
  currentEnquiry: Enquiry | null;
  isLoading: boolean;
  error: string | null;
  initialFetchDone: boolean;
}

const initialState: EnquiriesState = {
  enquiries: [],
  currentEnquiry: null,
  isLoading: false,
  error: null,
  initialFetchDone: false,
};

export const fetchEnquiries = createAsyncThunk(
  'enquiries/fetchEnquiries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await enquiriesApi.getEnquiries();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch enquiries');
    }
  }
);

export const fetchEnquiry = createAsyncThunk(
  'enquiries/fetchEnquiry',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await enquiriesApi.getEnquiry(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch enquiry');
    }
  }
);

export const createEnquiry = createAsyncThunk(
  'enquiries/createEnquiry',
  async (payload: CreateEnquiryPayload, { rejectWithValue }) => {
    try {
      const response = await enquiriesApi.createEnquiry(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create enquiry');
    }
  }
);

export const removeEnquiry = createAsyncThunk(
  'enquiries/removeEnquiry',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await enquiriesApi.deleteEnquiry(id);
      if (response.data.status === 200) {
        return id;
      }
      return rejectWithValue('Failed to delete enquiry');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete enquiry');
    }
  }
);

export const readEnquiry = createAsyncThunk(
  'enquiries/readEnquiry',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await enquiriesApi.markAsRead(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark enquiry as read');
    }
  }
);

const enquiriesSlice = createSlice({
  name: 'enquiries',
  initialState,
  reducers: {
    resetEnquiries: (state) => {
      state.enquiries = [];
      state.initialFetchDone = false;
      state.error = null;
    },
    setCurrentEnquiry: (state, action: PayloadAction<Enquiry | null>) => {
      state.currentEnquiry = action.payload;
    },
    insertEnquiryToState: (state, action: PayloadAction<Enquiry>) => {
      state.enquiries.unshift(action.payload);
    },
    updateEnquiryInState: (state, action: PayloadAction<Enquiry>) => {
      const index = state.enquiries.findIndex(
        (e) => e.enquiry_id === action.payload.enquiry_id
      );
      if (index !== -1) {
        state.enquiries[index] = action.payload;
      }
      if (state.currentEnquiry?.enquiry_id === action.payload.enquiry_id) {
        state.currentEnquiry = action.payload;
      }
    },
    removeEnquiryFromState: (state, action: PayloadAction<string>) => {
      state.enquiries = state.enquiries.filter((e) => e.enquiry_id !== action.payload);
      if (state.currentEnquiry?.enquiry_id === action.payload) {
        state.currentEnquiry = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnquiries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnquiries.fulfilled, (state, action: PayloadAction<Enquiry[]>) => {
        state.isLoading = false;
        state.enquiries = action.payload;
        state.initialFetchDone = true;
      })
      .addCase(fetchEnquiries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.initialFetchDone = true;
      })
      .addCase(fetchEnquiry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnquiry.fulfilled, (state, action: PayloadAction<Enquiry>) => {
        state.isLoading = false;
        state.currentEnquiry = action.payload;
      })
      .addCase(fetchEnquiry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createEnquiry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEnquiry.fulfilled, (state, action: PayloadAction<Enquiry>) => {
        state.isLoading = false;
        state.enquiries.unshift(action.payload);
      })
      .addCase(createEnquiry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(removeEnquiry.fulfilled, (state, action: PayloadAction<string>) => {
        state.enquiries = state.enquiries.filter((e) => e.enquiry_id !== action.payload);
        if (state.currentEnquiry?.enquiry_id === action.payload) {
          state.currentEnquiry = null;
        }
      })
      .addCase(removeEnquiry.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(readEnquiry.fulfilled, (state, action: PayloadAction<Enquiry>) => {
        const index = state.enquiries.findIndex(
          (e) => e.enquiry_id === action.payload.enquiry_id
        );
        if (index !== -1) {
          state.enquiries[index] = action.payload;
        }
        if (state.currentEnquiry?.enquiry_id === action.payload.enquiry_id) {
          state.currentEnquiry = action.payload;
        }
      })
      .addCase(readEnquiry.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  resetEnquiries,
  setCurrentEnquiry,
  insertEnquiryToState,
  updateEnquiryInState,
  removeEnquiryFromState,
  clearError,
} = enquiriesSlice.actions;

export const selectEnquiries = (state: { enquiries: EnquiriesState }): Enquiry[] =>
  state.enquiries.enquiries;
export const selectCurrentEnquiry = (state: { enquiries: EnquiriesState }): Enquiry | null =>
  state.enquiries.currentEnquiry;
export const selectEnquiriesIsLoading = (state: { enquiries: EnquiriesState }): boolean =>
  state.enquiries.isLoading;
export const selectEnquiriesError = (state: { enquiries: EnquiriesState }): string | null =>
  state.enquiries.error;
export const selectEnquiriesInitialFetchDone = (state: { enquiries: EnquiriesState }): boolean =>
  state.enquiries.initialFetchDone;

export default enquiriesSlice.reducer;
