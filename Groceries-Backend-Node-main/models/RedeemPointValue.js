const mongoose = require('mongoose');

const redeemPointValueSchema = new mongoose.Schema({
  pointValue: {
    type: Number,
    required: [true, 'Point value is required'],
    min: [0.01, 'Point value must be greater than 0']
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
redeemPointValueSchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('RedeemPointValue', redeemPointValueSchema);
