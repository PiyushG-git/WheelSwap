import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { vehiclesApi } from '../api';
import type { Vehicle } from '../../../types';

interface VehicleState {
  list: Vehicle[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  currentVehicle: Vehicle | null;
  myVehicles: Vehicle[];
  loading: boolean;
  error: string | null;
}

const initialState: VehicleState = {
  list: [],
  meta: null,
  currentVehicle: null,
  myVehicles: [],
  loading: false,
  error: null,
};

// ── Async Thunks ─────────────────────────────

export const fetchSearchVehicles = createAsyncThunk(
  'vehicles/search',
  async (params: Record<string, any>, { rejectWithValue }) => {
    try {
      const response = await vehiclesApi.search(params);
      return { items: response.data, meta: response.meta };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchMyVehiclesList = createAsyncThunk(
  'vehicles/fetchMyList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehiclesApi.getMyVehicles();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch your vehicles');
    }
  }
);

export const fetchVehicleById = createAsyncThunk(
  'vehicles/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await vehiclesApi.getById(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load vehicle details');
    }
  }
);

export const createNewVehicle = createAsyncThunk(
  'vehicles/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await vehiclesApi.create(data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const updateVehicleDetails = createAsyncThunk(
  'vehicles/update',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await vehiclesApi.update(id, data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicles/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await vehiclesApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
  }
);

// ── Redux Slice ──────────────────────────────

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    clearVehicleError: (state) => {
      state.error = null;
    },
    clearCurrentVehicle: (state) => {
      state.currentVehicle = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search
      .addCase(fetchSearchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items;
        state.meta = action.payload.meta || null;
      })
      .addCase(fetchSearchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // My Vehicles
      .addCase(fetchMyVehiclesList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyVehiclesList.fulfilled, (state, action: PayloadAction<Vehicle[]>) => {
        state.loading = false;
        state.myVehicles = action.payload;
      })
      .addCase(fetchMyVehiclesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch By Id
      .addCase(fetchVehicleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleById.fulfilled, (state, action: PayloadAction<Vehicle>) => {
        state.loading = false;
        state.currentVehicle = action.payload;
      })
      .addCase(fetchVehicleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Vehicle
      .addCase(createNewVehicle.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewVehicle.fulfilled, (state, action: PayloadAction<Vehicle>) => {
        state.loading = false;
        state.myVehicles.push(action.payload);
      })
      .addCase(createNewVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Vehicle
      .addCase(updateVehicleDetails.fulfilled, (state, action: PayloadAction<Vehicle>) => {
        state.loading = false;
        if (state.currentVehicle && state.currentVehicle.id === action.payload.id) {
          state.currentVehicle = action.payload;
        }
        state.myVehicles = state.myVehicles.map((v) =>
          v.id === action.payload.id ? action.payload : v
        );
      })
      // Delete Vehicle
      .addCase(deleteVehicle.fulfilled, (state, action: PayloadAction<string>) => {
        state.myVehicles = state.myVehicles.filter((v) => v.id !== action.payload);
      });
  },
});

export const { clearVehicleError, clearCurrentVehicle } = vehicleSlice.actions;
export default vehicleSlice.reducer;
