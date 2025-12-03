// 20 users (18 customers + 2 admins)
// Note: Password will be hashed by the model's pre-save middleware
module.exports = [
  // Admin Users (2)
  {
    name: 'Admin User',
    email: 'admin@grocery.com',
    password: 'admin123', // Will be hashed by pre-save middleware
    role: 'admin',
    phone: '5550000001', // 10-digit format as required by schema
    isActive: true,
    avatar: 'https://via.placeholder.com/150/007bff/ffffff?text=Admin'
  },
  {
    name: 'Store Manager',
    email: 'manager@grocery.com',
    password: 'manager123', // Will be hashed by pre-save middleware
    role: 'admin',
    phone: '5550000002', // 10-digit format as required by schema
    isActive: true,
    avatar: 'https://via.placeholder.com/150/28a745/ffffff?text=Manager'
  },
  
  // Customer Users (18)
  {
    name: 'John Smith',
    email: 'john.smith@email.com',
    password: 'password123', // Will be hashed by pre-save middleware
    role: 'customer',
    phone: '8460827893', // 10-digit format as required by schema
    isActive: true,
    avatar: 'https://via.placeholder.com/150/6c757d/ffffff?text=JS'
  },
];
