import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONSTANTS, STORAGE_KEYS, HTTP_STATUS } from '@/constants/api.constants';
import { ApiResponse } from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONSTANTS.BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<any>>) => {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          // Clear storage and redirect to login
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.api.post<ApiResponse<T>>(endpoint, params || {});
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Request failed');
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.api.post<ApiResponse<T>>(endpoint, data || {});
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Request failed');
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.api.put<ApiResponse<T>>(endpoint, data || {});
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Request failed');
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async delete<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.api.delete<ApiResponse<T>>(endpoint, { data });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Request failed');
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const response = await axios.post<ApiResponse<T>>(
        `${API_CONSTANTS.BASE_URL}${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Request failed');
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      console.error('API Error:', message);
    } else {
      console.error('Error:', error);
    }
  }
}

export const apiService = new ApiService();

