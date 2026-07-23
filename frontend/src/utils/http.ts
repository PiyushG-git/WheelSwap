import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../config';

// ─────────────────────────────────────────────
// Token Storage Helpers
// ─────────────────────────────────────────────

export const getLocalAccessToken = () => localStorage.getItem('accessToken');
export const getLocalRefreshToken = () => localStorage.getItem('refreshToken');

export const setLocalTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearLocalTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// ─────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────
// Request Interceptor: Attach Auth Token
// ─────────────────────────────────────────────

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getLocalAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// Response Interceptor: Auto Refresh Token
// ─────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (Expired Access Token)
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return http(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getLocalRefreshToken();
      if (!refreshToken) {
        clearLocalTokens();
        // Trigger event or window reload to auth page
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        setLocalTokens(newAccessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return http(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        clearLocalTokens();
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
