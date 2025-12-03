export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  image: string;
}

export interface OrderItemWithProduct {
  product: {
    _id: string;
    name: string;
    images: Array<{ url: string }>;
  };
  name: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  image: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface PaymentInfo {
  method: 'cash' | 'online';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentReference?: string;
  paidAt?: string;
}

export interface ShippingInfo {
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderPricing {
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  currency: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  shippingInfo: ShippingInfo;
  pricing: OrderPricing;
  notes?: string;
  isReorder: boolean;
  originalOrder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderWithDetails {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItemWithProduct[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  shippingInfo: ShippingInfo;
  pricing: OrderPricing;
  notes?: string;
  isReorder: boolean;
  originalOrder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersListResponse {
  count: number;
  total: number;
  page: number;
  pages: number;
  orders: OrderWithDetails[];
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: OrderWithDetails;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  search?: string;
}
