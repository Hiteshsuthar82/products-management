export interface DashboardStats {
  products: {
    total: number;
    active: number;
    outOfStock: number;
  };
  users: {
    total: number;
    customers: number;
    active: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
  };
  revenue: {
    total: number;
  };
}

export interface TopProduct {
  _id: string;
  name: string;
  sold: number;
  price: number;
  images: Array<{ url: string }>;
}

export interface RecentOrder {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  pricing: {
    totalPrice: number;
    currency: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}
