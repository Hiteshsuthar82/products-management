export const API_CONSTANTS = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://groceries.itfuturz.in/api',
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    PASSWORD: '/auth/password',
    LOGOUT: '/auth/logout',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp'
  },
  
  // Products endpoints
  PRODUCTS: {
    LIST: '/products',
    DETAIL: '/products/detail',
    FEATURED: '/products/featured',
    NEW: '/products/new',
    SEARCH: '/products/search',
    CATEGORY: '/products/category',
    BRANDS: '/products/brands',
    REVIEW: '/products/review'
  },
  
  // Categories endpoints
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: '/categories/detail',
    PARENTS: '/categories/parents',
    CHILDREN: '/categories/children'
  },
  
  // Cart endpoints
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
    COUNT: '/cart/count'
  },
  
  // Orders endpoints
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders/list',
    DETAIL: '/orders/detail',
    CANCEL: '/orders/cancel',
    REORDER: '/orders/reorder'
  },
  
  // Address endpoints
  ADDRESS: {
    LIST: '/address',
    DETAIL: '/address/detail',
    ADD: '/address/add',
    UPDATE: '/address/update',
    DELETE: '/address/delete',
    SET_DEFAULT: '/address/default',
    GET_DEFAULT: '/address/default/get'
  },
  
  // Favorites endpoints
  FAVORITES: {
    LIST: '/favorites',
    ADD: '/favorites/add',
    REMOVE: '/favorites/remove',
    TOGGLE: '/favorites/toggle',
    CHECK: '/favorites/check',
    CLEAR: '/favorites/clear',
    COUNT: '/favorites/count',
    BULK_CHECK: '/favorites/bulk-check'
  },
  
  // Redeem endpoints
  REDEEM: {
    USER_POINTS: '/redeem/user-points',
    POINTS_HISTORY: '/redeem/points-history',
    APPLY: '/redeem/apply',
    PROCESS_ORDER: '/redeem/process-order'
  },
  
  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    DETAIL: '/notifications/:id',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: '/notifications/:id',
    DELETE_ALL: '/notifications'
  },
  
  // Countries endpoints
  COUNTRIES: {
    LIST: '/countries',
    DETAIL: '/countries/detail',
    CURRENCIES: '/countries/currencies',
    CURRENCY_DETAIL: '/countries/currencies/detail',
    DEFAULT_CURRENCY: '/countries/currencies/default'
  },
  
  // Payment endpoints
  PAYMENT: {
    STATUS: '/payment/status',
    CHECK_STATUS: '/payment/status/check',
    REFUND: '/payment/refund'
  }
};

export const STORAGE_KEYS = {
  TOKEN: 'user_token',
  USER: 'user_data',
  CART: 'cart_data'
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

