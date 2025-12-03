const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, customerOnly, adminOnly } = require('../middleware/auth');
const { sendSuccess, sendError, sendServerError } = require('../utils/response');
const User = require('../models/User');

const router = express.Router();

// @desc    Get all products
// @route   POST /api/products
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, brand, minPrice, maxPrice, filters, search, sortBy, userId } = req.body;
    
    console.log('User ID from body:', userId);
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };

    // console.log('Category filter:', category);
    // console.log(req.body.subcategory);

    if (category) {
      // Check if category is ObjectId or string
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
        let ids = [];
        // Find category by slug
        const categoryDoc = await Category.findOne({ _id: category, isActive: true });

        if (req.body.subcategory == null) {
          ids = await Category.find({ parentId: categoryDoc._id }).select('_id').lean();
          ids = ids.map(c => c._id);
        } else {
          let one = await Category.findById(req.body.subcategory).select('_id');
          if (one != null) { ids.push(one._id); }
        }

        if (categoryDoc) {
          ids.push(categoryDoc._id);
          filter.category = { $in: ids };
        } else {
          return sendError(res, 404, 'Category not found');
        }
      } else {
        let ids = [];
        // Find category by slug
        const categoryDoc = await Category.findOne({ slug: category, isActive: true });

        if (req.body.subcategory == null) {
          ids = await Category.find({ parentId: categoryDoc._id }).select('_id').lean();
          ids = ids.map(c => c._id);
        } else {
          let one = await Category.findById(req.body.subcategory).select('_id');
          if (one != null) { ids.push(one._id); }
        }

        if (categoryDoc) {
          ids.push(categoryDoc._id);
          filter.category = { $in: ids };
        } else {
          return sendError(res, 404, 'Category not found');
        }
      }
    }

    if (brand) filter.brand = brand;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Filter object:', filter);

    // Build sort object
    let sortObj = { createdAt: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'price_asc': sortObj = { price: 1 }; break;
        case 'price_desc': sortObj = { price: -1 }; break;
        case 'name_asc': sortObj = { name: 1 }; break;
        case 'name_desc': sortObj = { name: -1 }; break;
        case 'rating': sortObj = { 'ratings.average': -1 }; break;
        case 'newest': sortObj = { createdAt: -1 }; break;
        case 'oldest': sortObj = { createdAt: 1 }; break;
      }
    }

    if (Array.isArray(filters) && filters.length > 0) {
      if (filters.length == 1) {
        if (filters.includes('out_of_stock')) {
          filter.stock = 0;
        }
        if (filters.includes('in_stock')) {
          filter.stock = { $gt: 0 };
        }
      }
    }
  
    let favoriteProductIds = [];
    if (userId) {
      const user = await User.findById(userId).select('favorites').lean();
      if (user && user.favorites) {
        favoriteProductIds = user.favorites.map(id => id.toString());
      }
    }
    console.log('User Favorite Product IDs:', favoriteProductIds);

    const products = await Product.find(filter)
      .populate('category', 'name slug icon parentId')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select('-reviews')
      .lean(); 

    const total = await Product.countDocuments(filter);

    const productsWithFavorite = products.map(product => {
      const productIdStr = product._id.toString();
      return {
        ...product,
        isFavorite: favoriteProductIds.includes(productIdStr)
      };
    });
    console.log('Products with favorite info:', productsWithFavorite);

    const responseData = {
      count: productsWithFavorite.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products: productsWithFavorite
    };

    return sendSuccess(res, 'Products retrieved successfully', responseData);
  } catch (error) {
    console.error('Get products error:', error);
    return sendServerError(res, 'Server error');
  }
});

// Helper – returns array of product objects with isFavorite added
const attachIsFavorite = async (products, userId) => {
  const favoriteIds = userId
    ? (await User.findById(userId).select('favorites').lean())?.favorites?.map(id => id.toString()) ?? []
    : [];

  return products.map(p => ({
    ...p,
    isFavorite: favoriteIds.includes(p._id.toString())
  }));
};

// @desc    Get single product
// @route   POST /api/products/detail
router.post('/detail', async (req, res) => {
  try {
    const { productId, userId } = req.body;   // <-- userId added

    if (!productId) return sendError(res, 400, 'Product ID is required');

    const product = await Product.findById(productId)
      .populate('category', 'name slug icon parentId')
      .lean();

    if (!product) return sendError(res, 404, 'Product not found');
    if (!product.isActive) return sendError(res, 404, 'Product not available');

    const productWithFav = await attachIsFavorite([product], userId);
    return sendSuccess(res, 'Product retrieved successfully', productWithFav[0]);
  } catch (error) {
    console.error('Get product error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get featured products
// @route   POST /api/products/featured
router.post('/featured', async (req, res) => {
  try {
    const { limit = 8, userId } = req.body;   // <-- userId added

    const products = await Product.find({ isActive: true, featured: true })
      .populate('category', 'name slug icon parentId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-reviews')
      .lean();

    const productsWithFav = await attachIsFavorite(products, userId);

    return sendSuccess(res, 'Featured products retrieved successfully', {
      count: productsWithFav.length,
      products: productsWithFav
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get new products (mobile specific)
// @route   POST /api/products/new
router.post('/new', async (req, res) => {
  try {
    const { limit = 10, userId } = req.body;   // <-- userId added

    const products = await Product.find({ isActive: true })
      .populate('category', 'name slug icon parentId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-reviews')
      .lean();

    const productsWithFav = await attachIsFavorite(products, userId);

    return sendSuccess(res, 'New products retrieved successfully', {
      count: productsWithFav.length,
      products: productsWithFav
    });
  } catch (error) {
    console.error('Get new products error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Search products (mobile specific)
// @route   POST /api/products/search
router.post('/search', async (req, res) => {
  try {
    const { query, page = 1, limit = 20, userId } = req.body;   // <-- userId added

    if (!query || query.trim().length < 2) {
      return sendError(res, 400, 'Search query must be at least 2 characters');
    }

    const skip = (page - 1) * limit;

    const filter = {
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ]
    };

    const products = await Product.find(filter)
      .populate('category', 'name slug icon parentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-reviews')
      .lean();

    const total = await Product.countDocuments(filter);
    const productsWithFav = await attachIsFavorite(products, userId);

    return sendSuccess(res, 'Search results retrieved successfully', {
      query,
      count: productsWithFav.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products: productsWithFav
    });
  } catch (error) {
    console.error('Search products error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get products by category
// @route   POST /api/products/category
router.post('/category', async (req, res) => {
  try {
    const { category, subcategory, page = 1, limit = 10, userId } = req.body;   // <-- userId added

    if (!category) return sendError(res, 400, 'Category is required');

    const skip = (page - 1) * limit;

    // ---------- FIND CATEGORY ----------
    let categoryDoc;
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      categoryDoc = await Category.findById(category).lean();
    } else {
      categoryDoc = await Category.findOne({ slug: category, isActive: true }).lean();
    }
    if (!categoryDoc) return sendError(res, 404, 'Category not found');

    const filter = { category: categoryDoc._id, isActive: true };

    // ---------- SUBCATEGORY ----------
    let subcategoryDoc = null;
    if (subcategory) {
      if (subcategory.match(/^[0-9a-fA-F]{24}$/)) {
        subcategoryDoc = await Category.findById(subcategory).lean();
      } else {
        subcategoryDoc = await Category.findOne({
          slug: subcategory,
          parentId: categoryDoc._id,
          isActive: true
        }).lean();
      }
      if (!subcategoryDoc) return sendError(res, 404, 'Subcategory not found');
      filter.category = subcategoryDoc._id;
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug icon parentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-reviews')
      .lean();

    const total = await Product.countDocuments(filter);
    const productsWithFav = await attachIsFavorite(products, userId);

    return sendSuccess(res, 'Products retrieved successfully', {
      category: {
        id: categoryDoc._id,
        name: categoryDoc.name,
        slug: categoryDoc.slug
      },
      subcategory: subcategoryDoc
        ? { id: subcategoryDoc._id, name: subcategoryDoc.name, slug: subcategoryDoc.slug }
        : null,
      count: productsWithFav.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products: productsWithFav
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    return sendServerError(res, 'Server error');
  }
});

// // @desc    Get single product
// // @route   POST /api/products/detail
// // @access  Public
// router.post('/detail', async (req, res) => {
//   try {
//     const { productId } = req.body;

//     if (!productId) {
//       return sendError(res, 400, 'Product ID is required');
//     }

//     const product = await Product.findById(productId)
//       .populate('category', 'name slug icon parentId');

//     if (!product) {
//       return sendError(res, 404, 'Product not found');
//     }

//     if (!product.isActive) {
//       return sendError(res, 404, 'Product not available');
//     }

//     return sendSuccess(res, 'Product retrieved successfully', product);
//   } catch (error) {
//     console.error('Get product error:', error);
//     return sendServerError(res, 'Server error');
//   }
// });

// // @desc    Get featured products
// // @route   POST /api/products/featured
// // @access  Public
// router.post('/featured', async (req, res) => {
//   try {
//     const { limit = 8 } = req.body;

//     const products = await Product.find({
//       isActive: true,
//       featured: true
//     })
//       .populate('category', 'name slug icon parentId')
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .select('-reviews');

//     return sendSuccess(res, 'Featured products retrieved successfully', {
//       count: products.length,
//       products
//     });
//   } catch (error) {
//     console.error('Get featured products error:', error);
//     return sendServerError(res, 'Server error');
//   }
// });

// // @desc    Get new products (mobile specific)
// // @route   POST /api/products/new
// // @access  Public
// router.post('/new', async (req, res) => {
//   try {
//     const { limit = 10 } = req.body;

//     const products = await Product.find({
//       isActive: true
//     })
//       .populate('category', 'name slug icon parentId')
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .select('-reviews');

//     return sendSuccess(res, 'New products retrieved successfully', {
//       count: products.length,
//       products
//     });
//   } catch (error) {
//     console.error('Get new products error:', error);
//     return sendServerError(res, 'Server error');
//   }
// });

// // @desc    Search products (mobile specific)
// // @route   POST /api/products/search
// // @access  Public
// router.post('/search', async (req, res) => {
//   try {
//     const { query, page = 1, limit = 20 } = req.body;

//     if (!query || query.trim().length < 2) {
//       return sendError(res, 400, 'Search query must be at least 2 characters');
//     }

//     const skip = (page - 1) * limit;

//     const products = await Product.find({
//       isActive: true,
//       $or: [
//         { name: { $regex: query, $options: 'i' } },
//         { description: { $regex: query, $options: 'i' } },
//         { brand: { $regex: query, $options: 'i' } }
//       ]
//     })
//       .populate('category', 'name slug icon parentId')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .select('-reviews');

//     const total = await Product.countDocuments({
//       isActive: true,
//       $or: [
//         { name: { $regex: query, $options: 'i' } },
//         { description: { $regex: query, $options: 'i' } },
//         { brand: { $regex: query, $options: 'i' } }
//       ]
//     });

//     return sendSuccess(res, 'Search results retrieved successfully', {
//       query,
//       count: products.length,
//       total,
//       page,
//       pages: Math.ceil(total / limit),
//       products
//     });
//   } catch (error) {
//     console.error('Search products error:', error);
//     return sendServerError(res, 'Server error');
//   }
// });

// // @desc    Get products by category
// // @route   POST /api/products/category
// // @access  Public
// router.post('/category', async (req, res) => {
//   try {
//     const { category, subcategory, page = 1, limit = 10 } = req.body;

//     if (!category) {
//       return sendError(res, 400, 'Category is required');
//     }

//     const skip = (page - 1) * limit;

//     // Find category
//     let categoryDoc;
//     if (category.match(/^[0-9a-fA-F]{24}$/)) {
//       categoryDoc = await Category.findById(category);
//     } else {
//       categoryDoc = await Category.findOne({ slug: category, isActive: true });
//     }

//     if (!categoryDoc) {
//       return sendError(res, 404, 'Category not found');
//     }

//     const filter = {
//       category: categoryDoc._id,
//       isActive: true
//     };

//     // Add subcategory filter if provided
//     if (subcategory) {
//       let subcategoryDoc;
//       if (subcategory.match(/^[0-9a-fA-F]{24}$/)) {
//         subcategoryDoc = await Category.findById(subcategory);
//       } else {
//         subcategoryDoc = await Category.findOne({ slug: subcategory, parentId: categoryDoc._id, isActive: true });
//       }

//       if (!subcategoryDoc) {
//         return sendError(res, 404, 'Subcategory not found');
//       }

//       filter.category = subcategoryDoc._id;
//     }

//     const products = await Product.find(filter)
//       .populate('category', 'name slug icon parentId')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .select('-reviews');

//     const total = await Product.countDocuments(filter);

//     return sendSuccess(res, 'Products retrieved successfully', {
//       category: {
//         id: categoryDoc._id,
//         name: categoryDoc.name,
//         slug: categoryDoc.slug
//       },
//       subcategory: subcategory ? {
//         id: subcategoryDoc._id,
//         name: subcategoryDoc.name,
//         slug: subcategoryDoc.slug
//       } : null,
//       count: products.length,
//       total,
//       page,
//       pages: Math.ceil(total / limit),
//       products
//     });
//   } catch (error) {
//     console.error('Get products by category error:', error);
//     return sendServerError(res, 'Server error');
//   }
// });

// // @desc    Get product categories
// // @route   POST /api/products/categories
// // @access  Public
// router.post('/categories', async (req, res) => {
//   try {
//     const { level = 0 } = req.body; // 0 for parent categories, 1 for subcategories

//     const filter = { isActive: true };
//     if (level === 0) {
//       filter.parentId = null; // Parent categories
//     } else if (level === 1) {
//       filter.parentId = { $ne: null }; // Subcategories
//     }

//     const categories = await Category.find(filter)
//       .populate('parentId', 'name slug')
//       .sort({ name: 1 })
//       .select('name slug icon parentId productCount');

//     return sendSuccess(res, 'Categories retrieved successfully', {
//       count: categories.length,
//       categories
//     });
//   } catch (error) {
//     console.error('Get categories error:', error);
//     return sendServerError(res, 'Server error');
//   }
// });

// @desc    Get product brands
// @route   POST /api/products/brands
// @access  Public
router.post('/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand', {
      isActive: true,
      brand: { $ne: null, $ne: '' }
    });

    return sendSuccess(res, 'Brands retrieved successfully', { brands });
  } catch (error) {
    console.error('Get brands error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Add product review
// @route   POST /api/products/review
// @access  Private (Customer only)
router.post('/review', protect, customerOnly, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return sendError(res, 400, 'Product ID and rating are required');
    }

    if (rating < 1 || rating > 5) {
      return sendError(res, 400, 'Rating must be between 1 and 5');
    }

    const product = await Product.findById(productId);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return sendError(res, 400, 'You have already reviewed this product');
    }

    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment: comment || ''
    };

    product.reviews.push(review);
    product.calculateAverageRating();
    await product.save();

    return sendSuccess(res, 'Review added successfully');
  } catch (error) {
    console.error('Add review error:', error);
    return sendServerError(res, 'Server error');
  }
});


router.get('/export', protect, adminOnly, async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    
    // Get all products with category information
    const products = await Product.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    // Define columns
    worksheet.columns = [
      { header: 'Product Name', key: 'name', width: 30 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Brand', key: 'brand', width: 20 },
      { header: 'Price (INR)', key: 'price', width: 15 },
      { header: 'Original Price (INR)', key: 'originalPrice', width: 18 },
      { header: 'Discount (%)', key: 'discount', width: 12 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Sold', key: 'sold', width: 10 },
      { header: 'Weight (kg)', key: 'weight', width: 12 },
      { header: 'Colors', key: 'colors', width: 20 },
      { header: 'Sizes', key: 'sizes', width: 20 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Reviews Count', key: 'reviewsCount', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Stock Status', key: 'stockStatus', width: 15 },
      { header: 'Featured', key: 'featured', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    products.forEach(product => {
      worksheet.addRow({
        name: product.name,
        description: product.description,
        category: product.category?.name || 'N/A',
        brand: product.brand || 'N/A',
        price: product.price,
        originalPrice: product.originalPrice || '',
        discount: product.discount || 0,
        stock: product.stock,
        sold: product.sold,
        weight: product.weight || '',
        colors: product.colors?.join(', ') || '',
        sizes: product.sizes?.join(', ') || '',
        rating: product.ratings?.average?.toFixed(1) || '0.0',
        reviewsCount: product.ratings?.count || 0,
        status: product.isActive ? 'Active' : 'Inactive',
        stockStatus: product.isOutOfStock ? 'Out of Stock' : 'In Stock',
        featured: product.featured ? 'Yes' : 'No',
        createdAt: product.createdAt?.toLocaleDateString('en-IN') || '',
        updatedAt: product.updatedAt?.toLocaleDateString('en-IN') || ''
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      if (column.header === 'Description') {
        column.width = 50;
      }
    });

    // Set response headers
    const filename = `products_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export products error:', error);
    return sendServerError(res, 'Failed to export products');
  }
});

// @desc    Import products from Excel
// @route   POST /api/products/import
// @access  Admin

// Configure multer for Excel files
const uploadExcel = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream' // for .xls files
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed!'), false);
    }
  }
}).single('file');

router.post('/import', protect, adminOnly, uploadExcel, async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded');
    }
    
    // Read Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1);
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    // Process rows starting from row 2 (skip header)
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      try {
        const productData = {
          name: row.getCell(1).value?.toString()?.trim(),
          description: row.getCell(2).value?.toString()?.trim() || '',
          brand: row.getCell(4).value?.toString()?.trim() || '',
          price: parseFloat(row.getCell(5).value) || 0,
          originalPrice: parseFloat(row.getCell(6).value) || parseFloat(row.getCell(5).value) || 0,
          discount: parseFloat(row.getCell(7).value) || 0,
          stock: parseInt(row.getCell(8).value) || 0,
          sold: parseInt(row.getCell(9).value) || 0,
          weight: row.getCell(10).value?.toString()?.trim() || '',
          colors: row.getCell(11).value?.toString()?.split(',').map(c => c.trim()) || [],
          sizes: row.getCell(12).value?.toString()?.split(',').map(s => s.trim()) || [],
          isActive: row.getCell(15).value?.toString()?.toLowerCase() === 'active' || true,
          isOutOfStock: row.getCell(16).value?.toString()?.toLowerCase() === 'out of stock' || false,
          featured: row.getCell(17).value?.toString()?.toLowerCase() === 'yes' || false
        };
        
        // Find category by name
        const categoryName = row.getCell(3).value?.toString()?.trim();
        if (categoryName) {
          const category = await Category.findOne({ name: new RegExp(`^${categoryName}$`, 'i') });
          if (category) {
            productData.category = category._id;
          } else {
            results.errors.push({ row: rowNumber, message: `Category "${categoryName}" not found` });
            results.failed++;
            continue;
          }
        }
        
        // Validate required fields
        if (!productData.name || !productData.price || productData.stock < 0) {
          results.errors.push({ row: rowNumber, message: 'Missing required fields' });
          results.failed++;
          continue;
        }
        
        // Create product
        const newProduct = await Product.create(productData);
        results.success++;
        
      } catch (error) {
        results.errors.push({ row: rowNumber, message: error.message });
        results.failed++;
      }
    }
    
    // Delete uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return sendSuccess(res, 'Products imported successfully', {
      imported: results.success,
      failed: results.failed,
      errors: results.errors
    });
    
  } catch (error) {
    // Delete uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Import products error:', error);
    return sendServerError(res, 'Failed to import products');
  }
});

module.exports = router;
