const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    default: ""
  },
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
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    selectedColor: {
      type: String,
      default: ''
    },
    selectedSize: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ""
    }
  }],
  shippingAddress: {
    name: {
      type: String,
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    city: {
      type: String,
      default: ""
    },
    state: {
      type: String,
      default: ""
    },
    country: {
      type: String,
      default: ""
    },
    postalCode: {
      type: String,
      default: ""
    }
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['cash', 'online'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentReference: {
      type: String,
      default: ''
    },
    paidAt: {
      type: Date
    }
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  shippingInfo: {
    trackingNumber: {
      type: String,
      default: ''
    },
    carrier: {
      type: String,
      default: ''
    },
    estimatedDelivery: {
      type: Date
    },
    shippedAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    }
  },
  pricing: {
    itemsPrice: {
      type: Number,
      required: true
    },
    shippingPrice: {
      type: Number,
      default: 0
    },
    taxPrice: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isReorder: {
    type: Boolean,
    default: false
  },
  originalOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
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

// Generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD${timestamp}${random}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Update order status
orderSchema.methods.updateStatus = function(status) {
  this.orderStatus = status;
  this.updatedAt = Date.now();
  
  if (status === 'shipped') {
    this.shippingInfo.shippedAt = Date.now();
  } else if (status === 'delivered') {
    this.shippingInfo.deliveredAt = Date.now();
  }
};

// Update payment status
orderSchema.methods.updatePaymentStatus = function(status, paymentReference = '') {
  this.paymentInfo.status = status;
  this.updatedAt = Date.now();
  
  if (status === 'paid') {
    this.paymentInfo.paidAt = Date.now();
    if (paymentReference) {
      this.paymentInfo.paymentReference = paymentReference;
    }
  }
};

module.exports = mongoose.model('Order', orderSchema);
