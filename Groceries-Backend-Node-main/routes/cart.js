const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, customerOnly } = require('../middleware/auth');
const { sendSuccess, sendError, sendValidationError, sendServerError } = require('../utils/response');

const router = express.Router();

// @desc    Get user's cart
// @route   POST /api/cart
// @access  Private (Customer only)
router.post('/', protect, customerOnly, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price images stock isActive')
      .populate('currency');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id });
    }

    // Filter out inactive or out of stock products
    cart.items = cart.items.filter(item => 
      item.product && 
      item.product.isActive && 
      item.product.stock >= item.quantity
    );

    // Recalculate totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    await cart.save();

    return sendSuccess(res, 'Cart retrieved successfully', cart);
  } catch (error) {
    console.error('Get cart error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private (Customer only)
router.post('/add', protect, customerOnly, [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { productId, quantity, price, selectedColor = '', selectedSize = '' } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return sendError(res, 404, 'Product not found or not available');
    }

    // Check stock availability
    if (product.stock < quantity) {
      return sendError(res, 400, `Only ${product.stock} items available in stock`);
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId &&
      item.selectedColor === selectedColor &&
      item.selectedSize === selectedSize
    );

    if (existingItemIndex > -1) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return sendError(res, 400, `Only ${product.stock} items available in stock`);
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price,
        selectedColor,
        selectedSize
      });
    }

    await cart.save();

    return sendSuccess(res, 'Item added to cart successfully', cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Update cart item quantity
// @route   POST /api/cart/update
// @access  Private (Customer only)
router.post('/update', protect, customerOnly, [
  body('itemId').isMongoId().withMessage('Valid item ID is required'),
  body('quantity').isInt({ min: 0, max: 99 }).withMessage('Quantity must be between 0 and 99')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { itemId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return sendError(res, 404, 'Cart not found');
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return sendError(res, 404, 'Item not found in cart');
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock availability
      const product = await Product.findById(cart.items[itemIndex].product);
      if (product && product.stock < quantity) {
        return sendError(res, 400, `Only ${product.stock} items available in stock`);
      }
      
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    return sendSuccess(res, 'Cart updated successfully', cart);
  } catch (error) {
    console.error('Update cart error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Remove item from cart
// @route   POST /api/cart/remove
// @access  Private (Customer only)
router.post('/remove', protect, customerOnly, async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return sendError(res, 400, 'Item ID is required');
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return sendError(res, 404, 'Cart not found');
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return sendError(res, 404, 'Item not found in cart');
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    return sendSuccess(res, 'Item removed from cart successfully', cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Clear cart
// @route   POST /api/cart/clear
// @access  Private (Customer only)
router.post('/clear', protect, customerOnly, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return sendError(res, 404, 'Cart not found');
    }

    cart.clearCart();
    await cart.save();

    return sendSuccess(res, 'Cart cleared successfully', cart);
  } catch (error) {
    console.error('Clear cart error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get cart count
// @route   POST /api/cart/count
// @access  Private (Customer only)
router.post('/count', protect, customerOnly, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return sendSuccess(res, 'Cart count retrieved successfully', { count: 0 });
    }

    return sendSuccess(res, 'Cart count retrieved successfully', { count: cart.totalItems });
  } catch (error) {
    console.error('Get cart count error:', error);
    return sendServerError(res, 'Server error');
  }
});

module.exports = router;
