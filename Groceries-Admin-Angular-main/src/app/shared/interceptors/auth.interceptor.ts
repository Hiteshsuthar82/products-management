import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { STORAGE_KEYS } from '../../constants/api.constants';

export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  
  // Get token from localStorage
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  
  // Clone request and add authorization header if token exists
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        // Clear stored data
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        
        // Redirect to login page
        router.navigate(['/auth/login']);
      }
      
      // Handle 403 Forbidden errors
      if (error.status === 403) {
        // Redirect to unauthorized page or show error
        router.navigate(['/unauthorized']);
      }

      return throwError(() => error);
    })
  );
}
