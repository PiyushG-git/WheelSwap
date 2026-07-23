import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import {
  fetchPendingKyc,
  fetchPendingVehicles,
  approveKycDocument,
  rejectKycDocument,
  approveVehicleListing,
  rejectVehicleListing,
  clearAdminError,
} from '../state/adminSlice';

export function useAdmin() {
  const dispatch = useDispatch<AppDispatch>();
  const { pendingKyc, pendingVehicles, loading, error } = useSelector(
    (state: RootState) => state.admin
  );

  const getPendingKyc = () => {
    dispatch(fetchPendingKyc());
  };

  const getPendingVehicles = () => {
    dispatch(fetchPendingVehicles());
  };

  const verifyKyc = async (userId: string, approve: boolean, reason?: string) => {
    if (approve) {
      return dispatch(approveKycDocument(userId)).unwrap();
    } else {
      return dispatch(rejectKycDocument({ userId, reason: reason || 'Details invalid' })).unwrap();
    }
  };

  const verifyVehicle = async (id: string, approve: boolean, reason?: string) => {
    if (approve) {
      return dispatch(approveVehicleListing(id)).unwrap();
    } else {
      return dispatch(rejectVehicleListing({ id, reason: reason || 'Listing invalid' })).unwrap();
    }
  };

  const resetError = () => {
    dispatch(clearAdminError());
  };

  return {
    pendingKyc,
    pendingVehicles,
    loading,
    error,
    getPendingKyc,
    getPendingVehicles,
    verifyKyc,
    verifyVehicle,
    resetError,
  };
}
