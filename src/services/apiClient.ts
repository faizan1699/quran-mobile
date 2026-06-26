import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { Platform, NativeModules } from 'react-native';
import { useUserStore } from '@/store/useUserStore';

const API_PORT = 3001;

const getDevHost = (): string | null => {
  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  const match = scriptURL?.match(/https?:\/\/([^/:]+)/);
  return match ? match[1] : null;
};

const getBaseUrl = (): string => {
  const isDev = process.env.EXPO_PUBLIC_APP_ENV === 'development';
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!isDev && fromEnv && fromEnv.length > 0) {
    return fromEnv.replace(/\/+$/, '');
  }

  if (Platform.OS === 'web') {
    const host = (globalThis as any)?.location?.hostname || 'localhost';
    return `http://${host}:${API_PORT}/api/v1`;
  }

  const devHost = getDevHost();
  if (devHost && devHost !== 'localhost' && devHost !== '127.0.0.1') {
    return `http://${devHost}:${API_PORT}/api/v1`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}/api/v1`;
  }

  return `http://localhost:${API_PORT}/api/v1`;
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success) {
        return response.data.data;
      }
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
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

        const refreshResponse = await axios.post<{
          success: boolean;
          data: { accessToken: string; refreshToken: string };
        }>(`${getBaseUrl()}/auth/refresh`, { refreshToken });

        if (refreshResponse.data && refreshResponse.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
          
          useUserStore.getState().setTokens(accessToken, newRefreshToken);
          
          processQueue(null, accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh token rotation failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.data?.error) {
      return Promise.reject(error.response.data.error);
    }
    return Promise.reject(error);
  }
);
