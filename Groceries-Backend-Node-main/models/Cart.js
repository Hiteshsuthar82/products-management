const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [99, 'Maximum quantity per item is 99']
    },
    price: {
      type: Number,
      required: true
    },
    selectedColor: {
      type: String,
      default: ''
    },
    selectedSize: {
      type: String,
      default: ''
    }
  }],
  totalItems: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  currency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Currency'
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

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.updatedAt = Date.now();
  next();
});

// Add item to cart
cartSchema.methods.addItem = function(productId, quantity, price, selectedColor = '', selectedSize = '') {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() && 
    item.selectedColor === selectedColor && 
    item.selectedSize === selectedSize
  );

  if (existingItemIndex > -1) {
    this.items[existingItemIndex].quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity,
      price,
      selectedColor,
      selectedSize
    });
  }
};

// Remove item from cart
cartSchema.methods.removeItem = function(productId, selectedColor = '', selectedSize = '') {
  this.items = this.items.filter(item => 
    !(item.product.toString() === productId.toString() && 
      item.selectedColor === selectedColor && 
      item.selectedSize === selectedSize)
  );
};

// Update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity, selectedColor = '', selectedSize = '') {
  const item = this.items.find(item => 
    item.product.toString() === productId.toString() && 
    item.selectedColor === selectedColor && 
    item.selectedSize === selectedSize
  );

  if (item) {
    if (quantity <= 0) {
      this.removeItem(productId, selectedColor, selectedSize);
    } else {
      item.quantity = quantity;
    }
  }
};

// Clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.totalItems = 0;
  this.totalAmount = 0;
};

module.exports = mongoose.model('Cart', cartSchema);
