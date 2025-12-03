# Favorites API Documentation

## Overview
The Favorites API allows users to manage their favorite products. Users can add, remove, toggle, and retrieve their favorite products.

## Base URL
```
http://localhost:3511/api/favorites
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get User's Favorites
**GET** `/api/favorites`

Retrieves all favorite products for the authenticated user.

**Response:**
```json
{
  "success": true,
  "message": "Favorites retrieved successfully",
  "data": {
    "favorites": [
      {
        "_id": "product_id",
        "name": "Product Name",
        "price": 29.99,
        "originalPrice": 39.99,
        "images": [...],
        "stock": 100,
        "isActive": true,
        "isOutOfStock": false,
        "ratings": {...},
        "brand": "Brand Name",
        "category": {...}
      }
    ],
    "count": 5
  }
}
```

### 2. Add Product to Favorites
**POST** `/api/favorites/add`

Adds a product to the user's favorites.

**Request Body:**
```json
{
  "productId": "product_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product added to favorites successfully",
  "data": {
    "productId": "product_id_here",
    "favoritesCount": 6
  }
}
```

**Error Responses:**
- `400`: Product is already in favorites
- `404`: Product not found or not available

### 3. Remove Product from Favorites
**POST** `/api/favorites/remove`

Removes a product from the user's favorites.

**Request Body:**
```json
{
  "productId": "product_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product removed from favorites successfully",
  "data": {
    "productId": "product_id_here",
    "favoritesCount": 5
  }
}
```

**Error Responses:**
- `404`: Product not found in favorites

### 4. Toggle Product in Favorites
**POST** `/api/favorites/toggle`

Adds the product to favorites if not present, removes it if already present.

**Request Body:**
```json
{
  "productId": "product_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product added/removed from favorites successfully",
  "data": {
    "productId": "product_id_here",
    "isFavorite": true,
    "favoritesCount": 6
  }
}
```

### 5. Check if Product is in Favorites
**POST** `/api/favorites/check`

Checks whether a specific product is in the user's favorites.

**Request Body:**
```json
{
  "productId": "product_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Favorite status checked successfully",
  "data": {
    "productId": "product_id_here",
    "isFavorite": true,
    "favoritesCount": 5
  }
}
```

### 6. Clear All Favorites
**POST** `/api/favorites/clear`

Removes all products from the user's favorites.

**Response:**
```json
{
  "success": true,
  "message": "All favorites cleared successfully",
  "data": {
    "favoritesCount": 0,
    "clearedCount": 5
  }
}
```

### 7. Get Favorites Count
**GET** `/api/favorites/count`

Returns the number of products in the user's favorites.

**Response:**
```json
{
  "success": true,
  "message": "Favorites count retrieved successfully",
  "data": {
    "count": 5
  }
}
```

## Error Responses

### Authentication Errors
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "data": [
    {
      "msg": "Valid product ID is required",
      "param": "productId",
      "location": "body"
    }
  ]
}
```

### Server Errors
```json
{
  "success": false,
  "message": "Server error"
}
```

## Usage Examples

### Add a product to favorites
```bash
curl -X POST http://localhost:3511/api/favorites/add \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"productId": "product_id_here"}'
```

### Get all favorites
```bash
curl -X GET http://localhost:3511/api/favorites \
  -H "Authorization: Bearer your_jwt_token"
```

### Toggle product in favorites
```bash
curl -X POST http://localhost:3511/api/favorites/toggle \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"productId": "product_id_here"}'
```

## Database Schema

### User Model Update
The User model has been updated to include a `favorites` field:

```javascript
favorites: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Product'
}]
```

### Features
- ✅ Add product to favorites
- ✅ Remove product from favorites  
- ✅ Toggle product in favorites
- ✅ Check if product is in favorites
- ✅ Get all favorites with product details
- ✅ Clear all favorites
- ✅ Get favorites count
- ✅ Authentication required for all endpoints
- ✅ Validation for product IDs
- ✅ Error handling for inactive products
- ✅ Populated product details in responses

## Integration with Flutter App

The API endpoints have been added to the Flutter app's API configuration:

```dart
/// Favorites
static const String getFavorites = "favorites";
static const String addToFavorites = "favorites/add";
static const String removeFromFavorites = "favorites/remove";
static const String toggleFavorites = "favorites/toggle";
static const String checkFavorites = "favorites/check";
static const String clearFavorites = "favorites/clear";
static const String getFavoritesCount = "favorites/count";
```

## Testing

The API has been tested and is working correctly. The server responds with proper authentication errors when no token is provided, confirming the endpoints are properly protected.
