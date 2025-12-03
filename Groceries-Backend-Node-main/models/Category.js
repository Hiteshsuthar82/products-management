const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    // Will be auto-generated from name if not provided
    lowercase: true,
    trim: true
  },
  icon: {
    type: String,
    default: ''
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  productCount: {
    type: Number,
    default: 0
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

// Create compound index for unique category names within same parent
categorySchema.index({ name: 1, parentId: 1 }, { unique: true });
categorySchema.index({ slug: 1, parentId: 1 }, { unique: true });

// Ensure slug and code exist before validation and update timestamp
categorySchema.pre('validate', async function() {
  this.updatedAt = Date.now();
  
  // Generate slug from name if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Generate code if not provided
  if (!this.code) {
    const prefix = this.parentId ? 'SUB' : 'CAT';
    this.code = `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }
});

// Update product count when products are added/removed
categorySchema.methods.updateProductCount = async function() {
  const Product = require('./Product');
  const count = await Product.countDocuments({ 
    category: this._id, 
    isActive: true 
  });
  this.productCount = count;
  await this.save();
};

// Get all subcategories (children) for this category
categorySchema.methods.getSubcategories = async function() {
  return await this.constructor.find({ 
    parentId: this._id, 
    isActive: true 
  }).sort({ name: 1 });
};

// Get parent category
categorySchema.methods.getParent = async function() {
  if (!this.parentId) return null;
  return await this.constructor.findById(this.parentId);
};

// Check if this is a parent category (has children)
categorySchema.methods.isParent = async function() {
  const childrenCount = await this.constructor.countDocuments({ 
    parentId: this._id, 
    isActive: true 
  });
  return childrenCount > 0;
};

// Get category level (0 for parent, 1 for child)
categorySchema.methods.getLevel = function() {
  return this.parentId ? 1 : 0;
};

module.exports = mongoose.model('Category', categorySchema);
