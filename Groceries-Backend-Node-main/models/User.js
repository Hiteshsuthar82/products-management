const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    default: "",
  },
  password: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+[1-9]\d{1,14}$/, 'Please enter a valid phone number with country code']
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
    default: ''
  },
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  }],
  defaultAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country'
  },
  currency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Currency'
  },
  redeemPoints: {
    type: Number,
    default: 0,
    min: [0, 'Redeem points cannot be negative']
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
