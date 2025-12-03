import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONSTANTS } from '../constants/api.constants';
import {
  CountryConfig,
  CreateCountryConfigRequest,
  CountryConfigResponse,
  DeleteCountryConfigRequest
} from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class CountryConfigService {
  constructor(private apiService: ApiService) {}

  /**
   * Get all country configurations - returns array directly based on API behavior
   */
  getConfigs(): Observable<CountryConfig[]> {
    // Since API returns the data array directly (as per console logs), type it as CountryConfig[]
    return this.apiService.post<CountryConfig[]>(API_CONSTANTS.COUNTRY_CONFIG.LIST, {});
  }

  /**
   * Save new country configuration
   */
  saveConfig(configData: CreateCountryConfigRequest): Observable<CountryConfigResponse> {
    return this.apiService.post<CountryConfigResponse>(API_CONSTANTS.COUNTRY_CONFIG.SAVE, configData);
  }

  /**
   * Delete country configuration by code
   */
  deleteConfig(code: string): Observable<any> {
    const request: DeleteCountryConfigRequest = { code };
    return this.apiService.post(API_CONSTANTS.COUNTRY_CONFIG.DELETE, request);
  }
}