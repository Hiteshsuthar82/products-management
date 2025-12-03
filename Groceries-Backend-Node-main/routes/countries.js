const express = require('express');
const Country = require('../models/Country');
const Currency = require('../models/Currency');
const { protect, adminOnly } = require('../middleware/auth');
const { sendSuccess, sendError, sendServerError } = require('../utils/response');

const router = express.Router();

// @desc    Get all countries
// @route   POST /api/countries
// @access  Public
router.post('/', async (req, res) => {
  try {
    const countries = await Country.find({ isActive: true })
      .populate('currency')
      .sort({ name: 1 });

    return sendSuccess(res, 'Countries retrieved successfully', {
      count: countries.length,
      countries
    });
  } catch (error) {
    console.error('Get countries error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get single country
// @route   POST /api/countries/detail
// @access  Public
router.post('/detail', async (req, res) => {
  try {
    const { countryId } = req.body;

    if (!countryId) {
      return sendError(res, 400, 'Country ID is required');
    }

    const country = await Country.findById(countryId)
      .populate('currency');

    if (!country || !country.isActive) {
      return sendError(res, 404, 'Country not found');
    }

    return sendSuccess(res, 'Country retrieved successfully', country);
  } catch (error) {
    console.error('Get country error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get all currencies
// @route   POST /api/countries/currencies
// @access  Public
router.post('/currencies', async (req, res) => {
  try {
    const currencies = await Currency.find({ isActive: true })
      .sort({ name: 1 });

    return sendSuccess(res, 'Currencies retrieved successfully', {
      count: currencies.length,
      currencies
    });
  } catch (error) {
    console.error('Get currencies error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get single currency
// @route   POST /api/countries/currencies/detail
// @access  Public
router.post('/currencies/detail', async (req, res) => {
  try {
    const { currencyId } = req.body;

    if (!currencyId) {
      return sendError(res, 400, 'Currency ID is required');
    }

    const currency = await Currency.findById(currencyId);

    if (!currency || !currency.isActive) {
      return sendError(res, 404, 'Currency not found');
    }

    return sendSuccess(res, 'Currency retrieved successfully', currency);
  } catch (error) {
    console.error('Get currency error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get default currency
// @route   POST /api/countries/currencies/default
// @access  Public
router.post('/currencies/default', async (req, res) => {
  try {
    const currency = await Currency.findOne({ 
      isActive: true, 
      isDefault: true 
    });

    if (!currency) {
      return sendError(res, 404, 'Default currency not found');
    }

    return sendSuccess(res, 'Default currency retrieved successfully', currency);
  } catch (error) {
    console.error('Get default currency error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Add new country (Admin only)
// @route   POST /api/countries/add
// @access  Private (Admin only)
router.post('/add', protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      code,
      phoneCode,
      currency,
      taxRate = 0,
      shippingZones = []
    } = req.body;

    // Validate required fields
    if (!name || !code || !phoneCode || !currency) {
      return sendError(res, 400, 'Name, code, phone code, and currency are required');
    }

    // Check if currency exists
    const currencyExists = await Currency.findById(currency);
    if (!currencyExists) {
      return sendError(res, 400, 'Invalid currency');
    }

    // Check if country already exists
    const existingCountry = await Country.findOne({
      $or: [{ name }, { code }]
    });

    if (existingCountry) {
      return sendError(res, 400, 'Country with this name or code already exists');
    }

    const country = await Country.create({
      name,
      code,
      phoneCode,
      currency,
      taxRate,
      shippingZones
    });

    const populatedCountry = await Country.findById(country._id)
      .populate('currency');

    return sendSuccess(res, 'Country added successfully', populatedCountry);
  } catch (error) {
    console.error('Add country error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Add new currency (Admin only)
// @route   POST /api/countries/currencies/add
// @access  Private (Admin only)
router.post('/currencies/add', protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      code,
      symbol,
      exchangeRate,
      baseCurrency = 'INR',
      decimalPlaces = 2,
      isDefault = false
    } = req.body;

    // Validate required fields
    if (!name || !code || !symbol || !exchangeRate) {
      return sendError(res, 400, 'Name, code, symbol, and exchange rate are required');
    }

    // Check if currency already exists
    const existingCurrency = await Currency.findOne({
      $or: [{ name }, { code }]
    });

    if (existingCurrency) {
      return sendError(res, 400, 'Currency with this name or code already exists');
    }

    const currency = await Currency.create({
      name,
      code,
      symbol,
      exchangeRate,
      baseCurrency,
      decimalPlaces,
      isDefault
    });

    return sendSuccess(res, 'Currency added successfully', currency);
  } catch (error) {
    console.error('Add currency error:', error);
    return sendServerError(res, 'Server error');
  }
});

module.exports = router;
