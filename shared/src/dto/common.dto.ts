// shared/src/dto/common.dto.ts

/**
 * Base API Response Wrapper (for all API endpoints)
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

/**
 * Pagination Request
 */
export interface PaginationRequest {
  page?: number;
  limit?: number;
}

/**
 * Status Filter
 */
export interface StatusFilter {
  status?: number;
}

/**
 * Search Filter
 */
export interface SearchFilter {
  search?: string;
}
