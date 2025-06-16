// client/src/lib/utils/error-handler.ts

import { AuthErrorCode } from '@guesense-dash/shared';
import { AxiosError } from 'axios';

/**
 * Convert error codes messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
  [AuthErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please login again',
  [AuthErrorCode.TOKEN_INVALID]: 'Your session is invalid. Please login again',
  [AuthErrorCode.TOKEN_MISSING]: 'Authentication required. Please login',
  [AuthErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please login again',
  [AuthErrorCode.VALIDATION_ERROR]: 'Please check your input and try again',
  [AuthErrorCode.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later',
};

/**
 * Get error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const serverError = error.response?.data?.error;

    if (serverError?.code && ERROR_MESSAGES[serverError.code]) {
      return ERROR_MESSAGES[serverError.code];
    }

    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again';
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection';
    }

    if (serverError?.message) {
      return serverError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
