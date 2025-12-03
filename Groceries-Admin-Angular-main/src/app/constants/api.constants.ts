export const API_CONSTANTS = {
   BASE_URL: 'https://groceries.itfuturz.in/api',
  
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    PASSWORD: '/auth/password',
    LOGOUT: '/auth/logout'
  },
  
  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    PRODUCTS_DETAIL: '/admin/products/detail',
    PRODUCTS_ADD: '/admin/products/add',
    PRODUCTS_UPDATE: '/admin/products/update',
    PRODUCTS_DELETE: '/admin/products/delete',
    PRODUCTS_TOGGLE_STATUS: '/admin/products/toggle-status',
    PRODUCTS_UPLOAD_IMAGES: '/admin/products/upload-images',
    PRODUCTS_DELETE_IMAGE: '/admin/products/delete-image',
    ORDERS: '/admin/orders',
    ORDERS_DETAIL: '/admin/orders/detail',
    ORDERS_STATUS: '/admin/orders/status',
    USERS: '/admin/users',
    USERS_STATUS: '/admin/users/status',
    REDEEM_RULES: '/admin/redeem/rules',
    REDEEM_RULES_CREATE: '/admin/redeem/rules/create',
    REDEEM_POINT_VALUE: '/admin/redeem/point-value',
    REDEEM_USER_POINTS: '/admin/redeem/user-points',
    ORDER_STATUS_DISTRIBUTION: '/admin/status-distribution',
    EXPORT_USERS: '/admin/export'
  
  },
  
  // Categories endpoints
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: '/categories/detail',
    PARENTS: '/categories/parents',
    CHILDREN: '/categories/children',
    ADD: '/categories/add',
    UPDATE: '/categories/update',
    DELETE: '/categories/delete',
    TOGGLE_STATUS: '/categories/toggle-status',
    STATS: '/categories/stats',
    EXPORT_CATEGORIES: '/categories/export',
    IMPORT_CATEGORIES: '/categories/import'
  },
  
  // Products endpoints
  PRODUCTS: {
    LIST: '/products',
    DETAIL: '/products/detail',
    ADD: '/products/add',
    UPDATE: '/products/update',
    DELETE: '/products/delete',
    EXPORT_PRODUCTS: '/products/export',
    IMPORT_PRODUCTS: '/products/import'
  },
  
  // Orders endpoints
  ORDERS: {
    LIST: '/orders',
    DETAIL: '/orders/detail',
    CREATE: '/orders/create',
    UPDATE: '/orders/update',
    CANCEL: '/orders/cancel',
    EXPORT_ORDERS: '/orders/export'
  },
  COUNTRY_CONFIG: {
  LIST: '/admin/config',
  SAVE: '/admin/save-config',
  DELETE: '/admin/delete-config'
},
  
  // Users endpoints
  USERS: {
    LIST: '/users',
    DETAIL: '/users/detail',
    UPDATE: '/users/update',
    DELETE: '/users/delete',
  
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

export const STORAGE_KEYS = {
  TOKEN: 'admin_token',
  USER: 'admin_user',
  THEME: 'admin_theme'
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const PAYMENT_METHOD = {
  CASH: 'cash',
  ONLINE: 'online'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer'
};
