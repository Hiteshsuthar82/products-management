import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { 
  UsersListResponse, 
  User, 
  UpdateUserStatusRequest 
} from '../../../models/user.model';
import { 
  USER_ROLES, 
  PAGINATION 
} from '../../../constants/api.constants';
import { UserModalComponent } from '../user-modal/user-modal';

interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: string;
  search?: string;
}

@Component({
  selector: 'app-users-list',
  imports: [CommonModule, FormsModule, UserModalComponent],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss'
})
export class UsersListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  users: User[] = [];
  loading = false;
  error = '';
  isExporting = false;
  
  // Modal state
  showUserModal = false;
  selectedUser: User | null = null;
  
  // Pagination
  currentPage = PAGINATION.DEFAULT_PAGE;
  pageSize = PAGINATION.DEFAULT_LIMIT;
  totalItems = 0;
  totalPages = 0;
  
  // Filters
  filters: UserFilters = {
    page: this.currentPage,
    limit: this.pageSize,
    role: '',
    isActive: '',
    search: ''
  };
  
  // Filter options
  roleOptions = [
    { value: '', label: 'All Roles' },
    { value: USER_ROLES.ADMIN, label: 'Admin' },
    { value: USER_ROLES.CUSTOMER, label: 'Customer' }
  ];
  
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];
  
  pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS;
  
  constructor(private userService: UserService) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadUsers(): void {
    this.loading = true;
    this.error = '';
    
    // Convert string values to appropriate types and filter out empty values
    const apiFilters: any = {
      page: this.filters.page,
      limit: this.filters.limit
    };
    
    // Only add filters if they have meaningful values
    if (this.filters.role && this.filters.role !== '') {
      apiFilters.role = this.filters.role;
    }
    
    if (this.filters.isActive !== undefined && this.filters.isActive !== '' && this.filters.isActive !== null) {
      apiFilters.isActive = this.filters.isActive === 'true';
    }
    
    if (this.filters.search && this.filters.search.trim() !== '') {
      apiFilters.search = this.filters.search.trim();
    }
    
    this.userService.getUsers(apiFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: UsersListResponse) => {
          if (response) {
            this.users = response.users;
            this.totalItems = response.total;
            this.totalPages = response.pages;
            this.currentPage = response.page;
          } else {
            this.error = 'Failed to load users';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.error = 'Failed to load users. Please try again.';
          this.loading = false;
        }
      });
  }
  
  exportToExcel(): void {
    this.isExporting = true;
    this.error = '';
  
    this.userService.exportUsers().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
  
        const today = new Date().toISOString().split('T')[0];
        link.download = `users_export_${today}.xlsx`;
  
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
  
        this.isExporting = false;
      },
      error: (err: { message: string; }) => {
        this.error = err.message || 'Failed to export users';
        this.isExporting = false;
      }
    });
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.filters.page = page;
    this.loadUsers();
  }
  
  onPageSizeChange(size: number): void {
    this.pageSize = size;        
    this.currentPage = 1;
    this.filters.limit = size;
    this.filters.page = 1;
    this.loadUsers();
  }
  
  onFilterChange(): void {
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadUsers();
  }
  
  onSearchChange(searchTerm: string): void {
    this.filters.search = searchTerm;
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadUsers();
  }
  
  clearFilters(): void {
    this.filters = {
      page: 1,
      limit: this.pageSize,
      role: '',
      isActive: '',
      search: ''
    };
    this.currentPage = 1;
    this.loadUsers();
  }
  
  toggleUserStatus(user: User): void {
    const statusData: UpdateUserStatusRequest = {
      userId: user._id,
      isActive: !user.isActive
    };
    
    this.userService.updateUserStatus(statusData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            user.isActive = !user.isActive;
            // Show success message
            console.log(`User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
          } else {
            this.error = response.message || 'Failed to update user status';
          }
        },
        error: (error) => {
          console.error('Error updating user status:', error);
          this.error = 'Failed to update user status. Please try again.';
        }
      });
  }
  
  getRoleBadgeClass(role: string): string {
    return role === USER_ROLES.ADMIN 
      ? 'bg-purple-50 text-purple-700 border border-purple-200' 
      : 'bg-blue-50 text-blue-700 border border-blue-200';
  }
  
  getStatusBadgeClass(isActive: boolean): string {
    return isActive 
      ? 'bg-green-50 text-green-700 border border-green-200' 
      : 'bg-red-50 text-red-700 border border-red-200';
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
  
  hasActiveFilters(): boolean {
    return !!(this.filters.role || this.filters.isActive || this.filters.search);
  }
  
  clearFilter(filterType: string): void {
    switch (filterType) {
      case 'role':
        this.filters.role = '';
        break;
      case 'isActive':
        this.filters.isActive = '';
        break;
      case 'search':
        this.filters.search = '';
        break;
    }
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadUsers();
  }
  
  getRoleLabel(value: string): string {
    const option = this.roleOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }
  
  getStatusLabel(value: string): string {
    const option = this.statusOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  // Modal methods
  openAddUserModal(): void {
    this.selectedUser = null;
    this.showUserModal = true;
  }

  openEditUserModal(user: User): void {
    this.selectedUser = user;
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
  }

  onUserSaved(updatedUser: User): void {
    if (this.selectedUser) {
      // Update existing user in the list
      const index = this.users.findIndex(u => u._id === updatedUser._id);
      if (index !== -1) {
        this.users[index] = updatedUser;
      }
    } else {
      // Add new user to the list
      this.users.unshift(updatedUser);
      this.totalItems++;
    }
    this.closeUserModal();
  }

  // Helper method for template
  get Math() {
    return Math;
  }
}
