const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Create test notifications for all users
// @route   POST /api/test-notifications/create
// @access  Public (for testing)
router.post('/create', async (req, res) => {
  try {
    // Get all users
    const users = await User.find({}, '_id');
    
    if (users.length === 0) {
      return sendError(res, 404, 'No users found');
    }

    // Create sample notifications
    const sampleNotifications = [
      {
        title: 'Welcome to Groceries App!',
        description: 'Thank you for joining us. Start shopping for your favorite groceries now.',
        type: 'system',
        data: { welcome: true }
      },
      {
        title: 'Special Offer Available',
        description: 'Get 20% off on all organic products. Limited time offer!',
        type: 'promotion',
        data: { discount: 20, category: 'organic' }
      },
      {
        title: 'Order Update',
        description: 'Your order #12345 has been confirmed and is being prepared.',
        type: 'order',
        data: { orderId: '12345', status: 'confirmed' }
      },
      {
        title: 'Payment Successful',
        description: 'Your payment of ₹500 has been processed successfully.',
        type: 'payment',
        data: { amount: 500, status: 'success' }
      },
      {
        title: 'Delivery Update',
        description: 'Your order is out for delivery. Expected delivery time: 2-3 hours.',
        type: 'delivery',
        data: { orderId: '12345', status: 'out_for_delivery' }
      }
    ];

    // Create notifications for all users
    const notificationsToCreate = [];
    for (const user of users) {
      for (const notification of sampleNotifications) {
        notificationsToCreate.push({
          user: user._id,
          ...notification
        });
      }
    }

    const createdNotifications = await Notification.insertMany(notificationsToCreate);

    return sendSuccess(res, 'Test notifications created successfully', {
      totalUsers: users.length,
      notificationsPerUser: sampleNotifications.length,
      totalNotifications: createdNotifications.length
    });
  } catch (error) {
    console.error('Create test notifications error:', error);
    return sendError(res, 500, 'Server error');
  }
});

// @desc    Get notification statistics
// @route   GET /api/test-notifications/stats
// @access  Public (for testing)
router.get('/stats', async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });
    const notificationsByType = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const notificationsByUser = await Notification.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);

    return sendSuccess(res, 'Notification statistics retrieved', {
      totalNotifications,
      unreadNotifications,
      readNotifications: totalNotifications - unreadNotifications,
      notificationsByType,
      totalUsers: notificationsByUser.length,
      averageNotificationsPerUser: totalNotifications / notificationsByUser.length
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    return sendError(res, 500, 'Server error');
  }
});

module.exports = router;
