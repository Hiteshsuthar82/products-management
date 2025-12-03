import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_CONSTANTS } from '../constants/api.constants';
import { ApiResponse, ApiError } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = API_CONSTANTS.BASE_URL;

  constructor(private http: HttpClient) {}

  /**
   * Generic GET request
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Generic POST request
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * POST request that returns full response structure
   */
  postWithFullResponse<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * PUT request that returns full response structure
   */
  putWithFullResponse<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * POST request with FormData for file uploads
   */
  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, formData)
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Generic PUT request
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Generic DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`)
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Handle successful API response
   */
  private handleResponse<T>(response: ApiResponse<T>): T {
    if (response.success) {
      return response.data as T;
    } else {
      throw new Error(response.message || 'API request failed');
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Build query parameters from object
   */
  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    
    return httpParams;
  }


  // Add these two methods to your existing ApiService

getBlob(endpoint: string, params?: any): Observable<Blob> {
  let httpParams = new HttpParams();
  
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
  }

  return this.http.get(`${this.baseUrl}${endpoint}`, {
    params: httpParams,
    responseType: 'blob'
  }).pipe(
    catchError(error => this.handleBlobError(error))
  );
}

private handleBlobError(error: any): Observable<never> {
  let errorMessage = 'Failed to download file';

  if (error.error instanceof Blob) {
    const reader = new FileReader();
    reader.onload = () => console.error('Server error (blob):', reader.result);
    reader.readAsText(error.error);
  } else if (error.message) {
    errorMessage = error.message;
  }

  console.error('Blob API Error:', error);
  return throwError(() => new Error(errorMessage));
}

}
