import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RedeemService } from '../../../services/redeem.service';
import { 
  RedeemPointValue, 
  UpdateRedeemPointValueRequest,
  RedeemPointValueResponse 
} from '../../../models/redeem.model';

@Component({
  selector: 'app-point-value-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './point-value-modal.html',
  styleUrl: './point-value-modal.scss'
})
export class PointValueModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() pointValue: RedeemPointValue | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() pointValueUpdated = new EventEmitter<RedeemPointValue>();

  private destroy$ = new Subject<void>();
  
  pointValueForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private redeemService: RedeemService
  ) {
    this.pointValueForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.pointValue) {
      this.populateForm();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      pointValue: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  private populateForm(): void {
    if (this.pointValue) {
      this.pointValueForm.patchValue({
        pointValue: this.pointValue.pointValue
      });
    }
  }

  onSubmit(): void {
    if (this.pointValueForm.valid) {
      this.loading = true;
      this.error = '';

      const formData = this.pointValueForm.value;
      const updateData: UpdateRedeemPointValueRequest = {
        pointValue: formData.pointValue
      };

      this.redeemService.updateRedeemPointValue(updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: RedeemPointValueResponse) => {
            if (response) {
              this.pointValueUpdated.emit(response);
              this.closeModal();
            } else {
              this.error = 'Failed to update point value';
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error updating point value:', error);
            this.error = 'Failed to update point value. Please try again.';
            this.loading = false;
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.pointValueForm.controls).forEach(key => {
      const control = this.pointValueForm.get(key);
      control?.markAsTouched();
    });
  }

  closeModal(): void {
    this.pointValueForm.reset();
    this.error = '';
    this.close.emit();
  }

  getFieldError(fieldName: string): string {
    const field = this.pointValueForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Point value is required';
      }
      if (field.errors['min']) {
        return 'Point value must be greater than 0';
      }
    }
    return '';
  }

  get isFormValid(): boolean {
    return this.pointValueForm.valid;
  }

  get submitButtonText(): string {
    return this.loading ? 'Updating...' : 'Update Point Value';
  }
}
