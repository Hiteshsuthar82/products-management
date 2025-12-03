export interface RedeemRule {
  _id: string;
  name: string;
  description: string;
  minOrderValue: number;
  redeemPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RedeemRuleResponse {
  success: boolean;
  message: string;
  data: RedeemRule;
}

export interface RedeemRulesListResponse {
  count: number;
  total: number;
  page: number;
  pages: number;
  rules: RedeemRule[];
}

export interface CreateRedeemRuleRequest {
  name: string;
  description: string;
  minOrderValue: number;
  redeemPoints: number;
  isActive?: boolean;
}

export interface UpdateRedeemRuleRequest {
  ruleId: string;
  name?: string;
  description?: string;
  minOrderValue?: number;
  redeemPoints?: number;
  isActive?: boolean;
}

export interface RedeemRuleFormData {
  name: string;
  description: string;
  minOrderValue: number;
  redeemPoints: number;
  isActive: boolean;
}

export interface RedeemPointValue {
  _id: string;
  pointValue: number; // Value of 1 redeem point in currency
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RedeemPointValueResponse {
  _id: string;
  pointValue: number; // Value of 1 redeem point in currency
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRedeemPointValueRequest {
  pointValue: number;
}

export interface UserRedeemPoints {
  userId: string;
  totalPoints: number;
  usedPoints: number;
  availablePoints: number;
  pointValue: number; // Value per point
}

export interface UserRedeemPointsResponse {
  success: boolean;
  message: string;
  data: UserRedeemPoints;
}

export interface ApplyRedeemRequest {
  orderId: string;
  pointsToUse: number;
}

export interface ApplyRedeemResponse {
  success: boolean;
  message: string;
  data: {
    discountAmount: number;
    remainingPoints: number;
    orderTotal: number;
  };
}
