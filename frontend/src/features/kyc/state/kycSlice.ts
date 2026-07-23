import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { kycApi } from '../api';
import type { SubmitKycPayload } from '../api';
import type { KycDocument } from '../../../types';

interface KycState {
  document: KycDocument | null;
  loading: boolean;
  error: string | null;
}

const initialState: KycState = {
  document: null,
  loading: false,
  error: null,
};

// ── Async Thunks ─────────────────────────────

export const submitKycDocs = createAsyncThunk(
  'kyc/submit',
  async (payload: SubmitKycPayload, { rejectWithValue }) => {
    try {
      const response = await kycApi.submit(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'KYC submission failed');
    }
  }
);

export const fetchKycStatus = createAsyncThunk(
  'kyc/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await kycApi.getStatus();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch KYC status');
    }
  }
);

// ── Redux Slice ──────────────────────────────

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    clearKycError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit KYC
      .addCase(submitKycDocs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitKycDocs.fulfilled, (state, action: PayloadAction<KycDocument>) => {
        state.loading = false;
        state.document = action.payload;
      })
      .addCase(submitKycDocs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Status
      .addCase(fetchKycStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchKycStatus.fulfilled, (state, action: PayloadAction<KycDocument | null>) => {
        state.loading = false;
        state.document = action.payload;
      })
      .addCase(fetchKycStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearKycError } = kycSlice.actions;
export default kycSlice.reducer;
