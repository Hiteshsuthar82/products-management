const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const RedeemRule = require('../models/RedeemRule');
const { protect, customerOnly, adminOnly } = require('../middleware/auth');
const { sendSuccess, sendError, sendValidationError, sendServerError } = require('../utils/response');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer only)
router.post('/', protect, customerOnly, [
  body('paymentMethod').isIn(['cash', 'online']).withMessage('Payment method must be cash or online'),
  body('shippingAddress').isObject().withMessage('Shipping address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { paymentMethod, shippingAddress, notes = '', paymentReference = '' } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return sendError(res, 400, 'Cart is empty');
    }

    // Validate cart items and stock
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return sendError(res, 400, `Product ${item.product?.name || 'Unknown'} is no longer available`);
      }

      if (item.product.stock < item.quantity) {
        return sendError(res, 400, `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`);
      }
    }

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      image: item.product.images[0]?.url || ''
    }));

    // Calculate pricing
    const itemsPrice = cart.totalAmount;
    const shippingPrice = 0; // You can implement shipping calculation logic here
    const taxPrice = itemsPrice * 0.18; // 18% GST
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        status: paymentMethod === 'cash' ? 'pending' : 'paid',
        paymentReference: paymentReference
      },
      pricing: {
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        currency: 'INR'
      },
      notes
    });

    // Update product stock and sold count
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }

    // Clear cart
    cart.clearCart();
    await cart.save();

    // Process redeem points
    try {
      const rules = await RedeemRule.find({ isActive: true }).sort({ minOrderValue: -1 });
      const applicableRule = rules.find(rule => totalPrice >= rule.minOrderValue);
      
      if (applicableRule) {
        const user = await User.findById(req.user.id);
        user.redeemPoints += applicableRule.redeemPoints;
        await user.save();
        
        console.log(`Awarded ${applicableRule.redeemPoints} points to user ${req.user.id} for order ${order._id}`);
      }
    } catch (redeemError) {
      console.error('Error processing redeem points:', redeemError);
      // Don't fail the order creation if redeem processing fails
    }

    return sendSuccess(res, 'Order created successfully', order);
  } catch (error) {
    console.error('Create order error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get user's orders
// @route   POST /api/orders/list
// @access  Private (Customer only)
router.post('/list', protect, customerOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.body;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: req.user.id });

    return sendSuccess(res, 'Orders retrieved successfully', {
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get single order
// @route   POST /api/orders/detail
// @access  Private (Customer only)
router.post('/detail', protect, customerOnly, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return sendError(res, 400, 'Order ID is required');
    }

    const order = await Order.findById(orderId)
      .populate('items.product', 'name images')
      .populate('user', 'name email phone');

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Check if user owns this order
    if (order.user._id.toString() !== req.user.id) {
      return sendError(res, 403, 'Access denied');
    }

    return sendSuccess(res, 'Order retrieved successfully', order);
  } catch (error) {
    console.error('Get order error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Update order status (for admin)
// @route   POST /api/orders/status
// @access  Private (Admin only)
router.post('/status', protect, adminOnly, [
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid order status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { orderId, status, trackingNumber, carrier, estimatedDelivery } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    order.updateStatus(status);

    if (status === 'shipped') {
      if (trackingNumber) order.shippingInfo.trackingNumber = trackingNumber;
      if (carrier) order.shippingInfo.carrier = carrier;
      if (estimatedDelivery) order.shippingInfo.estimatedDelivery = new Date(estimatedDelivery);
    }

    await order.save();

    return sendSuccess(res, 'Order status updated successfully', order);
  } catch (error) {
    console.error('Update order status error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Cancel order
// @route   POST /api/orders/cancel
// @access  Private (Customer only)
router.post('/cancel', protect, customerOnly, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return sendError(res, 400, 'Order ID is required');
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id) {
      return sendError(res, 403, 'Access denied');
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled', 'returned'].includes(order.orderStatus)) {
      return sendError(res, 400, 'Order cannot be cancelled');
    }

    // Update order status
    order.updateStatus('cancelled');

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity }
      });
    }

    await order.save();

    return sendSuccess(res, 'Order cancelled successfully', order);
  } catch (error) {
    console.error('Cancel order error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Reorder
// @route   POST /api/orders/reorder
// @access  Private (Customer only)
router.post('/reorder', protect, customerOnly, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return sendError(res, 400, 'Order ID is required');
    }

    const originalOrder = await Order.findById(orderId);

    if (!originalOrder) {
      return sendError(res, 404, 'Original order not found');
    }

    // Check if user owns this order
    if (originalOrder.user.toString() !== req.user.id) {
      return sendError(res, 403, 'Access denied');
    }

    // Check if products are still available
    for (const item of originalOrder.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive || product.stock < item.quantity) {
        return sendError(res, 400, `Product ${item.name} is no longer available or out of stock`);
      }
    }

    // Create new order
    const newOrder = await Order.create({
      user: req.user.id,
      items: originalOrder.items,
      shippingAddress: originalOrder.shippingAddress,
      paymentInfo: {
        method: originalOrder.paymentInfo.method,
        status: 'pending'
      },
      pricing: originalOrder.pricing,
      notes: `Reorder of order ${originalOrder.orderNumber}`,
      isReorder: true,
      originalOrder: originalOrder._id
    });

    // Update product stock and sold count
    for (const item of newOrder.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }

    return sendSuccess(res, 'Order recreated successfully', newOrder);
  } catch (error) {
    console.error('Reorder error:', error);
    return sendServerError(res, 'Server error');
  }
});

router.get('/export', protect, adminOnly, async (req, res) => {
  try {
    const ExcelJS = require('exceljs');

    // Fetch all orders with populated user and product details
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // Define columns
    worksheet.columns = [
      { header: 'Order #', key: 'orderNumber', width: 16 },
      { header: 'Customer', key: 'customer', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Items', key: 'itemsCount', width: 10 },
      { header: 'Total (INR)', key: 'totalPrice', width: 15 },
      { header: 'Order Status', key: 'orderStatus', width: 14 },
      { header: 'Payment Status', key: 'paymentStatus', width: 14 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
      { header: 'Shipping Address', key: 'shippingAddress', width: 40 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'State', key: 'state', width: 12 },
      { header: 'Postal Code', key: 'postalCode', width: 12 },
      { header: 'Tracking #', key: 'trackingNumber', width: 18 },
      { header: 'Carrier', key: 'carrier', width: 12 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Paid At', key: 'paidAt', width: 20 },
      { header: 'Shipped At', key: 'shippedAt', width: 20 },
      { header: 'Delivered At', key: 'deliveredAt', width: 20 }
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    orders.forEach(order => {
      const itemsSummary = order.items
        .map(item => `${item.name} (x${item.quantity})`)
        .join('; ');

      worksheet.addRow({
        orderNumber: order.orderNumber,
        customer: order.user?.name || 'N/A',
        email: order.user?.email || 'N/A',
        itemsCount: order.items.length,
        totalPrice: order.pricing.totalPrice,
        orderStatus: order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1),
        paymentStatus: order.paymentInfo.status.charAt(0).toUpperCase() + order.paymentInfo.status.slice(1),
        paymentMethod: order.paymentInfo.method === 'cash' ? 'Cash on Delivery' : 'Online',
        shippingAddress: `${order.shippingAddress.address}, ${order.shippingAddress.city}`,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        trackingNumber: order.shippingInfo.trackingNumber || '—',
        carrier: order.shippingInfo.carrier || '—',
        notes: order.notes || '—',
        createdAt: new Date(order.createdAt).toLocaleString('en-IN'),
        paidAt: order.paymentInfo.paidAt ? new Date(order.paymentInfo.paidAt).toLocaleString('en-IN') : '—',
        shippedAt: order.shippingInfo.shippedAt ? new Date(order.shippingInfo.shippedAt).toLocaleString('en-IN') : '—',
        deliveredAt: order.shippingInfo.deliveredAt ? new Date(order.shippingInfo.deliveredAt).toLocaleString('en-IN') : '—'
      });
    });

    // Auto-size columns (optional fine-tuning)
    worksheet.columns.forEach((column, index) => {
      if (column.header === 'Shipping Address') column.width = 40;
      if (column.header === 'Notes') column.width = 35;
    });

    // Set response headers
    const filename = `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response stream
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export orders error:', error);
    return sendServerError(res, 'Failed to export orders');
  }
});

module.exports = router;
