import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RedeemService } from '../../../services/redeem.service';
import { 
  RedeemRulesListResponse, 
  RedeemRule, 
  RedeemPointValueResponse,
  RedeemPointValue
} from '../../../models/redeem.model';
import { PAGINATION } from '../../../constants/api.constants';
import { RedeemModalComponent } from '../redeem-modal/redeem-modal';
import { PointValueModalComponent } from '../point-value-modal/point-value-modal';

interface RedeemFilters {
  page?: number;
  limit?: number;
  isActive: string;
  search: string;
}

@Component({
  selector: 'app-redeem-list',
  imports: [CommonModule, FormsModule, RedeemModalComponent, PointValueModalComponent],
  templateUrl: './redeem-list.html',
  styleUrl: './redeem-list.scss'
})
export class RedeemListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  rules: RedeemRule[] = [];
  loading = false;
  error = '';
  
  // Modal state
  showRedeemModal = false;
  selectedRule: RedeemRule | null = null;
  
  // Pagination
  currentPage = PAGINATION.DEFAULT_PAGE;
  pageSize = PAGINATION.DEFAULT_LIMIT;
  totalItems = 0;
  totalPages = 0;
  
  // Filters
  filters: RedeemFilters = {
    page: this.currentPage,
    limit: this.pageSize,
    isActive: '',
    search: ''
  };
  
  // Filter options
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];
  
  pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS;
  
  // Point value management
  pointValue: RedeemPointValue | null = null;
  pointValueLoading = false;
  pointValueError = '';
  showPointValueModal = false;
  
  constructor(private redeemService: RedeemService) {}
  
  ngOnInit(): void {
    this.loadRules();
    this.loadPointValue();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadRules(): void {
    this.loading = true;
    this.error = '';
    
    // Convert string values to appropriate types and filter out empty values
    const apiFilters: any = {
      page: this.filters.page,
      limit: this.filters.limit
    };
    
    // Only add filters if they have meaningful values
    if (this.filters.isActive && this.filters.isActive !== '') {
      apiFilters.isActive = this.filters.isActive === 'true';
    }
    
    if (this.filters.search && this.filters.search.trim() !== '') {
      apiFilters.search = this.filters.search.trim();
    }
    
    this.redeemService.getRedeemRules(apiFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: RedeemRulesListResponse) => {
          if (response) {
            this.rules = response.rules;
            this.totalItems = response.total;
            this.totalPages = response.pages;
            this.currentPage = response.page;
          } else {
            this.error = 'Failed to load redeem rules';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading redeem rules:', error);
          this.error = 'Failed to load redeem rules. Please try again.';
          this.loading = false;
        }
      });
  }
  
  loadPointValue(): void {
    this.pointValueLoading = true;
    this.pointValueError = '';
    
    this.redeemService.getRedeemPointValue()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: RedeemPointValueResponse) => {
          if (response) {
            this.pointValue = response;
          } else {
            this.pointValueError =  'Failed to load point value';
          }
          this.pointValueLoading = false;
        },
        error: (error) => {
          console.error('Error loading point value:', error);
          this.pointValueError = 'Failed to load point value. Please try again.';
          this.pointValueLoading = false;
        }
      });
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
    this.filters.page = page;
    this.loadRules();
  }
  
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.filters.limit = size;
    this.filters.page = 1;
    this.loadRules();
  }
  
  onFilterChange(): void {
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadRules();
  }
  
  onSearchChange(searchTerm: string): void {
    this.filters.search = searchTerm;
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadRules();
  }
  
  clearFilters(): void {
    this.filters = {
      page: 1,
      limit: this.pageSize,
      isActive: '',
      search: ''
    };
    this.currentPage = 1;
    this.loadRules();
  }
  
  // Modal methods
  openAddRuleModal(): void {
    this.selectedRule = null;
    this.showRedeemModal = true;
  }

  openEditRuleModal(rule: RedeemRule): void {
    this.selectedRule = rule;
    this.showRedeemModal = true;
  }

  closeRedeemModal(): void {
    this.showRedeemModal = false;
    this.selectedRule = null;
  }

  onRuleSaved(updatedRule: RedeemRule): void {
    if (this.selectedRule) {
      // Update existing rule in the list
      const index = this.rules.findIndex(r => r._id === updatedRule._id);
      if (index !== -1) {
        this.rules[index] = updatedRule;
      }
    } else {
      // Add new rule to the list
      this.rules.unshift(updatedRule);
      this.totalItems++;
    }
    this.closeRedeemModal();
  }

  deleteRule(rule: RedeemRule): void {
    if (confirm(`Are you sure you want to delete the rule "${rule.name}"?`)) {
      this.loading = true;
      this.error = '';
      
      // Check if we need to go back a page
      if (this.rules.length === 1 && this.currentPage > 1) {
        this.currentPage--;
        this.filters.page = this.currentPage;
      }
      
      this.redeemService.deleteRedeemRule(rule._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Reload rules to get fresh data from server
            this.loadRules();
          },
          error: (error) => {
            this.loading = false;
            console.error('Error deleting rule:', error);
            this.error = error.message || 'Failed to delete rule. Please try again.';
          }
        });
    }
  }

  toggleRuleStatus(rule: RedeemRule): void {
    const updateData = {
      ruleId: rule._id,
      isActive: !rule.isActive
    };
    
    this.redeemService.updateRedeemRule(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            rule.isActive = !rule.isActive;
          } else {
            this.error = response.message || 'Failed to update rule status';
          }
        },
        error: (error) => {
          console.error('Error updating rule status:', error);
          this.error = 'Failed to update rule status. Please try again.';
        }
      });
  }

  openPointValueModal(): void {
    this.showPointValueModal = true;
  }

  closePointValueModal(): void {
    this.showPointValueModal = false;
  }

  onPointValueUpdated(updatedPointValue: RedeemPointValue): void {
    this.pointValue = updatedPointValue;
    this.closePointValueModal();
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
    return !!(this.filters.isActive !== '' || this.filters.search);
  }
  
  clearFilter(filterType: string): void {
    switch (filterType) {
      case 'isActive':
        this.filters.isActive = '';
        break;
      case 'search':
        this.filters.search = '';
        break;
    }
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadRules();
  }
  
  getStatusLabel(value: string): string {
    const option = this.statusOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  // Helper method for template
  get Math() {
    return Math;
  }
}
