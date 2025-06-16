// client/src/lib/api/index.ts

// Setup interceptors
import './interceptors';

// Export API methods
export { authApi } from './auth.api';
export { apiClient } from './axios.config';
