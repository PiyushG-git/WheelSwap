import { http } from '../../../utils/http';
import { ENDPOINTS } from '../../../config';
import type { User, ApiResponse } from '../../../types';

export const authApi = {
  async register(data: any): Promise<ApiResponse<{ user: User }>> {
    const response = await http.post(ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  async login(data: any): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {
    const response = await http.post(ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  async logout(refreshToken: string): Promise<ApiResponse<null>> {
    const response = await http.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    return response.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const response = await http.get(ENDPOINTS.USERS.ME);
    return response.data;
  },

  async updateMe(data: any): Promise<ApiResponse<User>> {
    const response = await http.patch(ENDPOINTS.USERS.UPDATE, data);
    return response.data;
  },

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await http.post(ENDPOINTS.USERS.AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    const response = await http.post(ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
    return response.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response = await http.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  async resetPassword(data: any): Promise<ApiResponse<null>> {
    const response = await http.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return response.data;
  },

  async changePassword(data: any): Promise<ApiResponse<null>> {
    const response = await http.patch(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    return response.data;
  },

  async getPublicProfile(id: string): Promise<ApiResponse<Partial<User>>> {
    const response = await http.get(ENDPOINTS.USERS.PUBLIC_PROFILE(id));
    return response.data;
  },
};
