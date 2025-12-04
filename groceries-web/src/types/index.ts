export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  token?: string;
  redeemPoints?: number;
  config?: Config;
}

export interface Config {
  code: string;
  country: string;
  flag: string;
  currencySign: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: Array<{ public_id: string; url: string }>;
  category: Category;
  brand?: string;
  stock: number;
  isActive: boolean;
  isOutOfStock: boolean;
  featured?: boolean;
  discount?: number;
  ratings?: {
    average: number;
    count: number;
  };
  isFavorite?: boolean;
  colors?: string[];
  sizes?: string[];
  weight?: string;
  dimensions?: string;
  tags?: string[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  children?: Category[];
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  currency?: Currency;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User;
  items: OrderItem[];
  shippingAddress: Address;
  paymentInfo: PaymentInfo;
  pricing: Pricing;
  orderStatus: OrderStatus;
  shippingInfo: ShippingInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  image?: string;
}

export interface Address {
  _id?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
  landmark?: string;
  addressType?: 'home' | 'work' | 'other';
  isDefault?: boolean;
  isActive?: boolean;
}

export interface PaymentInfo {
  method: 'cash' | 'online';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentReference?: string;
  paidAt?: string;
}

export interface Pricing {
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  discount?: number;
  currency?: string;
}

export interface ShippingInfo {
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface Country {
  _id: string;
  name: string;
  code: string;
  phoneCode: string;
  currency: Currency;
  isActive: boolean;
}

export interface Currency {
  _id: string;
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
  isDefault?: boolean;
  isActive: boolean;
}

export interface RedeemPoints {
  totalPoints: number;
  availablePoints: number;
  pointValue: number;
}

export interface Notification {
  _id: string;
  title: string;
  description: string;
  type: 'order' | 'promotion' | 'system' | 'payment' | 'delivery';
  isRead: boolean;
  image?: string;
  actionUrl?: string;
  data?: Record<string, any>;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  count: number;
  total: number;
  page: number;
  pages: number;
  [key: string]: T[] | number;
}

