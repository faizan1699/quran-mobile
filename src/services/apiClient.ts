import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { useUserStore } from '@/store/useUserStore';

// Determine the base API URL based on platform and environment
const getBaseUrl = (): string => {
  // Fallback default
  let url = 'http://localhost:3000/api/v1';
  
  // Override if running on Android emulator to connect to host computer
  if (Platform.OS === 'android') {
    url = url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
  
  return url;
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject authorization token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent infinite retry loops during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for envelope extraction and token rotation
apiClient.interceptors.response.use(
  (response) => {
    // API responses follow: { success: true, data: ... }
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success) {
        return response.data.data; // Flatten envelope for ease of use in UI
      }
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is due to an expired JWT token (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, enqueue this request to wait
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useUserStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call the refresh token endpoint
        // NOTE: We bypass the interceptor envelope flattening by fetching raw axios if needed,
        // or calling our endpoint directly
        const refreshResponse = await axios.post<{
          success: boolean;
          data: { accessToken: string; refreshToken: string };
        }>(`${getBaseUrl()}/auth/refresh`, { refreshToken });

        if (refreshResponse.data && refreshResponse.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
          
          // Save new tokens
          useUserStore.getState().setTokens(accessToken, newRefreshToken);
          
          // Process queued requests with new token
          processQueue(null, accessToken);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh token rotation failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Log user out if refresh fails
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Return standard error response
    if (error.response?.data?.error) {
      return Promise.reject(error.response.data.error);
    }
    return Promise.reject(error);
  }
);
