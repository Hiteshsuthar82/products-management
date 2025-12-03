import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { CreateProductRequest, UpdateProductRequest, ProductImage } from '../../../models/product.model';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule], 
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  isLoading = false;
  errorMessage = '';
  categories: any[] = [];
  subcategories: any[] = [];
  
  // Form field arrays
  colors: string[] = [];
  sizes: string[] = [];
  tags: string[] = [];
  
  // Image upload properties
  uploadedImages: ProductImage[] = [];
  maxFileSize = 10 * 1024 * 1024; // 10MB
  allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  maxImages = 10; // Maximum number of images allowed

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    
    // Check if we're in edit mode
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.loadProduct();
    }
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      price: ['', [Validators.required, Validators.min(0)]],
      originalPrice: ['', [Validators.min(0)]],
      categoryId: ['', [Validators.required]],
      subcategoryId: [''],
      brand: [''],
      stock: ['', [Validators.required, Validators.min(0)]],
      weight: ['', [Validators.min(0)]],
      // Dimensions
      length: ['', [Validators.min(0)]],
      width: ['', [Validators.min(0)]],
      height: ['', [Validators.min(0)]],
      // Arrays
      colors: [[]],
      sizes: [[]],
      tags: [[]],
      // Status
      featured: [false],
      discount: ['', [Validators.min(0), Validators.max(100)]],
      isActive: [true]
    });
  }

  private loadCategories(): void {
    this.categoryService.getParentCategories().subscribe({
      next: (response: any) => {
        this.categories = response.categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  private loadSubcategories(categoryId: string): void {
    this.categoryService.getSubcategories(categoryId).subscribe({
      next: (response: any) => {
        this.subcategories = response.categories || [];
      },
      error: (error) => {
        console.error('Error loading subcategories:', error);
        this.subcategories = [];
      }
    });
  }

  onCategoryChange(): void {
    const categoryId = this.productForm.get('categoryId')?.value;
    if (categoryId) {
      this.loadSubcategories(categoryId);
    } else {
      this.subcategories = [];
    }
    // Reset subcategory when category changes
    this.productForm.patchValue({ subcategoryId: '' });
  }

  private loadProduct(): void {
    if (!this.productId) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.productService.getProductById(this.productId).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success && response.data) {
          const product = response.data;
          
          // Determine parent category and subcategory
          const parentCategoryId = product.category?.parentId || null;
          const isSubcategory = !!parentCategoryId;
          
          // Populate the form with existing product data
          const formData = {
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice || '',
            // If product.category has a parent, set parent category to that and subcategory to product.category
            categoryId: isSubcategory ? parentCategoryId : product.category?._id || '',
            subcategoryId: isSubcategory ? (product.category?._id || '') : '',
            brand: product.brand || '',
            stock: product.stock,
            weight: product.weight || '',
            // Dimensions
            length: product.dimensions?.length || '',
            width: product.dimensions?.width || '',
            height: product.dimensions?.height || '',
            // Status
            featured: product.featured,
            discount: product.discount || '',
            isActive: product.isActive
          };
          
          // Use setTimeout to ensure form is ready
          setTimeout(() => {
            this.productForm.patchValue(formData);
            // If subcategory, load subcategories for the parent and keep selection
            if (isSubcategory && parentCategoryId) {
              this.loadSubcategories(parentCategoryId);
            }
            // Force form to mark as touched to trigger validation display
            this.productForm.markAsTouched();
          }, 100);
          
          // Load array fields
          this.colors = product.colors || [];
          this.sizes = product.sizes || [];
          this.tags = product.tags || [];
          
          // Load existing images
          if (product.images && product.images.length > 0) {
            this.uploadedImages = product.images;
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to load product data';
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.valid && (this.uploadedImages.length > 0 || this.isEditMode)) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.productForm.value;
      const productData = {
        ...formData,
        images: this.uploadedImages,
        // Include array fields
        colors: this.colors,
        sizes: this.sizes,
        tags: this.tags,
        // Include dimensions object
        dimensions: {
          length: formData.length || undefined,
          width: formData.width || undefined,
          height: formData.height || undefined
        }
      };


      if (this.isEditMode && this.productId) {
        const updateData: UpdateProductRequest = {
          productId: this.productId,
          ...productData
        };

        this.productService.updateProduct(updateData).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/products']);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = error.message || 'Failed to update product';
          }
        });
      } else {
        const createData: CreateProductRequest = {
          ...productData
        };

        this.productService.createProduct(createData).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/products']);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = error.message || 'Failed to create product';
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      if (this.uploadedImages.length === 0 && !this.isEditMode) {
        this.errorMessage = 'Please upload at least one product image';
      }
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${fieldName} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${fieldName} cannot exceed ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  // Image upload methods

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]): void {
    // Check if adding these files would exceed the maximum
    if (this.uploadedImages.length + files.length > this.maxImages) {
      this.errorMessage = `You can only upload up to ${this.maxImages} images. You currently have ${this.uploadedImages.length} images.`;
      return;
    }

    // Validate each file
    for (const file of files) {
      if (!this.allowedFileTypes.includes(file.type)) {
        this.errorMessage = `File "${file.name}" is not a valid image type. Please upload JPG, PNG, or GIF files.`;
        return;
      }
      
      if (file.size > this.maxFileSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        this.errorMessage = `File "${file.name}" is too large (${fileSizeMB}MB). Please upload files smaller than 10MB.`;
        return;
      }
    }

    this.errorMessage = '';
    this.uploadMultipleFiles(files);
  }


  private uploadMultipleFiles(files: File[]): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Upload files to the server
    this.productService.uploadImages(files).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response && response.images) {
          // Add the uploaded images to the existing images
          this.uploadedImages = [...this.uploadedImages, ...response.images];
        } else {
          this.errorMessage = 'Failed to upload images - invalid response format';
        }
      },
      error: (error) => {
        this.isLoading = false;
        
        // Handle specific error types
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Failed to upload images. Please try again.';
        }
        
        // Show specific error for file size
        if (this.errorMessage.includes('File too large')) {
          this.errorMessage = 'File too large. Please select images smaller than 10MB each.';
        }
      }
    });
  }

  removeImage(index: number): void {
    const imageToRemove = this.uploadedImages[index];
    
    if (imageToRemove && imageToRemove.public_id) {
      // Delete image from server
      this.productService.deleteImage(imageToRemove.public_id).subscribe({
        next: () => {
          console.log('Image deleted from server:', imageToRemove.public_id);
        },
        error: (error) => {
          console.error('Failed to delete image from server:', error);
          // Still remove from local array even if server deletion fails
        }
      });
    }
    
    // Remove from local array
    this.uploadedImages.splice(index, 1);
  }

  // Set an image as the main image (move to first position)
  setMainImage(index: number): void {
    if (index > 0 && index < this.uploadedImages.length) {
      const image = this.uploadedImages.splice(index, 1)[0];
      this.uploadedImages.unshift(image);
    }
  }

  // Clear all images
  clearAllImages(): void {
    if (confirm('Are you sure you want to remove all images? This action cannot be undone.')) {
      // Delete all images from server
      this.uploadedImages.forEach(image => {
        if (image.public_id) {
          this.productService.deleteImage(image.public_id).subscribe({
            next: () => console.log('Image deleted:', image.public_id),
            error: (error) => console.error('Failed to delete image:', error)
          });
        }
      });
      
      // Clear local array
      this.uploadedImages = [];
    }
  }

  // Reorder images (placeholder for future drag & drop functionality)
  reorderImages(): void {
    // TODO: Implement drag & drop reordering
  }

  // Track by function for better performance
  trackByImageId(index: number, image: ProductImage): string {
    return image.public_id || index.toString();
  }

  // Array field methods
  addColor(color: string): void {
    if (color && color.trim() && !this.colors.includes(color.trim())) {
      this.colors.push(color.trim());
    }
  }

  removeColor(index: number): void {
    this.colors.splice(index, 1);
  }

  addSize(size: string): void {
    if (size && size.trim() && !this.sizes.includes(size.trim())) {
      this.sizes.push(size.trim());
    }
  }

  removeSize(index: number): void {
    this.sizes.splice(index, 1);
  }

  addTag(tag: string): void {
    if (tag && tag.trim() && !this.tags.includes(tag.trim())) {
      this.tags.push(tag.trim());
    }
  }

  removeTag(index: number): void {
    this.tags.splice(index, 1);
  }

  // Test method for debugging form population
  testFormPopulation(): void {
    console.log('Testing form population...');
    const testData = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      originalPrice: 129.99,
      categoryId: 'test-category-id',
      brand: 'Test Brand',
      stock: 50,
      weight: 2.5,
      length: 10,
      width: 5,
      height: 3,
      featured: true,
      discount: 15,
      isActive: true
    };
    
    console.log('Setting test data:', testData);
    this.productForm.patchValue(testData);
    console.log('Form after test patchValue:', this.productForm.value);
    
    // Test array fields
    this.colors = ['Red', 'Blue', 'Green'];
    this.sizes = ['S', 'M', 'L', 'XL'];
    this.tags = ['test', 'debug', 'sample'];
    
    console.log('Array fields set:', { colors: this.colors, sizes: this.sizes, tags: this.tags });
  }
}
