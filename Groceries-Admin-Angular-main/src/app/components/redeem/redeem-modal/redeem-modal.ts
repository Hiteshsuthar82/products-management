import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RedeemService } from '../../../services/redeem.service';
import { 
  RedeemRule, 
  RedeemRuleFormData, 
  CreateRedeemRuleRequest, 
  UpdateRedeemRuleRequest,
  RedeemRuleResponse 
} from '../../../models/redeem.model';

@Component({
  selector: 'app-redeem-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './redeem-modal.html',
  styleUrl: './redeem-modal.scss'
})
export class RedeemModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() rule: RedeemRule | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() ruleSaved = new EventEmitter<RedeemRule>();

  private destroy$ = new Subject<void>();
  
  ruleForm: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private redeemService: RedeemService
  ) {
    this.ruleForm = this.createForm();
  }

  ngOnInit(): void {
    // Initialize form with rule if provided
    if (this.rule) {
      this.isEditMode = true;
      this.populateForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Watch for changes to the rule input
    if (changes['rule']) {
      if (this.rule) {
        this.isEditMode = true;
        this.populateForm();
      } else {
        // Reset form if no rule is provided
        this.isEditMode = false;
        this.ruleForm.reset();
        this.ruleForm.patchValue({ isActive: true });
      }
      // Clear any errors when switching rules
      this.error = '';
    }

    // Watch for changes to the isOpen input to reset form when opening
    if (changes['isOpen'] && !changes['isOpen'].firstChange) {
      if (this.isOpen && !this.rule) {
        // Reset form when opening modal for adding new rule
        this.ruleForm.reset();
        this.ruleForm.patchValue({ isActive: true });
        this.error = '';
        this.isEditMode = false;
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      minOrderValue: ['', [Validators.required, Validators.min(0.01)]],
      redeemPoints: ['', [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }

  private populateForm(): void {
    if (this.rule) {
      this.ruleForm.patchValue({
        name: this.rule.name,
        description: this.rule.description,
        minOrderValue: this.rule.minOrderValue,
        redeemPoints: this.rule.redeemPoints,
        isActive: this.rule.isActive
      });
    }
  }

  onSubmit(): void {
    if (this.ruleForm.valid) {
      this.loading = true;
      this.error = '';

      const formData = this.ruleForm.value;

      if (this.isEditMode && this.rule) {
        this.updateRule(formData);
      } else {
        this.createRule(formData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createRule(formData: RedeemRuleFormData): void {
    const ruleData: CreateRedeemRuleRequest = {
      name: formData.name,
      description: formData.description,
      minOrderValue: formData.minOrderValue,
      redeemPoints: formData.redeemPoints,
      isActive: formData.isActive
    };

    this.redeemService.createRedeemRule(ruleData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: RedeemRuleResponse) => {
          if (response.success) {
            this.ruleSaved.emit(response.data);
            this.closeModal();
          } else {
            this.error = response.message || 'Failed to create redeem rule';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating redeem rule:', error);
          this.error = 'Failed to create redeem rule. Please try again.';
          this.loading = false;
        }
      });
  }

  private updateRule(formData: RedeemRuleFormData): void {
    if (!this.rule) return;

    const ruleData: UpdateRedeemRuleRequest = {
      ruleId: this.rule._id,
      name: formData.name,
      description: formData.description,
      minOrderValue: formData.minOrderValue,
      redeemPoints: formData.redeemPoints,
      isActive: formData.isActive
    };

    this.redeemService.updateRedeemRule(ruleData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: RedeemRuleResponse) => {
          if (response.success) {
            this.ruleSaved.emit(response.data);
            this.closeModal();
          } else {
            this.error = response.message || 'Failed to update redeem rule';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating redeem rule:', error);
          this.error = 'Failed to update redeem rule. Please try again.';
          this.loading = false;
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.ruleForm.controls).forEach(key => {
      const control = this.ruleForm.get(key);
      control?.markAsTouched();
    });
  }

  closeModal(): void {
    this.ruleForm.reset();
    this.ruleForm.patchValue({ isActive: true });
    this.error = '';
    this.loading = false;
    this.isEditMode = false;
    this.rule = null;
    this.close.emit();
  }

  getFieldError(fieldName: string): string {
    const field = this.ruleForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Rule Name',
      description: 'Description',
      minOrderValue: 'Minimum Order Value',
      redeemPoints: 'Redeem Points'
    };
    return labels[fieldName] || fieldName;
  }

  get isFormValid(): boolean {
    return this.ruleForm.valid;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Edit Redeem Rule' : 'Add New Redeem Rule';
  }

  get submitButtonText(): string {
    return this.loading 
      ? (this.isEditMode ? 'Updating...' : 'Creating...') 
      : (this.isEditMode ? 'Update Rule' : 'Create Rule');
  }
}
