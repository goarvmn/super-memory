// server/src/infrastructure/adapters/http-client/HttpClientPort.ts

/**
 * HTTP Client Interface
 */

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface HttpRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpClientPort {
  /**
   * Perform GET request
   */
  get<T = any>(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<HttpResponse<T>>;

  /**
   * Perform POST request
   */
  post<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<HttpResponse<T>>;

  /**
   * Perform PUT request
   */
  put<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<HttpResponse<T>>;

  /**
   * Perform DELETE request
   */
  delete<T = any>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>>;

  /**
   * Set default headers
   */
  setDefaultHeaders(headers: Record<string, string>): void;

  /**
   * Get current configuration
   */
  getConfig(): HttpClientConfig;
}
