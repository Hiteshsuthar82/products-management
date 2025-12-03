const express = require('express');
const { body, validationResult } = require('express-validator');
const Address = require('../models/Address');
const { protect, customerOnly } = require('../middleware/auth');
const { sendSuccess, sendError, sendValidationError, sendServerError } = require('../utils/response');

const router = express.Router();

// @desc    Get user's addresses
// @route   POST /api/address
// @access  Private (Customer only)
router.post('/', protect, customerOnly, async (req, res) => {
  try {
    const addresses = await Address.find({ 
      user: req.user.id, 
      isActive: true 
    }).sort({ isDefault: -1, createdAt: -1 });

    return sendSuccess(res, 'Addresses retrieved successfully', {
      count: addresses.length,
      addresses
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get single address
// @route   POST /api/address/detail
// @access  Private (Customer only)
router.post('/detail', protect, customerOnly, async (req, res) => {
  try {
    const { addressId } = req.body;

    if (!addressId) {
      return sendError(res, 400, 'Address ID is required');
    }

    const address = await Address.findOne({
      _id: addressId,
      user: req.user.id,
      isActive: true
    });

    if (!address) {
      return sendError(res, 404, 'Address not found');
    }

    return sendSuccess(res, 'Address retrieved successfully', address);
  } catch (error) {
    console.error('Get address error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Add new address
// @route   POST /api/address/add
// @access  Private (Customer only)
router.post('/add', protect, customerOnly, [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  body('address').trim().isLength({ min: 10, max: 200 }).withMessage('Address must be between 10 and 200 characters'),
  body('city').trim().isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters'),
  body('state').trim().isLength({ min: 2, max: 50 }).withMessage('State must be between 2 and 50 characters'),
  body('postalCode').trim().isLength({ min: 3, max: 10 }).withMessage('Postal code must be between 3 and 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const {
      name,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
      landmark = '',
      addressType = 'home',
      isDefault = false
    } = req.body;

    const addressData = {
      user: req.user.id,
      name,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
      landmark,
      addressType,
      isDefault
    };

    const newAddress = await Address.create(addressData);

    return sendSuccess(res, 'Address added successfully', newAddress);
  } catch (error) {
    console.error('Add address error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Update address
// @route   POST /api/address/update
// @access  Private (Customer only)
router.post('/update', protect, customerOnly, [
  body('addressId').isMongoId().withMessage('Valid address ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { addressId } = req.body;

    const address = await Address.findOne({
      _id: addressId,
      user: req.user.id,
      isActive: true
    });

    if (!address) {
      return sendError(res, 404, 'Address not found');
    }

    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      postalCode: req.body.postalCode,
      landmark: req.body.landmark,
      addressType: req.body.addressType,
      isDefault: req.body.isDefault
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    return sendSuccess(res, 'Address updated successfully', updatedAddress);
  } catch (error) {
    console.error('Update address error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Delete address
// @route   POST /api/address/delete
// @access  Private (Customer only)
router.post('/delete', protect, customerOnly, async (req, res) => {
  try {
    const { addressId } = req.body;

    if (!addressId) {
      return sendError(res, 400, 'Address ID is required');
    }

    const address = await Address.findOne({
      _id: addressId,
      user: req.user.id,
      isActive: true
    });

    if (!address) {
      return sendError(res, 404, 'Address not found');
    }

    // Soft delete
    address.isActive = false;
    await address.save();

    return sendSuccess(res, 'Address deleted successfully');
  } catch (error) {
    console.error('Delete address error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Set default address
// @route   POST /api/address/default
// @access  Private (Customer only)
router.post('/default', protect, customerOnly, async (req, res) => {
  try {
    const { addressId } = req.body;

    if (!addressId) {
      return sendError(res, 400, 'Address ID is required');
    }

    const address = await Address.findOne({
      _id: addressId,
      user: req.user.id,
      isActive: true
    });

    if (!address) {
      return sendError(res, 404, 'Address not found');
    }

    await address.setAsDefault();

    return sendSuccess(res, 'Default address updated successfully', address);
  } catch (error) {
    console.error('Set default address error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get default address
// @route   POST /api/address/default/get
// @access  Private (Customer only)
router.post('/default/get', protect, customerOnly, async (req, res) => {
  try {
    const address = await Address.findOne({
      user: req.user.id,
      isDefault: true,
      isActive: true
    });

    if (!address) {
      return sendError(res, 404, 'No default address found');
    }

    return sendSuccess(res, 'Default address retrieved successfully', address);
  } catch (error) {
    console.error('Get default address error:', error);
    return sendServerError(res, 'Server error');
  }
});

module.exports = router;
