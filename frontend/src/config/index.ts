let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Normalize URL to ensure it ends with /api/v1
if (baseUrl) {
  // Trim trailing slash
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  // Check if it already ends with /api/v1
  if (!baseUrl.endsWith('/api/v1')) {
    baseUrl = `${baseUrl}/api/v1`;
  }
}

export const API_BASE_URL = baseUrl;

export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USERS: {
    ME: '/users/me',
    UPDATE: '/users/me',
    AVATAR: '/users/me/avatar',
    PUBLIC_PROFILE: (id: string) => `/users/${id}`,
  },
  KYC: {
    SUBMIT: '/kyc/submit',
    STATUS: '/kyc/status',
    ADMIN_LIST: '/kyc/admin/list',
    ADMIN_VERIFY: (userId: string) => `/kyc/admin/${userId}`,
    ADMIN_APPROVE: (userId: string) => `/kyc/admin/${userId}/approve`,
    ADMIN_REJECT: (userId: string) => `/kyc/admin/${userId}/reject`,
  },
  VEHICLES: {
    LIST: '/vehicles',
    MY_VEHICLES: '/vehicles/my',
    CREATE: '/vehicles',
    BY_ID: (id: string) => `/vehicles/${id}`,
    AVAILABILITY: (id: string) => `/vehicles/${id}/availability`,
    UPLOAD_IMAGES: (id: string) => `/vehicles/${id}/images`,
    DELETE_IMAGE: (id: string, imageId: string) => `/vehicles/${id}/images/${imageId}`,
    SET_PRIMARY_IMAGE: (id: string, imageId: string) => `/vehicles/${id}/images/${imageId}/primary`,
    ADMIN_LIST: '/vehicles/admin/list',
    ADMIN_APPROVE: (id: string) => `/vehicles/admin/${id}/approve`,
    ADMIN_REJECT: (id: string) => `/vehicles/admin/${id}/reject`,
  },
};
