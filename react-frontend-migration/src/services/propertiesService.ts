import { propertiesApi } from '@/api/properties';
import {
  fetchProperties as fetchPropertiesThunk,
  fetchProperty as fetchPropertyThunk,
  createProperty as createPropertyThunk,
  updateProperty as updatePropertyThunk,
  deleteProperty as deletePropertyThunk,
  fetchOwnedProperties as fetchOwnedPropertiesThunk,
  resetProperties,
  setCurrentProperty,
  addPropertyToState as addPropertyToStateAction,
  removePropertyFromState as removePropertyFromStateAction,
  updatePropertyInState,
  clearError,
} from '@/store/slices/propertiesSlice';
import type { AppDispatch, RootState } from '@/store/store';
import type {
  ApiResponse,
  Property,
  PropertyFilters,
  PropertiesResponse,
} from '@/types';

const DEFAULT_LIMIT = 12;

interface PropertiesServiceReturn {
  fetchProperties: (
    sort?: string,
    filter?: string,
    search?: string
  ) => Promise<PropertiesResponse | null>;
  fetchProperty: (id: string) => Promise<Property | null>;
  addProperty: (property: Omit<Property, 'property_id'>) => Promise<Property | null>;
  addPropertyImage: (files: File[], id: string) => Promise<ApiResponse<string[]>>;
  deletePropertyImage: (images: string[], propId: string) => Promise<ApiResponse<string[]>>;
  removeProperty: (propId: string) => Promise<boolean>;
  updateProperty: (updated: Property) => Promise<Property | null>;
  fetchOwnedProperties: () => Promise<Property[] | null>;
  addPropertyToState: (property: Property) => void;
  removePropertyFromState: (propertyId: string) => void;
  resetState: (opts?: { skipOwned: boolean }) => void;
  setPropertiesState: (
    properties: Property[],
    last?: {
      lastCreatedAt?: string;
      lastPrice?: string | number;
      lastName?: string;
    }
  ) => void;
  setCurrentPropertyState: (property: Property | null) => void;
  updatePropertyInStateAction: (property: Property) => void;
  clearErrorState: () => void;
}

export function createPropertiesService(
  dispatch: AppDispatch,
  getState: () => RootState
): PropertiesServiceReturn {
  const fetchProperties = async (
    sort = 'latest',
    filter?: string,
    search?: string
  ): Promise<PropertiesResponse | null> => {
    const state = getState().properties;
    const filters: PropertyFilters = {
      sort,
      limit: DEFAULT_LIMIT,
    };

    if (filter) {
      filters.filter = filter;
    }
    if (search) {
      filters.search = search;
    }
    if (state.lastCreatedAt) {
      filters.lastCreatedAt = state.lastCreatedAt;
    }
    if (state.lastPrice) {
      filters.lastPrice = state.lastPrice;
    }
    if (state.lastName) {
      filters.lastName = state.lastName;
    }

    const result = await dispatch(fetchPropertiesThunk(filters));
    if (fetchPropertiesThunk.fulfilled.match(result)) {
      return result.payload;
    }
    return null;
  };

  const fetchProperty = async (id: string): Promise<Property | null> => {
    const result = await dispatch(fetchPropertyThunk(id));
    if (fetchPropertyThunk.fulfilled.match(result)) {
      return result.payload;
    }
    return null;
  };

  const addProperty = async (
    property: Omit<Property, 'property_id'>
  ): Promise<Property | null> => {
    const result = await dispatch(createPropertyThunk(property));
    if (createPropertyThunk.fulfilled.match(result)) {
      return result.payload;
    }
    return null;
  };

  const addPropertyImage = async (
    files: File[],
    id: string
  ): Promise<ApiResponse<string[]>> => {
    try {
      const response = await propertiesApi.uploadImages(id, files);
      if (response.success) {
        const state = getState().properties;
        const property = state.properties.find((p) => p.property_id === id);
        if (property) {
          const updatedProperty: Property = {
            ...property,
            images: [...(property.images ?? []), ...response.data],
          };
          dispatch(updatePropertyInState(updatedProperty));
        }
        const currentProperty = state.currentProperty;
        if (currentProperty?.property_id === id) {
          const updatedCurrentProperty: Property = {
            ...currentProperty,
            images: [...(currentProperty.images ?? []), ...response.data],
          };
          dispatch(setCurrentProperty(updatedCurrentProperty));
        }
      }
      return response;
    } catch (error) {
      console.error('Failed to upload property images:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to upload images',
      };
    }
  };

  const deletePropertyImage = async (
    images: string[],
    propId: string
  ): Promise<ApiResponse<string[]>> => {
    try {
      const response = await propertiesApi.deleteImages(propId, images);
      if (response.success) {
        const state = getState().properties;
        const property = state.properties.find((p) => p.property_id === propId);
        if (property) {
          const updatedProperty: Property = {
            ...property,
            images: (property.images ?? []).filter((img) => !images.includes(img)),
          };
          dispatch(updatePropertyInState(updatedProperty));
        }
        const currentProperty = state.currentProperty;
        if (currentProperty?.property_id === propId) {
          const updatedCurrentProperty: Property = {
            ...currentProperty,
            images: (currentProperty.images ?? []).filter((img) => !images.includes(img)),
          };
          dispatch(setCurrentProperty(updatedCurrentProperty));
        }
      }
      return response;
    } catch (error) {
      console.error('Failed to delete property images:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to delete images',
      };
    }
  };

  const removeProperty = async (propId: string): Promise<boolean> => {
    const result = await dispatch(deletePropertyThunk(propId));
    return deletePropertyThunk.fulfilled.match(result);
  };

  const updateProperty = async (updated: Property): Promise<Property | null> => {
    const result = await dispatch(
      updatePropertyThunk({ id: updated.property_id, property: updated })
    );
    if (updatePropertyThunk.fulfilled.match(result)) {
      return result.payload;
    }
    return null;
  };

  const fetchOwnedProperties = async (): Promise<Property[] | null> => {
    const result = await dispatch(fetchOwnedPropertiesThunk());
    if (fetchOwnedPropertiesThunk.fulfilled.match(result)) {
      return result.payload;
    }
    return null;
  };

  const addPropertyToState = (property: Property): void => {
    dispatch(addPropertyToStateAction(property));
  };

  const removePropertyFromState = (propertyId: string): void => {
    dispatch(removePropertyFromStateAction(propertyId));
  };

  const resetState = (opts?: { skipOwned: boolean }): void => {
    dispatch(resetProperties());
    if (!opts?.skipOwned) {
      void dispatch(fetchOwnedPropertiesThunk()).then((action) => {
        if (fetchOwnedPropertiesThunk.rejected.match(action)) {
          console.error('Failed to reset owned properties');
        }
      });
    }
  };

  const setPropertiesState = (
    _properties: Property[],
    _last?: {
      lastCreatedAt?: string;
      lastPrice?: string | number;
      lastName?: string;
    }
  ): void => {
    dispatch(resetProperties());
  };

  const setCurrentPropertyState = (property: Property | null): void => {
    dispatch(setCurrentProperty(property));
  };

  const updatePropertyInStateAction = (property: Property): void => {
    dispatch(updatePropertyInState(property));
  };

  const clearErrorState = (): void => {
    dispatch(clearError());
  };

  return {
    fetchProperties,
    fetchProperty,
    addProperty,
    addPropertyImage,
    deletePropertyImage,
    removeProperty,
    updateProperty,
    fetchOwnedProperties,
    addPropertyToState,
    removePropertyFromState,
    resetState,
    setPropertiesState,
    setCurrentPropertyState,
    updatePropertyInStateAction,
    clearErrorState,
  };
}

export function getProperties(state: RootState): Property[] {
  return state.properties.properties;
}

export function getOwnedProperties(state: RootState): Property[] {
  return state.properties.ownedProperties;
}

export function getCurrentProperty(state: RootState): Property | null {
  return state.properties.currentProperty;
}

export function getPropertiesLoading(state: RootState): boolean {
  return state.properties.isLoading;
}

export function getPropertiesError(state: RootState): string | null {
  return state.properties.error;
}

export function getHasMore(state: RootState): boolean {
  return state.properties.hasMore;
}

export function getLastCreatedAt(state: RootState): string | null {
  return state.properties.lastCreatedAt;
}

export function getLastPrice(state: RootState): string | null {
  return state.properties.lastPrice;
}

export function getLastName(state: RootState): string | null {
  return state.properties.lastName;
}

export function getPaginationCursors(state: RootState): {
  lastCreatedAt: string | null;
  lastPrice: string | null;
  lastName: string | null;
  hasMore: boolean;
} {
  return {
    lastCreatedAt: state.properties.lastCreatedAt,
    lastPrice: state.properties.lastPrice,
    lastName: state.properties.lastName,
    hasMore: state.properties.hasMore,
  };
}
