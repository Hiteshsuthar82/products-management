import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { 
  OrderWithDetails, 
  UpdateOrderStatusRequest 
} from '../../../models/order.model';
import { 
  ORDER_STATUS, 
  PAYMENT_STATUS, 
  PAYMENT_METHOD 
} from '../../../constants/api.constants';

@Component({
  selector: 'app-order-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss'
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  order: OrderWithDetails | null = null;
  loading = false;
  error = '';
  orderId = '';
  
  // Status update form
  showStatusUpdateForm = false;
  statusUpdateForm: UpdateOrderStatusRequest = {
    orderId: '',
    status: 'pending'
  };
  
  // Status options
  statusOptions = [
    { value: ORDER_STATUS.PENDING, label: 'Pending' },
    { value: ORDER_STATUS.CONFIRMED, label: 'Confirmed' },
    { value: ORDER_STATUS.PROCESSING, label: 'Processing' },
    { value: ORDER_STATUS.SHIPPED, label: 'Shipped' },
    { value: ORDER_STATUS.DELIVERED, label: 'Delivered' },
    { value: ORDER_STATUS.CANCELLED, label: 'Cancelled' },
    { value: ORDER_STATUS.RETURNED, label: 'Returned' }
  ];
  
  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.orderId = params['id'];
      if (this.orderId) {
        this.loadOrderDetails();
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadOrderDetails(): void {
    this.loading = true;
    this.error = '';
    
    this.orderService.getOrderDetails(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.order = response;
            this.statusUpdateForm.orderId = this.order!._id;
            this.statusUpdateForm.status = this.order!.orderStatus;
          } else {
            this.error = 'Failed to load order details';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading order details:', error);
          this.error = 'Failed to load order details. Please try again.';
          this.loading = false;
        }
      });
  }
  
  toggleStatusUpdateForm(): void {
    this.showStatusUpdateForm = !this.showStatusUpdateForm;
    if (this.showStatusUpdateForm && this.order) {
      this.statusUpdateForm = {
        orderId: this.order._id,
        status: this.order.orderStatus,
        trackingNumber: this.order.shippingInfo.trackingNumber || '',
        carrier: this.order.shippingInfo.carrier || '',
        estimatedDelivery: this.order.shippingInfo.estimatedDelivery || ''
      };
    }
  }
  
  updateOrderStatus(): void {
    if (!this.statusUpdateForm.orderId) return;
    
    this.loading = true;
    
    this.orderService.updateOrderStatus(this.statusUpdateForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.loadOrderDetails();
            this.showStatusUpdateForm = false;
            // Show success message
            this.showSuccessMessage('Order status updated successfully');
          } else {
            this.error = response.message || 'Failed to update order status';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating order status:', error);
          this.error = 'Failed to update order status. Please try again.';
          this.loading = false;
        }
      });
  }
  
  cancelStatusUpdate(): void {
    this.showStatusUpdateForm = false;
    if (this.order) {
      this.statusUpdateForm = {
        orderId: this.order._id,
        status: this.order.orderStatus
      };
    }
  }
  
  goBack(): void {
    this.router.navigate(['/orders']);
  }
  
  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [ORDER_STATUS.PROCESSING]: 'bg-purple-100 text-purple-800',
      [ORDER_STATUS.SHIPPED]: 'bg-indigo-100 text-indigo-800',
      [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
      [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
      [ORDER_STATUS.RETURNED]: 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }
  
  getPaymentStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      [PAYMENT_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
      [PAYMENT_STATUS.PAID]: 'bg-green-100 text-green-800',
      [PAYMENT_STATUS.FAILED]: 'bg-red-100 text-red-800',
      [PAYMENT_STATUS.REFUNDED]: 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
  
  private showSuccessMessage(message: string): void {
    // You can implement a toast notification service here
    console.log('Success:', message);
  }
}
