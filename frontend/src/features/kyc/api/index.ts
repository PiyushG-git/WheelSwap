import { http } from '../../../utils/http';
import { ENDPOINTS } from '../../../config';
import type { KycDocument, ApiResponse } from '../../../types';

export interface SubmitKycPayload {
  aadhaarNumber: string;
  licenseNumber: string;
  aadhaarFront: File;
  aadhaarBack?: File;
  licenseFront: File;
  licenseBack?: File;
  selfie?: File;
}

export const kycApi = {
  async submit(payload: SubmitKycPayload): Promise<ApiResponse<KycDocument>> {
    const formData = new FormData();
    formData.append('aadhaarNumber', payload.aadhaarNumber);
    formData.append('licenseNumber', payload.licenseNumber);
    formData.append('aadhaarFront', payload.aadhaarFront);
    if (payload.aadhaarBack) formData.append('aadhaarBack', payload.aadhaarBack);
    formData.append('licenseFront', payload.licenseFront);
    if (payload.licenseBack) formData.append('licenseBack', payload.licenseBack);
    if (payload.selfie) formData.append('selfie', payload.selfie);

    const response = await http.post(ENDPOINTS.KYC.SUBMIT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getStatus(): Promise<ApiResponse<KycDocument | null>> {
    const response = await http.get(ENDPOINTS.KYC.STATUS);
    return response.data;
  },
};
