import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../services/category.service';
import { Category, CategoryWithParent, CategoryStats } from '../../../models/category.model';
import { CategoryModalComponent } from '../category-modal/category-modal.component';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, CategoryModalComponent],
  templateUrl: './categories-list.html',
  styleUrl: './categories-list.scss'
})
export class CategoriesListComponent implements OnInit {
  categories: CategoryWithParent[] = [];
  filteredCategories: CategoryWithParent[] = [];
  displayedCategories: CategoryWithParent[] = [];
  parentCategories: CategoryWithParent[] = [];
  stats: CategoryStats | null = null;
  isLoading = false;
  errorMessage = '';
  isExporting = false;
  isImporting = false;
  showImportModal = false;
  selectedFile: File | null = null;
  importResults: any = null;
  
  // Search and filters
  searchTerm = '';
  filters = {
    type: undefined as string | undefined,
    isActive: undefined as boolean | undefined
  };
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50];
  totalPages = 1;
  
  // Modal state
  isModalOpen = false;
  selectedCategory: CategoryWithParent | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadParentCategories();
    this.loadStats();
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
      this.categoryService.getCategories({ includeChildren: false }).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.categories = response.data?.categories || response.categories || [];
          this.applyFilters();
        },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to load categories';
        console.error('Error loading categories:', error);
      }
    });
  }

  private loadParentCategories(): void {
    // Don't filter by isActive - include all parents so they can be selected in dropdown
    this.categoryService.getCategories({ level: 0 }).subscribe({
      next: (response: any) => {
        this.parentCategories = response.data?.categories || response.categories || [];
      },
      error: (error) => {
        console.error('Error loading parent categories:', error);
      }
    });
  }

  private loadStats(): void {
    this.categoryService.getCategoryStats().subscribe({
      next: (response: any) => {
        this.stats = response.data || response;
      },
      error: (error) => {
        console.error('Error loading category stats:', error);
        // Set default stats if API fails
        this.stats = {
          total: 0,
          active: 0,
          parentCategories: 0,
          subcategories: 0,
          withProducts: 0,
          withoutProducts: 0
        };
      }
    });
  }


  exportToExcel(): void {
    this.isExporting = true;
    this.errorMessage = '';
  
    this.categoryService.exportCategories().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
  
        const today = new Date().toISOString().split('T')[0];
        link.download = `categories_export_${today}.xlsx`;
  
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
  
        this.isExporting = false;
      },
      error: (err: { message: string; }) => {
        this.errorMessage = err.message || 'Failed to export categories';
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

    this.categoryService.importCategories(this.selectedFile).subscribe({
      next: (response: any) => {
        this.importResults = response;
        this.isImporting = false;
        if (response.imported > 0) {
          // Reload categories
          this.loadCategories();
          this.loadStats();
        }
      },
      error: (error) => {
        // Don't show error message if it's just existing categories
        this.importResults = error.error?.data || { imported: 0, failed: 0, errors: [] };
        this.isImporting = false;
      }
    });
  }

  downloadSampleFile(): void {
    // Download sample file via export API (which includes default data when DB is empty)
    this.categoryService.exportCategories().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'categories_import_sample.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Failed to download sample file', error);
      }
    });
  }
  
  openAddCategoryModal(): void {
    this.selectedCategory = null;
    this.isModalOpen = true;
  }

  openAddSubcategoryModal(): void {
    this.selectedCategory = null;
    this.isModalOpen = true;
  }

  openEditCategoryModal(category: CategoryWithParent): void {
    this.selectedCategory = category;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedCategory = null;
  }

  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.categories];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(searchLower) ||
        category.slug.toLowerCase().includes(searchLower));
    }

    // Apply type filter
    if (this.filters.type) {
      if (this.filters.type === 'parent') {
        filtered = filtered.filter(category => !category.parentId?._id);
      } else if (this.filters.type === 'subcategory') {
        filtered = filtered.filter(category => category.parentId?._id);
      }
    }

    // Apply status filter
    if (this.filters.isActive !== undefined) {
      filtered = filtered.filter(category => category.isActive === this.filters.isActive);
    }

    this.filteredCategories = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCategories.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    this.updateDisplayedCategories();
  }

  updateDisplayedCategories(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedCategories = this.filteredCategories.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateDisplayedCategories();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePagination();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  get totalItems(): number {
    return this.filteredCategories.length;
  }

  get Math() {
    return Math;
  }

  onCategorySaved(savedCategory: CategoryWithParent): void {
    // Refresh the categories list
    this.loadCategories();
    this.loadStats();
    
    // If we added a new parent category, refresh parent categories list
    if (!savedCategory.parentId?._id) {
      this.loadParentCategories();
    }
  }

  toggleCategoryStatus(category: CategoryWithParent): void {
    this.errorMessage = '';
    
    this.categoryService.toggleCategoryStatus(category._id).subscribe({
      next: (response: any) => {
        this.loadCategories();
        this.loadStats();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update category status';
      }
    });
  }

  deleteCategory(category: CategoryWithParent): void {
    if (confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      this.categoryService.deleteCategory(category._id).subscribe({
        next: () => {
          // Refresh the categories list
          this.loadCategories();
          this.loadStats();
          
          // If we deleted a parent category, refresh parent categories list
          if (!category.parentId?._id) {
            this.loadParentCategories();
          }
        },
        error: (error) => {
          alert(error.message || 'Failed to delete category');
          console.error('Error deleting category:', error);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
