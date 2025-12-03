import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONSTANTS } from '../constants/api.constants';
import { DashboardResponse } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private apiService: ApiService) {}

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<DashboardResponse> {
    return this.apiService.post<DashboardResponse>(API_CONSTANTS.ADMIN.DASHBOARD, {});
  }
  

// Updated service method to include status parameter
getOrderStatusDistribution(params: any = {}): Observable<any> {
  const queryParams = new URLSearchParams();
  
  if (params.period) queryParams.append('period', params.period);
  if (params.status) queryParams.append('status', params.status);
  if (params.year) queryParams.append('year', params.year.toString());
  if (params.month) queryParams.append('month', params.month.toString());
  if (params.day) queryParams.append('day', params.day.toString());
  
  // Add custom date range parameters
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const url = `${API_CONSTANTS.ADMIN.ORDER_STATUS_DISTRIBUTION}?${queryParams.toString()}`;
  return this.apiService.get<any>(url);
}
}
