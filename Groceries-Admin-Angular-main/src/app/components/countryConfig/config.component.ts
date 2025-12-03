import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CountryConfigService } from '../../services/config.service';
import { CountryConfig, CountryConfigListResponse, CreateCountryConfigRequest } from '../../models/config.model';



@Component({
  selector: 'app-country-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class CountryConfigComponent implements OnInit {
  configs: CountryConfig[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  addForm!: FormGroup;
  submitting = false;
  showForm = false;

  constructor(
    private fb: FormBuilder,
    private countryConfigService: CountryConfigService
  ) {}

  ngOnInit(): void {
    console.log('CountryConfigComponent initialized'); // Debug: Check if component loads
    this.initForm();
    this.loadConfigs();
  }

  private initForm(): void {
    this.addForm = this.fb.group({
      code: ['', [Validators.required]],
      country: ['', [Validators.required]],
      flag: ['', [Validators.required]],
      currencySign: ['', [Validators.required]]
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.errorMessage = '';
      this.successMessage = '';
      this.addForm.reset();
    }
  }

  loadConfigs(): void {
    console.log('Loading configs...'); // Debug
    this.isLoading = true;
    this.errorMessage = '';
    this.countryConfigService.getConfigs().subscribe({
      next: (configs) => {
        console.log('Configs loaded directly:', configs); // Debug: Log the direct array
        this.configs = configs || [];
        console.log('Configs set to:', this.configs); // Debug: Log after setting
        console.log('Configs length:', this.configs.length); // Debug: Log length
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error in loadConfigs:', error); // Debug: Log full error
        this.errorMessage = error.message || 'Failed to load configs';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.addForm.valid) {
      this.submitting = true;
      const configData: CreateCountryConfigRequest = this.addForm.value;
      this.countryConfigService.saveConfig(configData).subscribe({
        next: (response) => {
          this.submitting = false;
          this.successMessage = response.message || 'Config saved successfully';
          this.errorMessage = '';
          this.addForm.reset();
          this.loadConfigs();
          setTimeout(() => { 
            this.successMessage = ''; 
            this.toggleForm(); // Hide form after success
          }, 3000);
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error.message || 'Failed to save config';
          this.successMessage = '';
        }
      });
    } else {
      this.markFormTouched();
    }
  }

  private markFormTouched(): void {
    Object.keys(this.addForm.controls).forEach(key => {
      this.addForm.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.addForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'This field is required';
      }
    }
    return '';
  }

  deleteConfig(code: string): void {
    if (confirm(`Are you sure you want to delete config for ${code}?`)) {
      this.countryConfigService.deleteConfig(code).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Config deleted successfully';
          this.loadConfigs();
          setTimeout(() => { this.successMessage = ''; }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to delete config';
        }
      });
    }
  }
}