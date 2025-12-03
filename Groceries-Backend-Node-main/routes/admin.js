const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');
const Config = require('../models/Config')
const RedeemRule = require('../models/RedeemRule');
const RedeemPointValue = require('../models/RedeemPointValue');
const { protect, adminOnly } = require('../middleware/auth');
const { sendSuccess, sendError, sendValidationError, sendServerError } = require('../utils/response');
const { uploadMultiple, getFileUrl, deleteFile } = require('../utils/upload');

const router = express.Router();

// ==================== PRODUCT MANAGEMENT ====================

// @desc    Get all products (Admin)
// @route   POST /api/admin/products
// @access  Private (Admin only)
router.post('/products', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, brand, isActive, isOutOfStock, search } = req.body;

    const skip = (page - 1) * limit;

    // Build filter object (AND semantics by default)
    const andFilters = [];
    const filter = {};
    
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (isActive !== undefined) filter.isActive = isActive;

    // Always exclude soft-deleted products unless explicitly requested otherwise
    andFilters.push({ $or: [ { isDeleted: { $exists: false } }, { isDeleted: false } ] });

    // When filtering by out-of-stock, treat stock <= 0 as out of stock as well
    if (isOutOfStock !== undefined) {
      if (isOutOfStock === true) {
        andFilters.push({ $or: [ { isOutOfStock: true }, { stock: { $lte: 0 } } ] });
      } else {
        andFilters.push({ $and: [ { $or: [ { isOutOfStock: false }, { isOutOfStock: { $exists: false } } ] }, { stock: { $gt: 0 } } ] });
      }
    }
    
    if (search) {
      andFilters.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Combine AND filters if any
    if (andFilters.length > 0) {
      filter.$and = andFilters;
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug icon parentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    return sendSuccess(res, 'Products retrieved successfully', {
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get single product by ID (Admin)
// @route   POST /api/admin/products/detail
// @access  Private (Admin only)
router.post('/products/detail', protect, adminOnly, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return sendError(res, 400, 'Product ID is required');
    }

    const product = await Product.findById(productId)
      .populate('category', 'name slug icon parentId');

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    return sendSuccess(res, 'Product retrieved successfully', product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    return sendServerError(res, 'Server error');
  }
});
router.post('/config',  async (req, res) => {
  try {
    // Get the latest config
    let config = await Config.find({}).sort({ createdAt: -1 });

    // If no config found, create default
    if (config.length === 0) {
      config = await Config.create({
        code: '+91',
        country: 'India',
        flag: '🇮🇳',
        currencySign: '₹'
      });
      config = [config];
    }

    return sendSuccess(res, 'Config fetched successfully', config);
  } catch (error) {
    console.error('Get config error:', error);
    return sendServerError(res, 'Server error');
  }
});

router.post('/save-config', async (req, res) => {
  try {
    const { code, country, flag, currencySign } = req.body;

    if (!(code && country && flag && currencySign)) {
      return sendBadRequest(res, 'Please provide all the fields!');
    }

    let existing = await Config.findOne({ code });

    let config;
    if (existing) {
      config = await Config.findByIdAndUpdate(
        existing._id,
        { code, country, flag, currencySign },
        { new: true }
      );
    } else {
      config = await Config.create({ code, country, flag, currencySign });
    }

    return sendSuccess(res, 'Config saved successfully!', config);
  } catch (error) {
    console.error('Save config error:', error);
    return sendServerError(res, 'Server error');
  }
});


router.post('/delete-config', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return sendBadRequest(res, 'Please provide all the fields!');
    }

    await Config.findOneAndDelete({ code });
    return sendSuccess(res, 'Config deleted successfully!', true);
  } catch (error) {
    console.error('Delete config error:', error);
    return sendServerError(res, 'Server error');
  }
});


// @desc    Create new product
// @route   POST /api/admin/products/add
// @access  Private (Admin only)
router.post('/products/add', protect, adminOnly, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').isMongoId().withMessage('Valid category ID is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    // Validate category exists
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    // Validate subcategory exists if provided
    if (req.body.subcategoryId) {
      const subcategory = await Category.findById(req.body.subcategoryId);
      if (!subcategory) {
        return sendError(res, 404, 'Subcategory not found');
      }
      if (subcategory.parentId.toString() !== req.body.categoryId) {
        return sendError(res, 400, 'Subcategory does not belong to the specified category');
      }
    }

    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      originalPrice: req.body.originalPrice,
      category: req.body.subcategoryId || req.body.categoryId, // Use subcategory if provided, otherwise category
      brand: req.body.brand,
      stock: req.body.stock,
      weight: req.body.weight,
      dimensions: req.body.dimensions,
      colors: req.body.colors,
      sizes: req.body.sizes,
      tags: req.body.tags,
      featured: req.body.featured,
      discount: req.body.discount,
      images: req.body.images || []
    };

    const product = await Product.create(productData);

    return sendSuccess(res, 'Product created successfully', product);
  } catch (error) {
    console.error('Create product error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Update product
// @route   POST /api/admin/products/update
// @access  Private (Admin only)
router.post('/products/update', protect, adminOnly, [
  body('productId').isMongoId().withMessage('Valid product ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { productId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    // Validate category if provided
    if (req.body.categoryId) {
      const category = await Category.findById(req.body.categoryId);
      if (!category) {
        return sendError(res, 404, 'Category not found');
      }
    }

    // Validate subcategory if provided
    if (req.body.subcategoryId) {
      const subcategory = await Category.findById(req.body.subcategoryId);
      if (!subcategory) {
        return sendError(res, 404, 'Subcategory not found');
      }
      if (req.body.categoryId && subcategory.parentId.toString() !== req.body.categoryId) {
        return sendError(res, 400, 'Subcategory does not belong to the specified category');
      }
    }

    const fieldsToUpdate = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      originalPrice: req.body.originalPrice,
      category: req.body.subcategoryId || req.body.categoryId, // Use subcategory if provided, otherwise category
      brand: req.body.brand,
      stock: req.body.stock,
      weight: req.body.weight,
      dimensions: req.body.dimensions,
      colors: req.body.colors,
      sizes: req.body.sizes,
      tags: req.body.tags,
      featured: req.body.featured,
      discount: req.body.discount,
      images: req.body.images,
      isActive: req.body.isActive
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      fieldsToUpdate,
      { new: true, runValidators: true }
    ).populate('category', 'name slug icon parentId');

    return sendSuccess(res, 'Product updated successfully', updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Toggle product status
// @route   POST /api/admin/products/toggle-status
// @access  Private (Admin only)
router.post('/products/toggle-status', protect, adminOnly, [
  body('productId').isMongoId().withMessage('Valid product ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { productId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    product.isActive = !product.isActive;
    await product.save();

    return sendSuccess(res, 'Product status updated successfully', product);
  } catch (error) {
    console.error('Toggle product status error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Delete product
// @route   POST /api/admin/products/delete
// @access  Private (Admin only)
router.post('/products/delete', protect, adminOnly, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return sendError(res, 400, 'Product ID is required');
    }

    const product = await Product.findById(productId);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    // Soft delete - set isDeleted to true
    product.isDeleted = true;
    product.isActive = false;
    await product.save();

    return sendSuccess(res, 'Product deleted successfully', { productId: product._id });
  } catch (error) {
    console.error('Delete product error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Upload product images
// @route   POST /api/admin/products/upload-images
// @access  Private (Admin only)
router.post('/products/upload-images', protect, adminOnly, (req, res) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      // Handle specific multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 400, 'File too large. Maximum file size is 10MB.');
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return sendError(res, 400, 'Too many files. Maximum 10 files allowed.');
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return sendError(res, 400, 'Unexpected file field. Please use the correct form field.');
      }
      
      return sendError(res, 400, err.message || 'File upload failed');
    }

    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, 'No files uploaded');
    }

    try {
      const uploadedImages = req.files.map(file => ({
        public_id: file.filename,
        url: getFileUrl(req, file.filename)
      }));

      return sendSuccess(res, 'Images uploaded successfully', {
        images: uploadedImages,
        count: uploadedImages.length
      });
    } catch (error) {
      return sendServerError(res, 'Failed to process uploaded images');
    }
  });
});

// @desc    Delete product image
// @route   POST /api/admin/products/delete-image
// @access  Private (Admin only)
router.post('/products/delete-image', protect, adminOnly, async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return sendError(res, 400, 'Image ID is required');
    }

    // Delete the file from filesystem
    deleteFile(public_id);

    return sendSuccess(res, 'Image deleted successfully');
  } catch (error) {
    return sendServerError(res, 'Failed to delete image');
  }
});

// ==================== ORDER MANAGEMENT ====================

// @desc    Get all orders (Admin)
// @route   POST /api/admin/orders
// @access  Private (Admin only)
router.post('/orders', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, paymentMethod, search } = req.body;

    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter['paymentInfo.status'] = paymentStatus;
    if (paymentMethod) filter['paymentInfo.method'] = paymentMethod;
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

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

// @desc    Get single order (Admin)
// @route   POST /api/admin/orders/detail
// @access  Private (Admin only)
router.post('/orders/detail', protect, adminOnly, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return sendError(res, 400, 'Order ID is required');
    }

    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    return sendSuccess(res, 'Order retrieved successfully', order);
  } catch (error) {
    console.error('Get order error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Update order status
// @route   POST /api/admin/orders/status
// @access  Private (Admin only)
router.post('/orders/status', protect, adminOnly, [
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

// ==================== USER MANAGEMENT ====================

// @desc    Get all users (Admin)
// @route   POST /api/admin/users
// @access  Private (Admin only)
router.post('/users', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.body;

    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return sendSuccess(res, 'Users retrieved successfully', {
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Update user status
// @route   POST /api/admin/users/status
// @access  Private (Admin only)
router.post('/users/status', protect, adminOnly, [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { userId, isActive } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    user.isActive = isActive;
    await user.save();

    return sendSuccess(res, 'User status updated successfully', user);
  } catch (error) {
    console.error('Update user status error:', error);
    return sendServerError(res, 'Server error');
  }
});

// ==================== DASHBOARD STATS ====================

// @desc    Get dashboard statistics
// @route   POST /api/admin/dashboard
// @access  Private (Admin only)
router.post('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const outOfStockProducts = await Product.countDocuments({ isOutOfStock: true });

    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const activeUsers = await User.countDocuments({ isActive: true });

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'delivered' });

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: 'delivered', 'paymentInfo.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Top selling products
    const topProducts = await Product.find({ isActive: true })
      .sort({ sold: -1 })
      .limit(5)
      .select('name sold price images');

    return sendSuccess(res, 'Dashboard statistics retrieved successfully', {
      stats: {
        products: {
          total: totalProducts,
          active: activeProducts,
          outOfStock: outOfStockProducts
        },
        users: {
          total: totalUsers,
          customers: totalCustomers,
          active: activeUsers
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders
        },
        revenue: {
          total: totalRevenue
        }
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return sendServerError(res, 'Server error');
  }
});

// ==================== REDEEM MANAGEMENT ====================

// @desc    Get all redeem rules (Admin)
// @route   POST /api/admin/redeem/rules
// @access  Private (Admin only)
router.post('/redeem/rules', protect, adminOnly, async (req, res) => {
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

// @desc    Create new redeem rule (Admin)
// @route   POST /api/admin/redeem/rules/create
// @access  Private (Admin only)
router.post('/redeem/rules/create', protect, adminOnly, [
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

// @desc    Update redeem rule (Admin)
// @route   PUT /api/admin/redeem/rules/:id
// @access  Private (Admin only)
router.put('/redeem/rules/:id', protect, adminOnly, [
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

// @desc    Delete redeem rule (Admin)
// @route   DELETE /api/admin/redeem/rules/:id
// @access  Private (Admin only)
router.delete('/redeem/rules/:id', protect, adminOnly, async (req, res) => {
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

// @desc    Get redeem point value (Admin)
// @route   GET /api/admin/redeem/point-value
// @access  Private (Admin only)
router.get('/redeem/point-value', protect, adminOnly, async (req, res) => {
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

// @desc    Update redeem point value (Admin)
// @route   PUT /api/admin/redeem/point-value
// @access  Private (Admin only)
router.put('/redeem/point-value', protect, adminOnly, [
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

router.get('/status-distribution', protect, adminOnly, async (req, res) => {
  try {
    const { period = 'all', year, month, day, status, startDate, endDate } = req.query;

    const match = {};

    // Date filtering
    if (period !== 'all') {
      const now = new Date();
      let start = new Date();
      let end = new Date();

      if (period === 'today') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else if (period === 'yesterday') {
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
      } else if (period === 'thisWeek') {
        const dayOfWeek = now.getDay();
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() + (6 - dayOfWeek));
        end.setHours(23, 59, 59, 999);
      } else if (period === 'thisMonth') {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
      } else if (period === 'lastMonth') {
        start.setMonth(now.getMonth() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth());
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
      } else if (period === 'custom') {
        // Handle custom date range
        if (startDate && endDate) {
          console.log('Custom date range:', { startDate, endDate });
          // Parse YYYY-MM-DD format and create dates in local timezone
          const startParts = startDate.split('-');
          const endParts = endDate.split('-');
          
          if (startParts.length === 3 && endParts.length === 3) {
            start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]), 0, 0, 0, 0);
            end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]), 23, 59, 59, 999);
            console.log('Parsed dates:', { start, end });
          } else {
            start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
          }
        } else if (year && month) {
          // Fallback to existing year/month logic
          const y = parseInt(year);
          const m = parseInt(month) - 1;
          start = new Date(y, m, 1);
          end = new Date(y, m + 1, 0);
          end.setHours(23, 59, 59, 999);

          if (day) {
            const d = parseInt(day);
            start.setDate(d);
            end.setDate(d);
          }
        }
      }

      match.createdAt = { $gte: start, $lte: end };
    }

    // Status filtering
    if (status && status !== 'all') {
      match.orderStatus = status;
    }

    const statusDistribution = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    const distribution = {};
    statusDistribution.forEach(item => {
      distribution[item.status] = item.count;
    });

    const totalOrders = statusDistribution.reduce((sum, item) => sum + item.count, 0);

    return sendSuccess(res, 'Order status distribution retrieved successfully', {
      total: totalOrders,
      distribution,
      breakdown: statusDistribution,
      filters: { period, year, month, day, status, startDate, endDate }
    });

  } catch (error) {
    console.error('Get order status distribution error:', error);
    return sendServerError(res, 'Server error');
  }
});

router.get('/export', protect, adminOnly, async (req, res) => {
  try {
    const ExcelJS = require('exceljs');

    // Fetch all users with populated addresses, country, currency
    const users = await User.find()
      .populate('defaultAddress', 'address city state postalCode')
      .populate('country', 'name')
      .populate('currency', 'code')
      .sort({ createdAt: -1 });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Role', key: 'role', width: 12 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Country', key: 'country', width: 15 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Redeem Points', key: 'redeemPoints', width: 14 },
      { header: 'Default Address', key: 'address', width: 40 },
      { header: 'Member Since', key: 'createdAt', width: 20 }
    ];

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add rows
    users.forEach(user => {
      const address = user.defaultAddress
        ? `${user.defaultAddress.address}, ${user.defaultAddress.city}, ${user.defaultAddress.state} ${user.defaultAddress.postalCode}`
        : '—';

      worksheet.addRow({
        name: user.name,
        email: user.email || '—',
        phone: user.phone,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        status: user.isActive ? 'Active' : 'Inactive',
        country: user.country?.name || '—',
        currency: user.currency?.code || '—',
        redeemPoints: user.redeemPoints || 0,
        address: address,
        createdAt: new Date(user.createdAt).toLocaleString('en-IN')
      });
    });

    // Set filename
    const filename = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export users error:', error);
    return sendServerError(res, 'Failed to export users');
  }
});

module.exports = router;
