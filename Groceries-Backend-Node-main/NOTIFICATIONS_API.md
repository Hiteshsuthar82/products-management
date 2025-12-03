# Notifications API Documentation

This document describes the notification system API endpoints for the Groceries App.

## Overview

The notification system allows users to receive and manage notifications with the following features:
- Create notifications with title, description, and type
- Mark notifications as read/unread
- Filter notifications by type and read status
- Delete notifications
- Pagination support
- Real-time updates

## API Endpoints

### 1. Get User Notifications
**GET** `/api/notifications`

Retrieve paginated notifications for the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by notification type (`order`, `promotion`, `system`, `payment`, `delivery`)
- `isRead` (optional): Filter by read status (`true` or `false`)

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    },
    "unreadCount": 15
  }
}
```

### 2. Get Single Notification
**GET** `/api/notifications/:id`

Retrieve a specific notification by ID.

### 3. Mark Notification as Read
**PUT** `/api/notifications/:id/read`

Mark a specific notification as read.

### 4. Mark All Notifications as Read
**PUT** `/api/notifications/read-all`

Mark all notifications for the user as read.

### 5. Delete Notification
**DELETE** `/api/notifications/:id`

Delete a specific notification.

### 6. Delete All Notifications
**DELETE** `/api/notifications`

Delete all notifications for the user.

### 7. Create Notification (Admin Only)
**POST** `/api/notifications`

Create a new notification (admin only).

**Request Body:**
```json
{
  "title": "Notification Title",
  "description": "Notification description",
  "type": "system",
  "userId": "optional_user_id",
  "data": {},
  "image": "optional_image_url",
  "actionUrl": "optional_action_url"
}
```

## Notification Types

- `order`: Order-related notifications
- `promotion`: Promotional notifications
- `system`: System notifications
- `payment`: Payment-related notifications
- `delivery`: Delivery-related notifications

## Test Endpoints

### Create Test Notifications
**POST** `/api/test-notifications/create`

Creates sample notifications for all users (for testing purposes).

### Get Notification Statistics
**GET** `/api/test-notifications/stats`

Retrieve notification statistics (for testing purposes).

## Mobile App Integration

The Flutter app includes:
- `NotificationsService`: Handles API calls
- `NotificationsCtrl`: Manages state and business logic
- `Notifications`: UI screen for displaying notifications
- Real-time notification handling with Firebase

## Usage Examples

### Creating a notification (Admin)
```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Feature Available",
    "description": "Check out our new grocery delivery feature!",
    "type": "system"
  }'
```

### Getting user notifications
```bash
curl -X GET "http://localhost:5000/api/notifications?page=1&limit=10" \
  -H "Authorization: Bearer USER_TOKEN"
```

### Marking notification as read
```bash
curl -X PUT http://localhost:5000/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer USER_TOKEN"
```

## Database Schema

The Notification model includes:
- `user`: Reference to User model
- `title`: Notification title
- `description`: Notification description
- `type`: Notification type
- `isRead`: Read status
- `data`: Additional data (JSON)
- `image`: Optional image URL
- `actionUrl`: Optional action URL
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Authentication

All endpoints (except test endpoints) require authentication via Bearer token in the Authorization header.
