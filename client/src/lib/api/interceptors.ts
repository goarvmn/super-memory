// client/src/lib/api/interceptors.ts

import { AxiosError } from 'axios';
import { storage } from '../utils/storage';
import { apiClient } from './axios.config';

/**
 * Setup request interceptor - Add token to headers
 */
apiClient.interceptors.request.use(
  config => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

/**
 * Setup response interceptor - Handle token expiry
 */
apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    // Token expired or invalid - clear storage
    if (error.response?.status === 401) {
      storage.removeToken();
    }
    return Promise.reject(error);
  }
);
