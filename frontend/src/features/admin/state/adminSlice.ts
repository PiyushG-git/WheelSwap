import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { adminApi } from '../api';
import type { KycDocument, Vehicle } from '../../../types';

interface AdminState {
  pendingKyc: KycDocument[];
  pendingVehicles: Vehicle[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  pendingKyc: [],
  pendingVehicles: [],
  loading: false,
  error: null,
};

// ── Async Thunks ─────────────────────────────

export const fetchPendingKyc = createAsyncThunk(
  'admin/fetchPendingKyc',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getPendingKycList({ status: 'PENDING' });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch pending KYC list');
    }
  }
);

export const fetchPendingVehicles = createAsyncThunk(
  'admin/fetchPendingVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getPendingVehicleList({ status: 'PENDING_APPROVAL' });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch pending vehicles list');
    }
  }
);

export const approveKycDocument = createAsyncThunk(
  'admin/approveKyc',
  async (userId: string, { rejectWithValue }) => {
    try {
      await adminApi.approveKyc(userId);
      return userId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to approve KYC');
    }
  }
);

export const rejectKycDocument = createAsyncThunk(
  'admin/rejectKyc',
  async ({ userId, reason }: { userId: string; reason: string }, { rejectWithValue }) => {
    try {
      await adminApi.rejectKyc(userId, reason);
      return userId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject KYC');
    }
  }
);

export const approveVehicleListing = createAsyncThunk(
  'admin/approveVehicle',
  async (id: string, { rejectWithValue }) => {
    try {
      await adminApi.approveVehicle(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to approve vehicle');
    }
  }
);

export const rejectVehicleListing = createAsyncThunk(
  'admin/rejectVehicle',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      await adminApi.rejectVehicle(id, reason);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject vehicle');
    }
  }
);

// ── Redux Slice ──────────────────────────────

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pending KYC
      .addCase(fetchPendingKyc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingKyc.fulfilled, (state, action: PayloadAction<KycDocument[]>) => {
        state.loading = false;
        state.pendingKyc = action.payload;
      })
      .addCase(fetchPendingKyc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Pending Vehicles
      .addCase(fetchPendingVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingVehicles.fulfilled, (state, action: PayloadAction<Vehicle[]>) => {
        state.loading = false;
        state.pendingVehicles = action.payload;
      })
      .addCase(fetchPendingVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Approve KYC
      .addCase(approveKycDocument.fulfilled, (state, action: PayloadAction<string>) => {
        state.pendingKyc = state.pendingKyc.filter((k) => k.userId !== action.payload);
      })
      // Reject KYC
      .addCase(rejectKycDocument.fulfilled, (state, action: PayloadAction<string>) => {
        state.pendingKyc = state.pendingKyc.filter((k) => k.userId !== action.payload);
      })
      // Approve Vehicle
      .addCase(approveVehicleListing.fulfilled, (state, action: PayloadAction<string>) => {
        state.pendingVehicles = state.pendingVehicles.filter((v) => v.id !== action.payload);
      })
      // Reject Vehicle
      .addCase(rejectVehicleListing.fulfilled, (state, action: PayloadAction<string>) => {
        state.pendingVehicles = state.pendingVehicles.filter((v) => v.id !== action.payload);
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
