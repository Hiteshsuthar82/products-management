import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { 
  OrdersListResponse, 
  OrderWithDetails, 
  OrderFilters 
} from '../../../models/order.model';
import { 
  ORDER_STATUS, 
  PAYMENT_STATUS, 
  PAYMENT_METHOD, 
  PAGINATION 
} from '../../../constants/api.constants';

@Component({
  selector: 'app-orders-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss'
})
export class OrdersListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  orders: OrderWithDetails[] = [];
  loading = false;
  error = '';
  isExporting = false;
  
  // Pagination
  currentPage = PAGINATION.DEFAULT_PAGE;
  pageSize = PAGINATION.DEFAULT_LIMIT;
  totalItems = 0;
  totalPages = 0;
  
  // Filters
  filters: OrderFilters = {
    page: this.currentPage,
    limit: this.pageSize,
    status: '',
    paymentStatus: '',
    paymentMethod: ''
  };
  
  // Filter options
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: ORDER_STATUS.PENDING, label: 'Pending' },
    { value: ORDER_STATUS.CONFIRMED, label: 'Confirmed' },
    { value: ORDER_STATUS.PROCESSING, label: 'Processing' },
    { value: ORDER_STATUS.SHIPPED, label: 'Shipped' },
    { value: ORDER_STATUS.DELIVERED, label: 'Delivered' },
    { value: ORDER_STATUS.CANCELLED, label: 'Cancelled' },
    { value: ORDER_STATUS.RETURNED, label: 'Returned' }
  ];
  
  paymentStatusOptions = [
    { value: '', label: 'All Payment Statuses' },
    { value: PAYMENT_STATUS.PENDING, label: 'Pending' },
    { value: PAYMENT_STATUS.PAID, label: 'Paid' },
    { value: PAYMENT_STATUS.FAILED, label: 'Failed' },
    { value: PAYMENT_STATUS.REFUNDED, label: 'Refunded' }
  ];
  
  paymentMethodOptions = [
    { value: '', label: 'All Payment Methods' },
    { value: PAYMENT_METHOD.CASH, label: 'Cash on Delivery' },
    { value: PAYMENT_METHOD.ONLINE, label: 'Online Payment' }
  ];
  
  pageSizeOptions = [10, 25, 50, 100];   

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadOrders();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadOrders(): void {
    this.loading = true;
    this.error = '';
    
    this.orderService.getOrders(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: OrdersListResponse) => {
          if (response) {
            this.orders = response.orders;
            this.totalItems = response.total;
            this.totalPages = response.pages;
            this.currentPage = response.page;
          } else {
            this.error = 'Failed to load orders';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.error = 'Failed to load orders. Please try again.';
          this.loading = false;
        }
      });
  }

  exportToExcel(): void {
    this.isExporting = true;
    this.error = '';
  
    this.orderService.exportOrders().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
  
        const today = new Date().toISOString().split('T')[0];
        link.download = `orders_export_${today}.xlsx`;
  
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
  
        this.isExporting = false;
      },
      error: (err: { message: string; }) => {
        this.error = err.message || 'Failed to export orders';
        this.isExporting = false;
      }
    });
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
    this.filters.page = page;
    this.loadOrders();
  }
  
  onPageSizeChange(size: number): void {
  this.pageSize = size;
  this.currentPage = 1;
  this.filters.limit = size;
  this.filters.page = 1;
  this.loadOrders();
}
  
  onFilterChange(): void {
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadOrders();
  }
  
  onSearchChange(searchTerm: string): void {
    this.filters.search = searchTerm;
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadOrders();
  }
  
  clearFilters(): void {
    this.filters = {
      page: 1,
      limit: this.pageSize,
      status: '',
      paymentStatus: '',
      paymentMethod: ''
    };
    this.currentPage = 1;
    this.loadOrders();
  }

  clearFilter(filterType: string): void {
    switch (filterType) {
      case 'status':
        this.filters.status = '';
        break;
      case 'paymentStatus':
        this.filters.paymentStatus = '';
        break;
      case 'paymentMethod':
        this.filters.paymentMethod = '';
        break;
      case 'search':
        this.filters.search = '';
        break;
    }
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadOrders();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.status || this.filters.paymentStatus || this.filters.paymentMethod || this.filters.search);
  }

  getStatusLabel(value: string): string {
    const option = this.statusOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  getPaymentStatusLabel(value: string): string {
    const option = this.paymentStatusOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  getPaymentMethodLabel(value: string): string {
    const option = this.paymentMethodOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }
  
  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }
  
  updateOrderStatus(orderId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    
    this.orderService.updateOrderStatus({
      orderId,
      status: newStatus
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.error = 'Failed to update order status. Please try again.';
      }
    });
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
      month: 'short',
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

  // Helper method for template
  get Math() {
    return Math;
  }
}
