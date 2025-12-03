import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { Category, CategoryWithParent, CreateCategoryRequest, UpdateCategoryRequest } from '../../../models/category.model';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal 
      [isOpen]="isOpen" 
      [title]="modalTitle" 
      [showFooter]="true"
      (close)="onClose()">
      
      <!-- Form Content -->
      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Error Message -->
        <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ errorMessage }}</h3>
            </div>
          </div>
        </div>

        <!-- Category Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            Category Name *
          </label>
          <input
            id="name"
            type="text"
            formControlName="name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter category name"
          />
          <div *ngIf="getFieldError('name')" class="mt-1 text-sm text-red-600">
            {{ getFieldError('name') }}
          </div>
        </div>

        <!-- Parent Category (only for subcategories) -->
        <div *ngIf="!isEditMode || (isEditMode && !category?.parentId?._id)">
          <label for="parentId" class="block text-sm font-medium text-gray-700 mb-1">
            Parent Category
          </label>
          <select
            id="parentId"
            formControlName="parentId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select parent category (optional)</option>
            <option *ngFor="let parent of parentCategories" [value]="parent._id">
              {{ parent.name }}
            </option>
          </select>
          <p class="mt-1 text-xs text-gray-500">Leave empty to create a parent category</p>
        </div>

        <!-- Category Icon/Image -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Category Icon/Image (optional)
          </label>
          
          <!-- Image Upload Area -->
          <div *ngIf="!imagePreview" class="mb-4">
            <div class="flex items-center justify-center w-full">
              <label for="image-upload" class="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  class="hidden"
                />
                <div class="flex flex-col items-center justify-center pt-3 pb-3">
                  <svg class="w-6 h-6 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p class="text-xs text-gray-500">
                    <span class="font-semibold">Click to upload</span> an image
                  </p>
                  <p class="text-xs text-gray-400">PNG, JPG, GIF (max 5MB)</p>
                </div>
              </label>
            </div>
            <div *ngIf="uploadProgress > 0 && uploadProgress < 100" class="mt-2">
              <div class="bg-gray-200 rounded-full h-1.5">
                <div class="bg-primary-600 h-1.5 rounded-full transition-all duration-300" [style.width.%]="uploadProgress"></div>
              </div>
              <p class="text-xs text-gray-600 mt-1">Uploading... {{ uploadProgress }}%</p>
            </div>
          </div>

          <!-- Image Preview -->
          <div *ngIf="imagePreview" class="mb-4">
            <div class="relative group bg-gray-100 rounded-lg overflow-hidden w-24 h-24 mx-auto mb-3">
              <img [src]="imagePreview" [alt]="'Category icon'"
                   class="w-full h-full object-cover">
              <button type="button"
                      (click)="removeImage()"
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="flex gap-2 justify-center">
              <label for="image-upload-change" class="cursor-pointer">
                <input
                  id="image-upload-change"
                  type="file"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  class="hidden"
                />
                <span class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Change
                </span>
              </label>
              <button type="button"
                      (click)="removeImage()"
                      class="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50 transition-colors duration-200">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>
          </div>

        </div>

        <!-- Status (only for edit mode) -->
        <div *ngIf="isEditMode">
          <label class="flex items-center">
            <input
              type="checkbox"
              formControlName="isActive"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Active Category</span>
          </label>
        </div>
      </form>

      <!-- Footer -->
      <div slot="footer" class="flex justify-end space-x-3">
        <button
          type="button"
          (click)="onClose()"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="button"
          (click)="onSubmit()"
          [disabled]="isLoading || categoryForm.invalid"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span *ngIf="isLoading" class="mr-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isLoading ? 'Saving...' : (isEditMode ? 'Update Category' : 'Create Category') }}
        </button>
      </div>
    </app-modal>
  `,
  styles: []
})
export class CategoryModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() category: CategoryWithParent | null = null;
  @Input() parentCategories: CategoryWithParent[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CategoryWithParent>();

  categoryForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  
  // Image upload properties
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  uploadProgress = 0;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Edit Category' : 'Add New Category';
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      parentId: [''],
      icon: [''],
      isActive: [true]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['category'] || changes['isOpen']) {
      if (this.categoryForm) {
        if (this.category) {
          this.isEditMode = true;
          this.categoryForm.patchValue({
            name: this.category.name,
            parentId: this.category.parentId?._id || '',
            icon: this.category.icon || '',
            isActive: this.category.isActive
          });
          
          // Set existing image if available
          if (this.category.icon) {
            this.imagePreview = this.category.icon;
          }
        } else {
          this.isEditMode = false;
          this.categoryForm.reset();
          this.categoryForm.patchValue({ isActive: true });
          this.resetImageUpload();
        }
      }
    }
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.categoryForm.value;
      
      if (this.isEditMode && this.category) {
        const updateData: UpdateCategoryRequest = {
          categoryId: this.category._id,
          ...formData,
          parentId: formData.parentId || null
        };

        // Use file upload method if image is selected
        if (this.selectedImage) {
          this.categoryService.updateCategoryWithFile(updateData, this.selectedImage).subscribe({
            next: (response) => {
              this.isLoading = false;
              this.saved.emit(response.data as CategoryWithParent);
              this.onClose();
            },
            error: (error) => {
              this.isLoading = false;
              this.errorMessage = error.message || 'Failed to update category';
            }
          });
        } else {
          this.categoryService.updateCategory(updateData).subscribe({
            next: (response) => {
              this.isLoading = false;
              this.saved.emit(response.data as CategoryWithParent);
              this.onClose();
            },
            error: (error) => {
              this.isLoading = false;
              this.errorMessage = error.message || 'Failed to update category';
            }
          });
        }
      } else {
        const createData: CreateCategoryRequest = {
          ...formData,
          parentId: formData.parentId || null
        };

        // Use file upload method if image is selected
        if (this.selectedImage) {
          this.categoryService.createCategoryWithFile(createData, this.selectedImage).subscribe({
            next: (response) => {
              this.isLoading = false;
              this.saved.emit(response.data as CategoryWithParent);
              this.onClose();
            },
            error: (error) => {
              this.isLoading = false;
              this.errorMessage = error.message || 'Failed to create category';
            }
          });
        } else {
          this.categoryService.createCategory(createData).subscribe({
            next: (response) => {
              this.isLoading = false;
              this.saved.emit(response.data as CategoryWithParent);
              this.onClose();
            },
            error: (error) => {
              this.isLoading = false;
              this.errorMessage = error.message || 'Failed to create category';
            }
          });
        }
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
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
    }
    return '';
  }

  onClose(): void {
    this.close.emit();
    this.categoryForm.reset();
    this.errorMessage = '';
    this.resetImageUpload();
  }

  // Image upload methods
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size must be less than 5MB';
        return;
      }

      this.selectedImage = file;
      this.errorMessage = '';

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Simulate upload progress
      this.simulateUploadProgress();
    }
  }

  private simulateUploadProgress(): void {
    this.isUploading = true;
    this.uploadProgress = 0;

    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.isUploading = false;
        this.uploadProgress = 100;
      }
    }, 100);
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.uploadProgress = 0;
    this.isUploading = false;
  }

  private resetImageUpload(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.uploadProgress = 0;
    this.isUploading = false;
  }
}
