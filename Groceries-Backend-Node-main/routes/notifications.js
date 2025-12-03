const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Notification = require('../models/Notification');
const { sendSuccess, sendError, sendValidationError, sendServerError } = require('../utils/response');
const { protect } = require('../middleware/auth');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { user: req.user.id };
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

    return sendSuccess(res, 'Notifications retrieved successfully', {
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    return sendSuccess(res, 'Notification retrieved successfully', notification);
  } catch (error) {
    console.error('Get notification error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    return sendSuccess(res, 'Notification marked as read', notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    return sendSuccess(res, 'All notifications marked as read', {
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    return sendSuccess(res, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const result = await Notification.deleteMany({ user: req.user.id });

    return sendSuccess(res, 'All notifications deleted successfully', {
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private (Admin)
router.post('/', [
  protect,
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').optional().isIn(['order', 'promotion', 'system', 'payment', 'delivery']).withMessage('Invalid notification type'),
  body('userId').optional().isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { title, description, type = 'system', userId, data = {}, image, actionUrl } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied. Admin only.');
    }

    let notification;

    if (userId) {
      // Send to specific user
      notification = await Notification.create({
        user: userId,
        title,
        description,
        type,
        data,
        image,
        actionUrl
      });
    } else {
      // Send to all users (broadcast)
      const users = await require('../models/User').find({}, '_id');
      const notifications = users.map(user => ({
        user: user._id,
        title,
        description,
        type,
        data,
        image,
        actionUrl
      }));
      
      await Notification.insertMany(notifications);
      notification = { message: 'Notifications sent to all users' };
    }

    return sendSuccess(res, 'Notification created successfully', notification);
  } catch (error) {
    console.error('Create notification error:', error);
    return sendServerError(res, 'Server error');
  }
});

module.exports = router;
