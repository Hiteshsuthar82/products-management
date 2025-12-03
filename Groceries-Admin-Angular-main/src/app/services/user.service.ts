import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONSTANTS } from '../constants/api.constants';
import { 
  UsersListResponse, 
  UpdateUserStatusRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService) {}

  /**
   * Get all users with filters
   */
  getUsers(filters: any = {}): Observable<UsersListResponse> {
    return this.apiService.post<UsersListResponse>(API_CONSTANTS.ADMIN.USERS, filters);
  }

  /**
   * Update user status
   */
  updateUserStatus(statusData: UpdateUserStatusRequest): Observable<any> {
    return this.apiService.post(API_CONSTANTS.ADMIN.USERS_STATUS, statusData);
  }

  /**
   * Create a new user
   */
  createUser(userData: CreateUserRequest): Observable<UserResponse> {
    return this.apiService.post<UserResponse>('/api/auth/register', userData);
  }

  /**
   * Update user information
   */
  updateUser(userData: UpdateUserRequest): Observable<UserResponse> {
    return this.apiService.put<UserResponse>(`/api/admin/users/${userData.userId}`, userData);
  }

  /**
   * Get user details by ID
   */
  getUserById(userId: string): Observable<UserResponse> {
    return this.apiService.get<UserResponse>(`/api/admin/users/${userId}`);
  }

  exportUsers(): Observable<Blob> {
    return this.apiService.getBlob(API_CONSTANTS.ADMIN.EXPORT_USERS);
  }
}
