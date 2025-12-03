import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { ProductsListResponse, ProductWithCategory, ProductFilters } from '../../../models/product.model';
import { PAGINATION } from '../../../constants/api.constants';

@Component({
  selector: 'app-products-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss'
})
export class ProductsListComponent implements OnInit {
  products: ProductWithCategory[] = [];
  isLoading = true;
  errorMessage = '';
  currentPage = PAGINATION.DEFAULT_PAGE;
  totalPages = 0;
  totalItems = 0;
  pageSize = PAGINATION.DEFAULT_LIMIT;
  deletingProductId: string | null = null;
  isExporting = false;
  isImporting = false;
  showImportModal = false;
  selectedFile: File | null = null;
  importResults: any = null;

  filters: ProductFilters = {
    page: this.currentPage,
    limit: this.pageSize
  };

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Ensure filters have current page
    this.filters.page = this.currentPage;

    this.productService.getProducts(this.filters).subscribe({
      next: (response: any) => {
        this.products = response.products || [];
        this.currentPage = response.page || this.currentPage;
        this.totalPages = response.pages || 0;
        this.totalItems = response.total || 0;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load products';
        this.isLoading = false;
      }
    });
  }

  exportToExcel(): void {
    this.isExporting = true;
    this.errorMessage = '';
  
    this.productService.exportProducts().subscribe({
      next: (blob: Blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with current date
        const currentDate = new Date().toISOString().split('T')[0];
        link.download = `products_export_${currentDate}.xlsx`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.isExporting = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to export products';
        this.isExporting = false;
      }
    });
  }

  openImportModal(): void {
    this.showImportModal = true;
    this.selectedFile = null;
    this.importResults = null;
    this.errorMessage = '';
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.selectedFile = null;
    this.importResults = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (validTypes.includes(file.type)) {
        this.selectedFile = file;
        this.errorMessage = '';
      } else {
        this.errorMessage = 'Please select a valid Excel file (.xlsx or .xls)';
        this.selectedFile = null;
      }
    }
  }

  importFromExcel(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file to import';
      return;
    }

    this.isImporting = true;
    this.errorMessage = '';

    this.productService.importProducts(this.selectedFile).subscribe({
      next: (response: any) => {
        this.importResults = response;
        this.isImporting = false;
        if (response.imported > 0) {
          // Reload products
          this.loadProducts();
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to import products';
        this.isImporting = false;
      }
    });
  }

  downloadSampleFile(): void {
    // Export products and use as sample
    this.productService.exportProducts().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'products_import_sample.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Failed to download sample file', error);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.filters.page = page;
    this.loadProducts();
  }

  onSearch(searchTerm: string): void {
    this.filters.search = searchTerm || undefined;
    this.filters.page = 1;
    this.currentPage = 1;
    this.loadProducts();
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.currentPage = 1;
    this.loadProducts();
  }

  toggleProductStatus(product: ProductWithCategory): void {
    this.errorMessage = '';
    
    this.productService.toggleProductStatus(product._id).subscribe({
      next: (response: any) => {
        this.loadProducts();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update product status';
      }
    });
  }

  deleteProduct(productId: string): void {
    const product = this.products.find(p => p._id === productId);
    const productName = product ? product.name : 'this product';
    
    if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      this.deletingProductId = productId;
      this.errorMessage = '';
      
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.deletingProductId = null;
          this.loadProducts();
        },
        error: (error) => {
          this.deletingProductId = null;
          this.errorMessage = error.message || 'Failed to delete product';
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  getStatusBadgeClass(isActive: boolean, isOutOfStock: boolean): string {
    if (!isActive) return 'bg-red-100 text-red-800';
    if (isOutOfStock) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }

  getStatusText(isActive: boolean, isOutOfStock: boolean): string {
    if (!isActive) return 'Inactive';
    if (isOutOfStock) return 'Out of Stock';
    return 'Active';
  }

  get Math() {
    return Math;
  }
}
