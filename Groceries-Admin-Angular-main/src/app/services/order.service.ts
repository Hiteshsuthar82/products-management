import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONSTANTS } from '../constants/api.constants';
import { 
  OrdersListResponse, 
  OrderResponse, 
  UpdateOrderStatusRequest, 
  OrderFilters 
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private apiService: ApiService) {}

  /**
   * Get all orders with filters
   */
  getOrders(filters: OrderFilters = {}): Observable<OrdersListResponse> {
    return this.apiService.post<OrdersListResponse>(API_CONSTANTS.ADMIN.ORDERS, filters);
  }

  /**
   * Get single order details
   */
  getOrderDetails(orderId: string): Observable<OrderResponse> {
    return this.apiService.post<OrderResponse>(API_CONSTANTS.ADMIN.ORDERS_DETAIL, { orderId });
  }

  /**
   * Update order status
   */
  updateOrderStatus(statusData: UpdateOrderStatusRequest): Observable<OrderResponse> {
    return this.apiService.post<OrderResponse>(API_CONSTANTS.ADMIN.ORDERS_STATUS, statusData);
  }

  exportOrders(): Observable<Blob> {
    return this.apiService.getBlob(API_CONSTANTS.ORDERS.EXPORT_ORDERS);
  }
}
