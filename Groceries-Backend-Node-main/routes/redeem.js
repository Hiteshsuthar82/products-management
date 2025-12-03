const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const RedeemRule = require('../models/RedeemRule');
const RedeemPointValue = require('../models/RedeemPointValue');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');
const { sendSuccess, sendError, sendValidationError, sendServerError } = require('../utils/response');

// ==================== REDEEM RULE MANAGEMENT ====================

// @desc    Get all redeem rules
// @route   POST /api/admin/redeem/rules
// @access  Private (Admin only)
router.post('/rules', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, search } = req.body;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const rules = await RedeemRule.find(filter)
      .sort({ minOrderValue: 1 })
      .skip(skip)
      .limit(limit);

    const total = await RedeemRule.countDocuments(filter);

    return sendSuccess(res, 'Redeem rules retrieved successfully', {
      count: rules.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      rules
    });
  } catch (error) {
    console.error('Get redeem rules error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Create new redeem rule
// @route   POST /api/admin/redeem/rules/create
// @access  Private (Admin only)
router.post('/rules/create', protect, adminOnly, [
  body('name').notEmpty().withMessage('Rule name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('minOrderValue').isNumeric().withMessage('Minimum order value must be a number'),
  body('redeemPoints').isInt({ min: 1 }).withMessage('Redeem points must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { name, description, minOrderValue, redeemPoints, isActive = true } = req.body;

    // Check if rule with same min order value already exists
    const existingRule = await RedeemRule.findOne({ minOrderValue });
    if (existingRule) {
      return sendError(res, 'A rule with this minimum order value already exists', 400);
    }

    const rule = await RedeemRule.create({
      name,
      description,
      minOrderValue,
      redeemPoints,
      isActive
    });

    return sendSuccess(res, 'Redeem rule created successfully', rule);
  } catch (error) {
    console.error('Create redeem rule error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Update redeem rule
// @route   PUT /api/admin/redeem/rules/:id
// @access  Private (Admin only)
router.put('/rules/:id', protect, adminOnly, [
  body('name').optional().notEmpty().withMessage('Rule name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('minOrderValue').optional().isNumeric().withMessage('Minimum order value must be a number'),
  body('redeemPoints').optional().isInt({ min: 1 }).withMessage('Redeem points must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if rule exists
    const rule = await RedeemRule.findById(id);
    if (!rule) {
      return sendError(res, 'Redeem rule not found', 404);
    }

    // If minOrderValue is being updated, check for conflicts
    if (updateData.minOrderValue && updateData.minOrderValue !== rule.minOrderValue) {
      const existingRule = await RedeemRule.findOne({ 
        minOrderValue: updateData.minOrderValue,
        _id: { $ne: id }
      });
      if (existingRule) {
        return sendError(res, 'A rule with this minimum order value already exists', 400);
      }
    }

    const updatedRule = await RedeemRule.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, 'Redeem rule updated successfully', updatedRule);
  } catch (error) {
    console.error('Update redeem rule error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Delete redeem rule
// @route   DELETE /api/admin/redeem/rules/:id
// @access  Private (Admin only)
router.delete('/rules/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const rule = await RedeemRule.findById(id);
    if (!rule) {
      return sendError(res, 'Redeem rule not found', 404);
    }

    await RedeemRule.findByIdAndDelete(id);

    return sendSuccess(res, 'Redeem rule deleted successfully');
  } catch (error) {
    console.error('Delete redeem rule error:', error);
    return sendServerError(res, 'Server error');
  }
});

// ==================== REDEEM POINT VALUE MANAGEMENT ====================

// @desc    Get redeem point value
// @route   GET /api/admin/redeem/point-value
// @access  Private (Admin only)
router.get('/point-value', protect, adminOnly, async (req, res) => {
  try {
    let pointValue = await RedeemPointValue.findOne({ isActive: true });
    
    if (!pointValue) {
      // Create default point value if none exists
      pointValue = await RedeemPointValue.create({
        pointValue: 1, // Default: 1 point = 1 currency unit
        isActive: true
      });
    }

    return sendSuccess(res, 'Redeem point value retrieved successfully', pointValue);
  } catch (error) {
    console.error('Get redeem point value error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Update redeem point value
// @route   PUT /api/admin/redeem/point-value
// @access  Private (Admin only)
router.put('/point-value', protect, adminOnly, [
  body('pointValue').isNumeric().withMessage('Point value must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { pointValue } = req.body;

    let pointValueDoc = await RedeemPointValue.findOne({ isActive: true });
    
    if (pointValueDoc) {
      // Update existing
      pointValueDoc.pointValue = pointValue;
      pointValueDoc.updatedAt = Date.now();
      await pointValueDoc.save();
    } else {
      // Create new
      pointValueDoc = await RedeemPointValue.create({
        pointValue,
        isActive: true
      });
    }

    return sendSuccess(res, 'Redeem point value updated successfully', pointValueDoc);
  } catch (error) {
    console.error('Update redeem point value error:', error);
    return sendServerError(res, 'Server error');
  }
});

// ==================== USER REDEEM POINTS MANAGEMENT ====================

// @desc    Get user redeem points
// @route   GET /api/admin/redeem/user-points/:userId
// @access  Private (Admin only)
router.get('/user-points/:userId', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('redeemPoints');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const pointValue = await RedeemPointValue.findOne({ isActive: true });
    const pointValueAmount = pointValue ? pointValue.pointValue : 1;

    return sendSuccess(res, 'User redeem points retrieved successfully', {
      userId,
      totalPoints: user.redeemPoints,
      availablePoints: user.redeemPoints,
      pointValue: pointValueAmount
    });
  } catch (error) {
    console.error('Get user redeem points error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Update user redeem points
// @route   PUT /api/admin/redeem/user-points/:userId
// @access  Private (Admin only)
router.put('/user-points/:userId', protect, adminOnly, [
  body('points').isInt({ min: 0 }).withMessage('Points must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { userId } = req.params;
    const { points } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.redeemPoints = points;
    await user.save();

    return sendSuccess(res, 'User redeem points updated successfully', {
      userId,
      totalPoints: user.redeemPoints
    });
  } catch (error) {
    console.error('Update user redeem points error:', error);
    return sendServerError(res, 'Server error');
  }
});

// ==================== ORDER REDEEM PROCESSING ====================

// @desc    Process redeem points for order
// @route   POST /api/redeem/process-order
// @access  Private
router.post('/process-order', protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // Check if order belongs to current user
    if (order.user._id.toString() !== req.user.id) {
      return sendError(res, 'Unauthorized', 403);
    }

    // Get active redeem rules
    const rules = await RedeemRule.find({ isActive: true }).sort({ minOrderValue: -1 });
    
    // Find applicable rule
    const applicableRule = rules.find(rule => order.pricing.total >= rule.minOrderValue);
    
    if (applicableRule) {
      // Add redeem points to user
      const user = await User.findById(req.user.id);
      user.redeemPoints += applicableRule.redeemPoints;
      await user.save();

      return sendSuccess(res, 'Redeem points added successfully', {
        pointsAdded: applicableRule.redeemPoints,
        totalPoints: user.redeemPoints,
        ruleApplied: applicableRule.name
      });
    }

    return sendSuccess(res, 'No applicable redeem rule found', {
      pointsAdded: 0,
      totalPoints: order.user.redeemPoints
    });
  } catch (error) {
    console.error('Process order redeem error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get user reward points balance
// @route   POST /api/redeem/user-points
// @access  Private
router.post('/user-points', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('redeemPoints');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const pointValue = await RedeemPointValue.findOne({ isActive: true });
    const pointValueAmount = pointValue ? pointValue.pointValue : 1;

    return sendSuccess(res, 'User reward points retrieved successfully', {
      userId: user._id,
      totalPoints: user.redeemPoints,
      availablePoints: user.redeemPoints,
      pointValue: pointValueAmount
    });
  } catch (error) {
    console.error('Get user reward points error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get user reward points history
// @route   POST /api/redeem/points-history
// @access  Private
router.post('/points-history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.body;
    const skip = (page - 1) * limit;

    // Get user's orders with redeem points
    const orders = await Order.find({ 
      user: req.user.id,
      'redeemPoints.earned': { $gt: 0 }
    })
    .select('orderNumber orderStatus pricing.total redeemPoints createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Order.countDocuments({ 
      user: req.user.id,
      'redeemPoints.earned': { $gt: 0 }
    });

    const history = orders.map(order => ({
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      orderTotal: order.pricing.total,
      pointsEarned: order.redeemPoints?.earned || 0,
      pointsUsed: order.redeemPoints?.used || 0,
      date: order.createdAt
    }));

    return sendSuccess(res, 'Reward points history retrieved successfully', {
      count: history.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      history
    });
  } catch (error) {
    console.error('Get reward points history error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Apply redeem points to order
// @route   POST /api/redeem/apply
// @access  Private
router.post('/apply', protect, [
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('pointsToUse').isInt({ min: 1 }).withMessage('Points to use must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { orderId, pointsToUse } = req.body;

    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // Check if order belongs to current user
    if (order.user._id.toString() !== req.user.id) {
      return sendError(res, 'Unauthorized', 403);
    }

    // Check if order is in pending status
    if (order.orderStatus !== 'pending') {
      return sendError(res, 'Redeem points can only be applied to pending orders', 400);
    }

    const user = await User.findById(req.user.id);
    if (user.redeemPoints < pointsToUse) {
      return sendError(res, 'Insufficient redeem points', 400);
    }

    // Get point value
    const pointValue = await RedeemPointValue.findOne({ isActive: true });
    const pointValueAmount = pointValue ? pointValue.pointValue : 1;

    const discountAmount = pointsToUse * pointValueAmount;
    const maxDiscount = order.pricing.total * 0.5; // Maximum 50% discount

    if (discountAmount > maxDiscount) {
      return sendError(res, 'Discount cannot exceed 50% of order total', 400);
    }

    // Update order with discount
    order.pricing.discount = discountAmount;
    order.pricing.total = order.pricing.subtotal + order.pricing.tax - order.pricing.discount;
    await order.save();

    // Deduct points from user
    user.redeemPoints -= pointsToUse;
    await user.save();

    return sendSuccess(res, 'Redeem points applied successfully', {
      discountAmount,
      remainingPoints: user.redeemPoints,
      orderTotal: order.pricing.total
    });
  } catch (error) {
    console.error('Apply redeem points error:', error);
    return sendServerError(res, 'Server error');
  }
});

module.exports = router;
