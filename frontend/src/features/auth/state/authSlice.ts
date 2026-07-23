import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api';
import type { User } from '../../../types';
import { setLocalTokens, clearLocalTokens, getLocalAccessToken } from '../../../utils/http';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
};

// ── Async Thunks ─────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      const { user, tokens } = response.data;
      setLocalTokens(tokens.accessToken, tokens.refreshToken);
      return user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      return response.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const token = getLocalAccessToken();
      if (!token) return null;
      const response = await authApi.getMe();
      return response.data;
    } catch (err: any) {
      clearLocalTokens();
      return rejectWithValue(err.response?.data?.message || 'Session expired');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (refreshToken: string) => {
    try {
      await authApi.logout(refreshToken);
    } catch {
      // Proceed with logout anyway
    } finally {
      clearLocalTokens();
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await authApi.updateMe(data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await authApi.uploadAvatar(file);
      return response.data.avatarUrl;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Upload failed');
    }
  }
);

// ── Redux Slice ──────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    localLogout: (state) => {
      state.user = null;
      state.error = null;
      clearLocalTokens();
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Me
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.initialized = true;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Upload Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadAvatar.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        if (state.user) {
          state.user.avatarUrl = action.payload;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, localLogout } = authSlice.actions;
export default authSlice.reducer;
