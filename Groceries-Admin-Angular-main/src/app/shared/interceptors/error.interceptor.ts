import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function errorInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else {
          switch (error.status) {
            case 400:
              errorMessage = 'Bad Request';
              break;
            case 401:
              errorMessage = 'Unauthorized';
              break;
            case 403:
              errorMessage = 'Forbidden';
              break;
            case 404:
              errorMessage = 'Not Found';
              break;
            case 500:
              errorMessage = 'Internal Server Error';
              break;
            default:
              errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
        }
      }

      // Create a new error with the formatted message
      const formattedError = new HttpErrorResponse({
        error: {
          ...error.error,
          message: errorMessage
        },
        status: error.status,
        statusText: error.statusText
      });

      return throwError(() => formattedError);
    })
  );
}
