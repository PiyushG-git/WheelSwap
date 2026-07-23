import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { submitKycDocs, fetchKycStatus, clearKycError } from '../state/kycSlice';
import type { SubmitKycPayload } from '../api';

export function useKyc() {
  const dispatch = useDispatch<AppDispatch>();
  const { document, loading, error } = useSelector((state: RootState) => state.kyc);

  const submit = async (payload: SubmitKycPayload) => {
    return dispatch(submitKycDocs(payload)).unwrap();
  };

  const getStatus = () => {
    dispatch(fetchKycStatus());
  };

  const resetError = () => {
    dispatch(clearKycError());
  };

  return {
    document,
    loading,
    error,
    status: document?.status || null,
    isApproved: document?.status === 'APPROVED',
    isRejected: document?.status === 'REJECTED',
    isPending: document?.status === 'PENDING',
    submit,
    getStatus,
    resetError,
  };
}
