import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONSTANTS } from '../constants/api.constants';
import { 
  ProductsListResponse, 
  ProductResponse, 
  CreateProductRequest, 
  UpdateProductRequest, 
  DeleteProductRequest,
  ProductFilters 
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private apiService: ApiService) {}

  /**
   * Get all products with filters
   */
  getProducts(filters: ProductFilters = {}): Observable<ProductsListResponse> {
    return this.apiService.post<ProductsListResponse>(API_CONSTANTS.ADMIN.PRODUCTS, filters);
  }

  /**
   * Get single product by ID
   */
  getProductById(productId: string): Observable<any> {
    return this.apiService.postWithFullResponse<any>(API_CONSTANTS.ADMIN.PRODUCTS_DETAIL, { productId });
  }

  /**
   * Create new product
   */
  createProduct(productData: CreateProductRequest): Observable<ProductResponse> {
    return this.apiService.post<ProductResponse>(API_CONSTANTS.ADMIN.PRODUCTS_ADD, productData);
  }

  /**
   * Update product
   */
  updateProduct(productData: UpdateProductRequest): Observable<ProductResponse> {
    return this.apiService.post<ProductResponse>(API_CONSTANTS.ADMIN.PRODUCTS_UPDATE, productData);
  }

  /**
   * Toggle product status
   */
  toggleProductStatus(productId: string): Observable<any> {
    return this.apiService.post(API_CONSTANTS.ADMIN.PRODUCTS_TOGGLE_STATUS, { productId });
  }

  /**
   * Delete product (soft delete)
   */
  deleteProduct(productId: string): Observable<any> {
    return this.apiService.post(API_CONSTANTS.ADMIN.PRODUCTS_DELETE, { productId });
  }

  /**
   * Upload product images
   */
  uploadImages(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    return this.apiService.postFormData(API_CONSTANTS.ADMIN.PRODUCTS_UPLOAD_IMAGES, formData);
  }

  /**
   * Delete product image
   */
  deleteImage(publicId: string): Observable<any> {
    return this.apiService.post(API_CONSTANTS.ADMIN.PRODUCTS_DELETE_IMAGE, { public_id: publicId });
  }

  // Add this to your ProductService
  exportProducts(): Observable<Blob> {
    return this.apiService.getBlob(API_CONSTANTS.PRODUCTS.EXPORT_PRODUCTS);
  }

  // Import products from Excel
  importProducts(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.postFormData(API_CONSTANTS.PRODUCTS.IMPORT_PRODUCTS, formData);
  }
}
