const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect, customerOnly } = require('../middleware/auth');
const { sendSuccess, sendError, sendValidationError, sendServerError } = require('../utils/response');

const router = express.Router();

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private (Customer only)
router.get('/', protect, customerOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'favorites',
        select: 'name price originalPrice images stock isActive isOutOfStock ratings brand category',
        populate: {
          path: 'category',
          select: 'name'
        }
      });

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Filter out inactive products
    const activeFavorites = user.favorites.filter(product => product.isActive);

    return sendSuccess(res, 'Favorites retrieved successfully', {
      favorites: activeFavorites,
      count: activeFavorites.length
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Add product to favorites
// @route   POST /api/favorites/add
// @access  Private (Customer only)
router.post('/add', protect, customerOnly, [
  body('productId').isMongoId().withMessage('Valid product ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { productId } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return sendError(res, 404, 'Product not found or not available');
    }

    // Get user with favorites
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Check if product is already in favorites
    if (user.favorites.includes(productId)) {
      return sendError(res, 400, 'Product is already in favorites');
    }

    // Add product to favorites
    user.favorites.push(productId);
    await user.save();

    return sendSuccess(res, 'Product added to favorites successfully', {
      productId,
      favoritesCount: user.favorites.length
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Remove product from favorites
// @route   POST /api/favorites/remove
// @access  Private (Customer only)
router.post('/remove', protect, customerOnly, [
  body('productId').isMongoId().withMessage('Valid product ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { productId } = req.body;

    // Get user with favorites
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Check if product is in favorites
    const favoriteIndex = user.favorites.indexOf(productId);
    if (favoriteIndex === -1) {
      return sendError(res, 404, 'Product not found in favorites');
    }

    // Remove product from favorites
    user.favorites.splice(favoriteIndex, 1);
    await user.save();

    return sendSuccess(res, 'Product removed from favorites successfully', {
      productId,
      favoritesCount: user.favorites.length
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Toggle product in favorites (add if not present, remove if present)
// @route   POST /api/favorites/toggle
// @access  Private (Customer only)
router.post('/toggle', protect, customerOnly, [
  body('productId').isMongoId().withMessage('Valid product ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { productId } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return sendError(res, 404, 'Product not found or not available');
    }

    // Get user with favorites
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const favoriteIndex = user.favorites.indexOf(productId);
    let action = '';

    if (favoriteIndex === -1) {
      // Add to favorites
      user.favorites.push(productId);
      action = 'added';
    } else {
      // Remove from favorites
      user.favorites.splice(favoriteIndex, 1);
      action = 'removed';
    }

    await user.save();

    return sendSuccess(res, `Product ${action} to favorites successfully`, {
      productId,
      isFavorite: action === 'added',
      favoritesCount: user.favorites.length
    });
  } catch (error) {
    console.error('Toggle favorites error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Check if product is in favorites
// @route   POST /api/favorites/check
// @access  Private (Customer only)
router.post('/check', protect, customerOnly, [
  body('productId').isMongoId().withMessage('Valid product ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { productId } = req.body;

    // Get user with favorites
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const isFavorite = user.favorites.includes(productId);

    return sendSuccess(res, 'Favorite status checked successfully', {
      productId,
      isFavorite,
      favoritesCount: user.favorites.length
    });
  } catch (error) {
    console.error('Check favorites error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Clear all favorites
// @route   POST /api/favorites/clear
// @access  Private (Customer only)
router.post('/clear', protect, customerOnly, async (req, res) => {
  try {
    // Get user with favorites
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const favoritesCount = user.favorites.length;
    user.favorites = [];
    await user.save();

    return sendSuccess(res, 'All favorites cleared successfully', {
      favoritesCount,
      clearedCount: favoritesCount
    });
  } catch (error) {
    console.error('Clear favorites error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get favorites count
// @route   GET /api/favorites/count
// @access  Private (Customer only)
router.get('/count', protect, customerOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 'Favorites count retrieved successfully', {
      count: user.favorites.length
    });
  } catch (error) {
    console.error('Get favorites count error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Check multiple products favorite status
// @route   POST /api/favorites/bulk-check
// @access  Private (Customer only)
router.post('/bulk-check', protect, customerOnly, [
  body('productIds').isArray().withMessage('Product IDs array is required'),
  body('productIds.*').isMongoId().withMessage('Valid product ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { productIds } = req.body;

    // Get user with favorites
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Create a map of favorite status for each product
    const favoriteStatus = {};
    productIds.forEach(productId => {
      favoriteStatus[productId] = user.favorites.includes(productId);
    });

    return sendSuccess(res, 'Bulk favorite status checked successfully', {
      favoriteStatus,
      favoritesCount: user.favorites.length
    });
  } catch (error) {
    console.error('Bulk check favorites error:', error);
    return sendServerError(res, 'Server error');
  }
});

module.exports = router;
