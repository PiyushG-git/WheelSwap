import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/state/authSlice';
import kycReducer from '../features/kyc/state/kycSlice';
import vehicleReducer from '../features/vehicles/state/vehicleSlice';
import adminReducer from '../features/admin/state/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    kyc: kycReducer,
    vehicles: vehicleReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
