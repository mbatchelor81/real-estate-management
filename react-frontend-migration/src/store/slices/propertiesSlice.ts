import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Property, PropertyFilters, PropertiesResponse } from '@/types';
import { propertiesApi } from '@/api/properties';

interface PropertiesState {
  properties: Property[];
  ownedProperties: Property[];
  currentProperty: Property | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  lastCreatedAt: string | null;
  lastPrice: string | null;
  lastName: string | null;
}

const initialState: PropertiesState = {
  properties: [],
  ownedProperties: [],
  currentProperty: null,
  isLoading: false,
  error: null,
  hasMore: true,
  lastCreatedAt: null,
  lastPrice: null,
  lastName: null,
};

export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (filters: PropertyFilters, { rejectWithValue }) => {
    try {
      const response = await propertiesApi.getProperties(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch properties');
    }
  }
);

export const fetchProperty = createAsyncThunk(
  'properties/fetchProperty',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await propertiesApi.getProperty(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch property');
    }
  }
);

export const createProperty = createAsyncThunk(
  'properties/createProperty',
  async (property: Omit<Property, 'property_id'>, { rejectWithValue }) => {
    try {
      const response = await propertiesApi.createProperty(property);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create property');
    }
  }
);

export const updateProperty = createAsyncThunk(
  'properties/updateProperty',
  async ({ id, property }: { id: string; property: Partial<Property> }, { rejectWithValue }) => {
    try {
      const response = await propertiesApi.updateProperty(id, property);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update property');
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'properties/deleteProperty',
  async (id: string, { rejectWithValue }) => {
    try {
      await propertiesApi.deleteProperty(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete property');
    }
  }
);

export const fetchOwnedProperties = createAsyncThunk(
  'properties/fetchOwnedProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertiesApi.getOwnedProperties();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch owned properties'
      );
    }
  }
);

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    resetProperties: (state) => {
      state.properties = [];
      state.hasMore = true;
      state.lastCreatedAt = null;
      state.lastPrice = null;
      state.lastName = null;
      state.error = null;
    },
    setCurrentProperty: (state, action: PayloadAction<Property | null>) => {
      state.currentProperty = action.payload;
    },
    addPropertyToState: (state, action: PayloadAction<Property>) => {
      state.properties.unshift(action.payload);
      state.ownedProperties.unshift(action.payload);
    },
    removePropertyFromState: (state, action: PayloadAction<string>) => {
      state.properties = state.properties.filter((p) => p.property_id !== action.payload);
      state.ownedProperties = state.ownedProperties.filter((p) => p.property_id !== action.payload);
    },
    updatePropertyInState: (state, action: PayloadAction<Property>) => {
      const index = state.properties.findIndex(
        (p) => p.property_id === action.payload.property_id
      );
      if (index !== -1) {
        state.properties[index] = action.payload;
      }
      const ownedIndex = state.ownedProperties.findIndex(
        (p) => p.property_id === action.payload.property_id
      );
      if (ownedIndex !== -1) {
        state.ownedProperties[ownedIndex] = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action: PayloadAction<PropertiesResponse>) => {
        state.isLoading = false;
        state.properties = [...state.properties, ...action.payload.items];
        state.hasMore = action.payload.hasMore ?? false;
        state.lastCreatedAt = action.payload.lastCreatedAt ?? null;
        state.lastPrice = action.payload.lastPrice ?? null;
        state.lastName = action.payload.lastName ?? null;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProperty.fulfilled, (state, action: PayloadAction<Property>) => {
        state.isLoading = false;
        state.currentProperty = action.payload;
      })
      .addCase(fetchProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createProperty.fulfilled, (state, action: PayloadAction<Property>) => {
        state.properties.unshift(action.payload);
        state.ownedProperties.unshift(action.payload);
      })
      .addCase(updateProperty.fulfilled, (state, action: PayloadAction<Property>) => {
        const index = state.properties.findIndex(
          (p) => p.property_id === action.payload.property_id
        );
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
        const ownedIndex = state.ownedProperties.findIndex(
          (p) => p.property_id === action.payload.property_id
        );
        if (ownedIndex !== -1) {
          state.ownedProperties[ownedIndex] = action.payload;
        }
        if (state.currentProperty?.property_id === action.payload.property_id) {
          state.currentProperty = action.payload;
        }
      })
      .addCase(deleteProperty.fulfilled, (state, action: PayloadAction<string>) => {
        state.properties = state.properties.filter((p) => p.property_id !== action.payload);
        state.ownedProperties = state.ownedProperties.filter(
          (p) => p.property_id !== action.payload
        );
        if (state.currentProperty?.property_id === action.payload) {
          state.currentProperty = null;
        }
      })
      .addCase(fetchOwnedProperties.fulfilled, (state, action: PayloadAction<Property[]>) => {
        state.ownedProperties = action.payload;
      });
  },
});

export const {
  resetProperties,
  setCurrentProperty,
  addPropertyToState,
  removePropertyFromState,
  updatePropertyInState,
  clearError,
} = propertiesSlice.actions;
export default propertiesSlice.reducer;
