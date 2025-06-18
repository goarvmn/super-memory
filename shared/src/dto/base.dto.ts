// shared/src/dto/base.dto.ts

/**
 * Base API Response Wrapper
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
