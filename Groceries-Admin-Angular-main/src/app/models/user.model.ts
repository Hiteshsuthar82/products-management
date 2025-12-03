export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  avatar?: string;
  addresses?: string[];
  defaultAddress?: string;
  country?: string;
  currency?: string;
  redeemPoints?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface UsersListResponse {
  count: number;
  total: number;
  page: number;
  pages: number;
  users: User[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    isActive: boolean;
    token: string;
  };
}

export interface UpdateUserStatusRequest {
  userId: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'customer';
  isActive?: boolean;
}

export interface UpdateUserRequest {
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'customer';
  isActive?: boolean;
}

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'customer';
  isActive: boolean;
}
