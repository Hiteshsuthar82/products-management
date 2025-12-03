import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { 
  User, 
  UserFormData, 
  CreateUserRequest, 
  UpdateUserRequest,
  UserResponse 
} from '../../../models/user.model';
import { USER_ROLES } from '../../../constants/api.constants';

@Component({
  selector: 'app-user-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.scss'
})
export class UserModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() user: User | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() userSaved = new EventEmitter<User>();

  private destroy$ = new Subject<void>();
  
  userForm: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;

  roleOptions = [
    { value: USER_ROLES.CUSTOMER, label: 'Customer' },
    { value: USER_ROLES.ADMIN, label: 'Admin' }
  ];

  // Admin restrictions
  isCurrentUserAdmin = false;
  canAddAdmin = false;
  canEditPassword = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.userForm = this.createForm();
    this.initializeAdminRestrictions();
  }

  private initializeAdminRestrictions(): void {
    this.isCurrentUserAdmin = this.authService.isAdmin();
    this.canAddAdmin = this.isCurrentUserAdmin;
    this.canEditPassword = !this.isCurrentUserAdmin; // Admin cannot edit passwords
  }

  ngOnInit(): void {
    if (this.user) {
      this.isEditMode = true;
      this.populateForm();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    const defaultRole = this.isCurrentUserAdmin ? USER_ROLES.ADMIN : USER_ROLES.CUSTOMER;
    
    const form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: [defaultRole, [Validators.required]],
      isActive: [true]
    }, { validators: this.passwordMatchValidator });

    // Apply admin restrictions
    this.applyAdminRestrictions(form);
    
    return form;
  }

  private applyAdminRestrictions(form: FormGroup): void {
    if (this.isCurrentUserAdmin) {
      // Admin can only add new admin users
      if (!this.isEditMode) {
        form.get('role')?.setValue(USER_ROLES.ADMIN);
        form.get('role')?.disable(); // Disable role selection for new users
      }
      
      // Admin cannot edit passwords
      if (this.isEditMode) {
        form.get('password')?.clearValidators();
        form.get('confirmPassword')?.clearValidators();
        form.get('password')?.setValue('');
        form.get('confirmPassword')?.setValue('');
        form.get('password')?.updateValueAndValidity();
        form.get('confirmPassword')?.updateValueAndValidity();
      }
    }
  }

  private populateForm(): void {
    if (this.user) {
      this.userForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        phone: this.user.phone,
        role: this.user.role,
        isActive: this.user.isActive,
        password: '', // Don't populate password for edit
        confirmPassword: ''
      });

      // Apply admin restrictions for edit mode
      this.applyAdminRestrictions(this.userForm);
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      this.error = '';

      const formData = this.userForm.value;

      if (this.isEditMode && this.user) {
        this.updateUser(formData);
      } else {
        this.createUser(formData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createUser(formData: UserFormData): void {
    const userData: CreateUserRequest = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      isActive: formData.isActive
    };

    this.userService.createUser(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: UserResponse) => {
          if (response.success) {
            this.userSaved.emit(response.data);
            this.closeModal();
          } else {
            this.error = response.message || 'Failed to create user';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.error = 'Failed to create user. Please try again.';
          this.loading = false;
        }
      });
  }

  private updateUser(formData: UserFormData): void {
    if (!this.user) return;

    const userData: UpdateUserRequest = {
      userId: this.user._id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      isActive: formData.isActive
    };

    // Admin cannot edit passwords - exclude password from update
    // Note: Password editing is disabled for admin users

    this.userService.updateUser(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: UserResponse) => {
          if (response.success) {
            this.userSaved.emit(response.data);
            this.closeModal();
          } else {
            this.error = response.message || 'Failed to update user';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.error = 'Failed to update user. Please try again.';
          this.loading = false;
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  closeModal(): void {
    this.userForm.reset();
    this.error = '';
    this.isEditMode = false;
    this.user = null;
    this.close.emit();
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'phone') {
          return 'Please enter a valid 10-digit phone number';
        }
        return 'Invalid format';
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      role: 'Role'
    };
    return labels[fieldName] || fieldName;
  }

  get isFormValid(): boolean {
    return this.userForm.valid;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Edit User' : 'Add New User';
  }

  get submitButtonText(): string {
    return this.loading 
      ? (this.isEditMode ? 'Updating...' : 'Creating...') 
      : (this.isEditMode ? 'Update User' : 'Create User');
  }
}
