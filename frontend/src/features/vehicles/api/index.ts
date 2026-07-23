import { http } from '../../../utils/http';
import { ENDPOINTS } from '../../../config';
import type { Vehicle, ApiResponse } from '../../../types';

export const vehiclesApi = {
  async search(params: Record<string, any>): Promise<ApiResponse<Vehicle[]>> {
    const response = await http.get(ENDPOINTS.VEHICLES.LIST, { params });
    return response.data;
  },

  async getMyVehicles(): Promise<ApiResponse<Vehicle[]>> {
    const response = await http.get(ENDPOINTS.VEHICLES.MY_VEHICLES);
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Vehicle>> {
    const response = await http.get(ENDPOINTS.VEHICLES.BY_ID(id));
    return response.data;
  },

  async create(data: any): Promise<ApiResponse<Vehicle>> {
    const response = await http.post(ENDPOINTS.VEHICLES.CREATE, data);
    return response.data;
  },

  async update(id: string, data: any): Promise<ApiResponse<Vehicle>> {
    const response = await http.patch(ENDPOINTS.VEHICLES.BY_ID(id), data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await http.delete(ENDPOINTS.VEHICLES.BY_ID(id));
    return response.data;
  },

  async uploadImages(id: string, files: FileList): Promise<ApiResponse<any>> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    const response = await http.post(ENDPOINTS.VEHICLES.UPLOAD_IMAGES(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteImage(id: string, imageId: string): Promise<ApiResponse<null>> {
    const response = await http.delete(ENDPOINTS.VEHICLES.DELETE_IMAGE(id, imageId));
    return response.data;
  },

  async setPrimaryImage(id: string, imageId: string): Promise<ApiResponse<null>> {
    const response = await http.patch(ENDPOINTS.VEHICLES.SET_PRIMARY_IMAGE(id, imageId));
    return response.data;
  },

  async getAvailability(id: string): Promise<ApiResponse<any[]>> {
    const response = await http.get(ENDPOINTS.VEHICLES.AVAILABILITY(id));
    return response.data;
  },

  async setAvailability(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await http.post(ENDPOINTS.VEHICLES.AVAILABILITY(id), data);
    return response.data;
  },
};
