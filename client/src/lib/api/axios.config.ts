// client/src/lib/api/axios.config.ts

import axios from 'axios';

/**
 * Axios instance for API calls
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * API base URL
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL;
