const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const { protect, customerOnly, adminOnly } = require('../middleware/auth');
const { sendSuccess, sendError, sendValidationError, sendServerError } = require('../utils/response');

const router = express.Router();

// @desc    Update payment status
// @route   POST /api/payment/status
// @access  Private (Customer only)
router.post('/status', protect, customerOnly, [
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('status').isIn(['pending', 'paid', 'failed']).withMessage('Invalid payment status'),
  body('paymentReference').optional().isString().withMessage('Payment reference must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { orderId, status, paymentReference = '' } = req.body;

    // Verify order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id
    });

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Update order payment status
    order.updatePaymentStatus(status, paymentReference);
    await order.save();

    return sendSuccess(res, 'Payment status updated successfully', order);
  } catch (error) {
    console.error('Update payment status error:', error);
    return sendServerError(res, 'Payment status update failed');
  }
});

// @desc    Get payment status
// @route   POST /api/payment/status/check
// @access  Private (Customer only)
router.post('/status/check', protect, customerOnly, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return sendError(res, 400, 'Order ID is required');
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id
    });

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    return sendSuccess(res, 'Payment status retrieved successfully', {
      paymentStatus: order.paymentInfo.status,
      paymentMethod: order.paymentInfo.method,
      paymentReference: order.paymentInfo.paymentReference,
      paidAt: order.paymentInfo.paidAt
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Process refund (Admin only)
// @route   POST /api/payment/refund
// @access  Private (Admin only)
router.post('/refund', protect, adminOnly, [
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('reason').optional().isString().withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { orderId, reason = 'Refund requested' } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    if (order.paymentInfo.status !== 'paid') {
      return sendError(res, 400, 'Order is not paid');
    }

    // Update order payment status
    order.paymentInfo.status = 'refunded';
    await order.save();

    return sendSuccess(res, 'Refund processed successfully', {
      orderId: order._id,
      refundReason: reason,
      refundedAt: new Date()
    });
  } catch (error) {
    console.error('Refund error:', error);
    return sendServerError(res, 'Refund failed');
  }
});

module.exports = router;
