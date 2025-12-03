import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONSTANTS } from '../constants/api.constants';
import { 
  CategoriesListResponse, 
  CategoryResponse, 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  DeleteCategoryRequest,
  CategoryFilters,
  CategoryStatsResponse 
} from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private apiService: ApiService) {}

  /**
   * Get all categories with filters
   */
  getCategories(filters: CategoryFilters = {}): Observable<CategoriesListResponse> {
    return this.apiService.post<CategoriesListResponse>(API_CONSTANTS.CATEGORIES.LIST, filters);
  }

  /**
   * Get parent categories only
   */
  getParentCategories(): Observable<CategoriesListResponse> {
    return this.apiService.post<CategoriesListResponse>(API_CONSTANTS.CATEGORIES.PARENTS, {});
  }

  /**
   * Get subcategories by parent
   */
  getSubcategories(parentId: string): Observable<CategoriesListResponse> {
    return this.apiService.post<CategoriesListResponse>(API_CONSTANTS.CATEGORIES.CHILDREN, { parentId });
  }

  /**
   * Get single category details
   */
  getCategoryDetails(categoryId: string): Observable<CategoryResponse> {
    return this.apiService.post<CategoryResponse>(API_CONSTANTS.CATEGORIES.DETAIL, { categoryId });
  }

  /**
   * Create new category
   */
  createCategory(categoryData: CreateCategoryRequest): Observable<CategoryResponse> {
    return this.apiService.post<CategoryResponse>(API_CONSTANTS.CATEGORIES.ADD, categoryData);
  }

  /**
   * Create new category with file upload
   */
  createCategoryWithFile(categoryData: CreateCategoryRequest, file?: File): Observable<CategoryResponse> {
    const formData = new FormData();
    
    // Add category data to form data
    Object.keys(categoryData).forEach(key => {
      const value = categoryData[key as keyof CreateCategoryRequest];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    // Add file if provided
    if (file) {
      formData.append('image', file);
    }
    
    return this.apiService.postFormData<CategoryResponse>(API_CONSTANTS.CATEGORIES.ADD, formData);
  }

  /**
   * Update category
   */
  updateCategory(categoryData: UpdateCategoryRequest): Observable<CategoryResponse> {
    return this.apiService.post<CategoryResponse>(API_CONSTANTS.CATEGORIES.UPDATE, categoryData);
  }

  /**
   * Update category with file upload
   */
  updateCategoryWithFile(categoryData: UpdateCategoryRequest, file?: File): Observable<CategoryResponse> {
    const formData = new FormData();
    
    // Add category data to form data
    Object.keys(categoryData).forEach(key => {
      const value = categoryData[key as keyof UpdateCategoryRequest];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    // Add file if provided
    if (file) {
      formData.append('image', file);
    }
    
    return this.apiService.postFormData<CategoryResponse>(API_CONSTANTS.CATEGORIES.UPDATE, formData);
  }

  /**
   * Toggle category status
   */
  toggleCategoryStatus(categoryId: string): Observable<any> {
    return this.apiService.post(API_CONSTANTS.CATEGORIES.TOGGLE_STATUS, { categoryId });
  }

  /**
   * Delete category (soft delete)
   */
  deleteCategory(categoryId: string): Observable<any> {
    return this.apiService.post(API_CONSTANTS.CATEGORIES.DELETE, { categoryId });
  }

  /**
   * Get category statistics
   */
  getCategoryStats(): Observable<CategoryStatsResponse> {
    return this.apiService.post<CategoryStatsResponse>(API_CONSTANTS.CATEGORIES.STATS, {});
  }

  exportCategories(): Observable<Blob> {
    return this.apiService.getBlob(API_CONSTANTS.CATEGORIES.EXPORT_CATEGORIES);
  }

  // Import categories from Excel
  importCategories(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.postFormData(API_CONSTANTS.CATEGORIES.IMPORT_CATEGORIES, formData);
  }
}
