import { http } from '../../../utils/http';
import { ENDPOINTS } from '../../../config';
import type { KycDocument, Vehicle, ApiResponse } from '../../../types';

export const adminApi = {
  async getPendingKycList(params?: any): Promise<ApiResponse<KycDocument[]>> {
    const response = await http.get(ENDPOINTS.KYC.ADMIN_LIST, { params });
    return response.data;
  },

  async getKycDetails(userId: string): Promise<ApiResponse<KycDocument>> {
    const response = await http.get(ENDPOINTS.KYC.ADMIN_VERIFY(userId));
    return response.data;
  },

  async approveKyc(userId: string): Promise<ApiResponse<null>> {
    const response = await http.patch(ENDPOINTS.KYC.ADMIN_APPROVE(userId));
    return response.data;
  },

  async rejectKyc(userId: string, rejectionReason: string): Promise<ApiResponse<null>> {
    const response = await http.patch(ENDPOINTS.KYC.ADMIN_REJECT(userId), { rejectionReason });
    return response.data;
  },

  async getPendingVehicleList(params?: any): Promise<ApiResponse<Vehicle[]>> {
    const response = await http.get(ENDPOINTS.VEHICLES.ADMIN_LIST, { params });
    return response.data;
  },

  async approveVehicle(id: string): Promise<ApiResponse<null>> {
    const response = await http.patch(ENDPOINTS.VEHICLES.ADMIN_APPROVE(id));
    return response.data;
  },

  async rejectVehicle(id: string, rejectionReason: string): Promise<ApiResponse<null>> {
    const response = await http.patch(ENDPOINTS.VEHICLES.ADMIN_REJECT(id), { rejectionReason });
    return response.data;
  },
};
