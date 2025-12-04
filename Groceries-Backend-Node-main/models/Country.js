const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Country name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Country code is required'],
    unique: true,
    uppercase: true,
    length: [2, 'Country code must be exactly 2 characters']
  },
  phoneCode: {
    type: String,
    required: [true, 'Phone code is required'],
    trim: true,
    maxlength: [5, 'Phone code cannot exceed 5 characters']
  },
  currency: {
    name: {
      type: String,
      required: [true, 'Currency name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Currency code is required'],
      uppercase: true,
      length: [3, 'Currency code must be exactly 3 characters']
    },
    symbol: {
      type: String,
      required: [true, 'Currency symbol is required'],
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  shippingZones: [{
    name: {
      type: String,
      default: ""
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0
    },
    estimatedDays: {
      type: Number,
      required: true,
      default: 1
    }
  }],
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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
countrySchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Country', countrySchema);
