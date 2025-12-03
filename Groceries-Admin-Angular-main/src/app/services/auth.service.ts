import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { API_CONSTANTS, STORAGE_KEYS } from '../constants/api.constants';
import { 
  LoginRequest, 
  LoginResponse, 
  User, 
  UserResponse 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Initialize user from localStorage
    this.initializeUser();
  }

  /**
   * Initialize user from localStorage
   */
  private initializeUser(): void {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        this.clearUserData();
      }
    }
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>(API_CONSTANTS.AUTH.LOGIN, credentials)
      .pipe(
        tap((response: any) => {
          console.log(response);
          // Store token and user data
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response));
          
          // Update current user subject
          this.currentUserSubject.next(response as any);
        })
      );
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<User> {
    return this.apiService.post<User>(API_CONSTANTS.AUTH.ME, {})
      .pipe(
        tap(user => {
          // Update stored user data
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * Update user profile
   */
  updateProfile(profileData: Partial<User>): Observable<User> {
    return this.apiService.post<User>(API_CONSTANTS.AUTH.PROFILE, profileData)
      .pipe(
        tap(user => {
          // Update stored user data
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * Update password
   */
  updatePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>(API_CONSTANTS.AUTH.PASSWORD, passwordData)
      .pipe(
        tap(response => {
          // Update token and user data
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
          this.currentUserSubject.next(response.data as any);
        })
      );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.apiService.post(API_CONSTANTS.AUTH.LOGOUT, {})
      .pipe(
        tap(() => {
          this.clearUserData();
        })
      );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return !!token;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  /**
   * Get current user
   */
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get token
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Clear user data
   */
  private clearUserData(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    this.currentUserSubject.next(null);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }
}
