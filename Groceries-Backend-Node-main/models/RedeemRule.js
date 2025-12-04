const mongoose = require('mongoose');

const redeemRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Rule name is required'],
    trim: true,
    maxlength: [100, 'Rule name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  minOrderValue: {
    type: Number,
    required: [true, 'Minimum order value is required'],
    min: [0, 'Minimum order value cannot be negative']
  },
  redeemPoints: {
    type: Number,
    required: [true, 'Redeem points is required'],
    min: [1, 'Redeem points must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
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

// Update the updatedAt field before saving
redeemRuleSchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('RedeemRule', redeemRuleSchema);
