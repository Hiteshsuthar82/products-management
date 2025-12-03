export interface Category {
  _id: string;
  name: string;
  slug: string;
  code?: string;
  icon?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithParent {
  _id: string;
  name: string;
  slug: string;
  code?: string;
  icon?: string;
  image?: string;
  parentId?: {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
    image?: string;
  };
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithChildren extends Category {
  children?: Category[];
}

export interface CategoriesListResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    categories: CategoryWithParent[];
  };
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: CategoryWithParent | CategoryWithChildren;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  icon?: string;
  image?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest {
  categoryId: string;
  name?: string;
  slug?: string;
  icon?: string;
  image?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface DeleteCategoryRequest {
  categoryId: string;
}

export interface CategoryFilters {
  isActive?: boolean;
  level?: number;
  parentId?: string;
  includeChildren?: boolean;
}

export interface CategoryStats {
  total: number;
  active: number;
  parentCategories: number;
  subcategories: number;
  withProducts: number;
  withoutProducts: number;
}

export interface CategoryStatsResponse {
  success: boolean;
  message: string;
  data: CategoryStats;
}
