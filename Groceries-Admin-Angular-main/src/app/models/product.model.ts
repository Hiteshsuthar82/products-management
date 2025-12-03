export interface ProductImage {
  public_id: string;
  url: string;
}

export interface ProductReview {
  user: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ProductRatings {
  average: number;
  count: number;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand?: string;
  images: ProductImage[];
  stock: number;
  sold: number;
  isActive: boolean;
  isOutOfStock: boolean;
  isDeleted?: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  ratings: ProductRatings;
  reviews: ProductReview[];
  featured: boolean;
  discount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithCategory {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
    parentId?: string;
  };
  subcategoryId?: string;
  brand?: string;
  images: ProductImage[];
  stock: number;
  sold: number;
  isActive: boolean;
  isOutOfStock: boolean;
  isDeleted?: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  ratings: ProductRatings;
  reviews: ProductReview[];
  featured: boolean;
  discount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsListResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    total: number;
    page: number;
    pages: number;
    products: ProductWithCategory[];
  };
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: ProductWithCategory;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  subcategoryId?: string;
  brand?: string;
  stock: number;
  weight?: number;
  dimensions?: ProductDimensions;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  featured?: boolean;
  discount?: number;
  images?: ProductImage[];
}

export interface UpdateProductRequest {
  productId: string;
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  categoryId?: string;
  subcategoryId?: string;
  brand?: string;
  stock?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  featured?: boolean;
  discount?: number;
  images?: ProductImage[];
  isActive?: boolean;
}

export interface DeleteProductRequest {
  productId: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  isActive?: boolean;
  isOutOfStock?: boolean;
  search?: string;
}
