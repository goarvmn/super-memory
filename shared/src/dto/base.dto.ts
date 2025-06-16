// shared/src/dto/base.dto.ts

/**
 * Base API response wrapper
 */
export interface BaseApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
