import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONSTANTS } from '../constants/api.constants';
import { 
  RedeemRule,
  RedeemRulesListResponse,
  RedeemRuleResponse,
  CreateRedeemRuleRequest,
  UpdateRedeemRuleRequest,
  RedeemPointValueResponse,
  UpdateRedeemPointValueRequest,
  UserRedeemPointsResponse
} from '../models/redeem.model';

@Injectable({
  providedIn: 'root'
})
export class RedeemService {

  constructor(private apiService: ApiService) {}

  /**
   * Get all redeem rules with filters
   */
  getRedeemRules(filters: any = {}): Observable<RedeemRulesListResponse> {
    return this.apiService.post<RedeemRulesListResponse>(API_CONSTANTS.ADMIN.REDEEM_RULES, filters);
  }

  /**
   * Create new redeem rule
   */
  createRedeemRule(ruleData: CreateRedeemRuleRequest): Observable<RedeemRuleResponse> {
    return this.apiService.postWithFullResponse<RedeemRule>(API_CONSTANTS.ADMIN.REDEEM_RULES_CREATE, ruleData)
      .pipe(map(response => response as unknown as RedeemRuleResponse));
  }

  /**
   * Update redeem rule
   */
  updateRedeemRule(ruleData: UpdateRedeemRuleRequest): Observable<RedeemRuleResponse> {
    return this.apiService.putWithFullResponse<RedeemRule>(`${API_CONSTANTS.ADMIN.REDEEM_RULES}/${ruleData.ruleId}`, ruleData)
      .pipe(map(response => response as unknown as RedeemRuleResponse));
  }

  /**
   * Delete redeem rule
   */
  deleteRedeemRule(ruleId: string): Observable<any> {
    return this.apiService.delete(`${API_CONSTANTS.ADMIN.REDEEM_RULES}/${ruleId}`);
  }

  /**
   * Get redeem point value
   */
  getRedeemPointValue(): Observable<RedeemPointValueResponse> {
    return this.apiService.get<RedeemPointValueResponse>(API_CONSTANTS.ADMIN.REDEEM_POINT_VALUE);
  }

  /**
   * Update redeem point value
   */
  updateRedeemPointValue(pointValueData: UpdateRedeemPointValueRequest): Observable<RedeemPointValueResponse> {
    return this.apiService.put<RedeemPointValueResponse>(API_CONSTANTS.ADMIN.REDEEM_POINT_VALUE, pointValueData);
  }

  /**
   * Get user redeem points
   */
  getUserRedeemPoints(userId: string): Observable<UserRedeemPointsResponse> {
    return this.apiService.get<UserRedeemPointsResponse>(`${API_CONSTANTS.ADMIN.REDEEM_USER_POINTS}/${userId}`);
  }

  /**
   * Update user redeem points
   */
  updateUserRedeemPoints(userId: string, points: number): Observable<any> {
    return this.apiService.put(`${API_CONSTANTS.ADMIN.REDEEM_USER_POINTS}/${userId}`, { points });
  }
}
