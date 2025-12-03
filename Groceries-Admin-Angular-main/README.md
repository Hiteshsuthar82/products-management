# Global Groceries Admin Panel

A comprehensive Angular admin panel for managing a grocery e-commerce platform, built with modern web technologies and a beautiful blue theme.

## Features

- **Dashboard**: Overview of key metrics, recent orders, and top-selling products
- **Product Management**: Full CRUD operations for products with image support
- **Category Management**: Hierarchical category system with parent-child relationships
- **Order Management**: Order tracking, status updates, and customer information
- **User Management**: Customer and admin user management
- **Authentication**: Secure login with JWT tokens
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Technology Stack

- **Frontend**: Angular 18+ with TypeScript
- **Styling**: Tailwind CSS with custom blue theme
- **Font**: Poppins (Google Fonts)
- **State Management**: Angular Services with RxJS
- **HTTP Client**: Angular HttpClient with interceptors
- **Routing**: Angular Router with lazy loading
- **Forms**: Reactive Forms with validation

## Project Structure

```
src/app/
├── components/           # Feature components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── products/        # Product management
│   ├── categories/      # Category management
│   ├── orders/          # Order management
│   ├── users/           # User management
│   └── layout/          # Layout components
├── services/            # API services
├── models/              # TypeScript interfaces
├── constants/           # Application constants
├── shared/              # Shared utilities
│   ├── guards/          # Route guards
│   └── interceptors/    # HTTP interceptors
└── styles.scss          # Global styles
```

## API Integration

The admin panel integrates with a Node.js/Express backend API with the following endpoints:

- **Authentication**: `/api/auth/*`
- **Admin Operations**: `/api/admin/*`
- **Products**: `/api/products/*`
- **Categories**: `/api/categories/*`
- **Orders**: `/api/orders/*`
- **Users**: `/api/users/*`

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd global-groceries-admin
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
   - Update `src/app/constants/api.constants.ts` with your backend API URL
   - Ensure your backend server is running on the configured port

4. Start the development server:
```bash
ng serve
```

5. Open your browser and navigate to `http://localhost:4200`

### Building for Production

```bash
ng build --configuration production
```

## Configuration

### API Configuration

Update the `API_CONSTANTS.BASE_URL` in `src/app/constants/api.constants.ts`:

```typescript
export const API_CONSTANTS = {
  BASE_URL: 'http://your-backend-url:5000/api',
  // ... other constants
};
```

### Theme Customization

The blue theme can be customized in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        // ... other shades
      }
    }
  }
}
```

## Features Overview

### Dashboard
- Real-time statistics for products, users, orders, and revenue
- Recent orders list with status indicators
- Top-selling products with sales metrics
- Responsive cards with beautiful animations

### Product Management
- Product listing with advanced filtering and search
- Add/Edit product forms with validation
- Image upload support
- Stock management
- Category assignment
- Pricing with discount support

### Authentication
- Secure login with JWT tokens
- Route guards for protected pages
- Automatic token refresh
- Logout functionality

### Responsive Design
- Mobile-first approach
- Collapsible sidebar
- Touch-friendly interface
- Optimized for all screen sizes

## Development Guidelines

### Code Standards
- Use TypeScript strict mode
- Follow Angular style guide
- Implement proper error handling
- Use reactive forms with validation
- Follow consistent naming conventions

### Component Structure
- Use standalone components
- Implement proper lifecycle hooks
- Use OnPush change detection where appropriate
- Implement proper error boundaries

### Service Architecture
- Use dependency injection
- Implement proper error handling
- Use RxJS operators for data transformation
- Follow single responsibility principle

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.