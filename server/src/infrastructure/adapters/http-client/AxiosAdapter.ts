// server/src/infrastructure/adapters/http-client/AxiosAdapter.ts

import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { HttpClientConfig, HttpClientPort, HttpResponse } from './HttpClientPort';

/**
 * Axios implementation of `HttpClientPort`
 */
export class AxiosAdapter implements HttpClientPort {
  private axiosInstance: AxiosInstance;
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // error interceptor
    this.axiosInstance.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        throw this.mapError(error);
      }
    );
  }

  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.get(url, { params, headers });
    return this.mapResponse(response);
  }

  async post<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.post(url, data, { headers });
    return this.mapResponse(response);
  }

  async put<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.put(url, data, { headers });
    return this.mapResponse(response);
  }

  async delete<T = any>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.delete(url, { headers });
    return this.mapResponse(response);
  }

  setDefaultHeaders(headers: Record<string, string>): void {
    Object.assign(this.axiosInstance.defaults.headers.common, headers);
  }

  getConfig(): HttpClientConfig {
    return { ...this.config };
  }

  /**
   * Map axios response to HttpResponse format
   */
  private mapResponse<T>(axiosResponse: AxiosResponse<T>): HttpResponse<T> {
    return {
      data: axiosResponse.data,
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      headers: axiosResponse.headers as Record<string, string>,
    };
  }

  /**
   * Error mapping
   */
  private mapError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error status
      const message = `HTTP ${error.response.status}: ${error.response.statusText}`;
      const httpError = new Error(message);
      (httpError as any).status = error.response.status;
      (httpError as any).response = error.response.data;
      return httpError;
    } else if (error.request) {
      // request was made but no response received
      return new Error('Network error: No response received');
    } else {
      // something else happened
      return new Error(`Request error: ${error.message}`);
    }
  }
}
