const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Currency name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Currency name cannot exceed 50 characters']
  },
  code: {
    type: String,
    required: [true, 'Currency code is required'],
    unique: true,
    uppercase: true,
    length: [3, 'Currency code must be exactly 3 characters']
  },
  symbol: {
    type: String,
    required: [true, 'Currency symbol is required'],
    maxlength: [5, 'Currency symbol cannot exceed 5 characters']
  },
  exchangeRate: {
    type: Number,
    required: [true, 'Exchange rate is required'],
    min: [0, 'Exchange rate cannot be negative']
  },
  baseCurrency: {
    type: String,
    default: 'INR',
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  decimalPlaces: {
    type: Number,
    default: 2,
    min: 0,
    max: 4
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
currencySchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

// Ensure only one default currency
currencySchema.pre('save', async function() {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
});

// Format amount with currency symbol
currencySchema.methods.formatAmount = function(amount) {
  const formattedAmount = parseFloat(amount).toFixed(this.decimalPlaces);
  return `${this.symbol}${formattedAmount}`;
};

// Convert amount to base currency
currencySchema.methods.convertToBase = function(amount) {
  return amount * this.exchangeRate;
};

// Convert amount from base currency
currencySchema.methods.convertFromBase = function(amount) {
  return amount / this.exchangeRate;
};

module.exports = mongoose.model('Currency', currencySchema);
