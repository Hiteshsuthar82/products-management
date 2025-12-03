export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  status?: number;
  data?: ValidationError[];
}

export interface PaginatedResponse<T> {
  count: number;
  total: number;
  page: number;
  pages: number;
  data: T[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams {
  search?: string;
}

export interface FilterParams {
  [key: string]: any;
}
