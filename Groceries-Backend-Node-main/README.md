# Ecommerce Backend API

A comprehensive Node.js backend application for an ecommerce platform with MongoDB database, featuring admin panel, customer management, product catalog, shopping cart, order management, and Razorpay payment integration.

## Features

### Authentication & Authorization
- **Admin Authentication**: Secure admin login with JWT tokens
- **Customer Authentication**: User registration and login
- **Role-based Access Control**: Admin and customer specific routes
- **Password Encryption**: Bcrypt hashing for secure password storage

### Product Management
- **Product CRUD**: Create, read, update, delete products
- **Stock Management**: Track inventory and out-of-stock status
- **Product Categories**: Organize products by categories and brands
- **Product Reviews**: Customer reviews and ratings system
- **Image Management**: Multiple product images support
- **Search & Filter**: Advanced product search and filtering

### Shopping Cart
- **Add to Cart**: Add products with quantity, color, and size selection
- **Cart Management**: Update quantities, remove items
- **Stock Validation**: Real-time stock checking
- **Cart Persistence**: Maintain cart across sessions

### Order Management
- **Order Placement**: Create orders from cart items
- **Order History**: View past orders
- **Order Status Tracking**: Track order progress
- **Reorder Functionality**: Quick reorder from previous orders
- **Order Cancellation**: Cancel orders with stock restoration

### Shipping & Address
- **Address Management**: Multiple shipping addresses
- **Default Address**: Set preferred shipping address
- **Country & Currency**: Multi-country and currency support
- **Shipping Zones**: Different shipping costs by region

### Payment Integration
- **Cash on Delivery**: Cash payment option
- **Online Payment**: Payment reference tracking
- **Payment Status Management**: Update payment status
- **Refund Management**: Admin refund processing

### Admin Panel
- **Dashboard**: Comprehensive admin dashboard with statistics
- **Product Management**: Full product CRUD operations
- **Order Management**: Process and track orders
- **User Management**: Manage customer accounts
- **Analytics**: Sales and performance metrics

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Custom payment reference system
- **Validation**: Express-validator
- **Security**: Bcrypt for password hashing, CORS enabled

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `config.env` and update with your values:
     ```env
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/ecommerce
     JWT_SECRET=your_jwt_secret_key_here
     JWT_EXPIRE=7d
     NODE_ENV=development
     ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

**Note: All APIs use POST method and return standardized response format:**

**Success Response (200):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "status": 400,
  "message": "Error message",
  "data": null
}
```

### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login user
- `POST /api/auth/me` - Get current user
- `POST /api/auth/profile` - Update user profile
- `POST /api/auth/password` - Update password
- `POST /api/auth/logout` - Logout user

### Products
- `POST /api/products` - Get all products (with filters in body)
- `POST /api/products/detail` - Get single product
- `POST /api/products/featured` - Get featured products
- `POST /api/products/category` - Get products by category
- `POST /api/products/categories` - Get all categories
- `POST /api/products/brands` - Get all brands
- `POST /api/products/review` - Add product review

### Cart
- `POST /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/update` - Update cart item
- `POST /api/cart/remove` - Remove item from cart
- `POST /api/cart/clear` - Clear cart
- `POST /api/cart/count` - Get cart item count

### Orders
- `POST /api/orders` - Create new order
- `POST /api/orders/list` - Get user's orders
- `POST /api/orders/detail` - Get single order
- `POST /api/orders/cancel` - Cancel order
- `POST /api/orders/reorder` - Reorder

### Address
- `POST /api/address` - Get user's addresses
- `POST /api/address/add` - Add new address
- `POST /api/address/update` - Update address
- `POST /api/address/delete` - Delete address
- `POST /api/address/default` - Set default address
- `POST /api/address/default/get` - Get default address

### Countries & Currency
- `POST /api/countries` - Get all countries
- `POST /api/countries/currencies` - Get all currencies
- `POST /api/countries/currencies/default` - Get default currency

### Payment
- `POST /api/payment/status` - Update payment status
- `POST /api/payment/status/check` - Get payment status
- `POST /api/payment/refund` - Process refund (Admin only)

### Admin Panel
- `POST /api/admin/dashboard` - Get dashboard statistics
- `POST /api/admin/products` - Get all products (admin)
- `POST /api/admin/products/add` - Create product
- `POST /api/admin/products/update` - Update product
- `POST /api/admin/products/delete` - Delete product
- `POST /api/admin/orders` - Get all orders (admin)
- `POST /api/admin/orders/detail` - Get single order (admin)
- `POST /api/admin/orders/status` - Update order status
- `POST /api/admin/users` - Get all users
- `POST /api/admin/users/status` - Update user status

## Database Models

### User
- Customer and admin user management
- Profile information and preferences
- Address and country/currency selection

### Product
- Product catalog with images
- Stock management and pricing
- Categories, brands, and reviews

### Cart
- Shopping cart with items
- Quantity and variant selection
- Real-time total calculation

### Order
- Order management and tracking
- Payment information
- Shipping details and status

### Address
- Multiple shipping addresses
- Default address selection
- Address validation

### Country & Currency
- Multi-country support
- Currency conversion
- Shipping zones and tax rates

## Security Features

- JWT token-based authentication
- Password encryption with bcrypt
- Input validation and sanitization
- CORS configuration
- Role-based access control
- Secure payment processing

## Error Handling

- Comprehensive error handling middleware
- Validation error responses
- Database error handling
- Payment error management

## Development

- **File Structure**: Organized by features (models, routes, middleware)
- **Code Style**: Consistent naming and formatting
- **Error Handling**: Centralized error management
- **Validation**: Input validation on all endpoints
- **Documentation**: Comprehensive API documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
