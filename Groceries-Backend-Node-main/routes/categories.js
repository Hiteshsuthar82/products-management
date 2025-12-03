const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');
const { sendSuccess, sendError, sendValidationError, sendServerError } = require('../utils/response');
const { uploadSingle, getFileUrl, deleteFile } = require('../utils/upload');

const router = express.Router();

// @desc    Get all categories
// @route   POST /api/categories
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { isActive, level, parentId, includeChildren = false } = req.body;

    const filter = {};
    // Only filter by isActive if explicitly provided
    if (typeof isActive === 'boolean') filter.isActive = isActive;
    
    // Filter by level (0 for parent categories, 1 for subcategories)
    if (level !== undefined) {
      if (level === 0) {
        filter.parentId = null; // Parent categories
      } else if (level === 1) {
        filter.parentId = { $ne: null }; // Subcategories
      }
    }
    
    // Filter by specific parent
    if (parentId !== undefined) {
      if (parentId === null || parentId === '') {
        filter.parentId = null; // Parent categories
      } else {
        filter.parentId = parentId; // Subcategories of specific parent
      }
    }

    const categories = await Category.find(filter)
      .populate('parentId', 'name slug icon')
      .sort({ name: 1 });

    let result = categories;

    // Include children if requested
    if (includeChildren && (level === 0 || level === undefined)) {
      result = await Promise.all(categories.map(async (category) => {
        const childrenFilter = { parentId: category._id };
        // Only filter children by isActive if it was explicitly provided
        if (typeof isActive === 'boolean') childrenFilter.isActive = isActive;
        
        const children = await Category.find(childrenFilter).sort({ name: 1 });
        
        return {
          ...category.toObject(),
          children
        };
      }));
    }

    return sendSuccess(res, 'Categories retrieved successfully', {
      count: result.length,
      categories: result
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get single category
// @route   POST /api/categories/detail
// @access  Public
router.post('/detail', async (req, res) => {
  try {
    const { categoryId, slug, includeChildren = false } = req.body;

    if (!categoryId && !slug) {
      return sendError(res, 400, 'Category ID or slug is required');
    }

    const filter = {};
    if (categoryId) filter._id = categoryId;
    if (slug) filter.slug = slug;

    const category = await Category.findOne(filter)
      .populate('parentId', 'name slug icon');

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    if (!category.isActive) {
      return sendError(res, 404, 'Category not available');
    }

    let result = category;

    // Include children if requested
    if (includeChildren) {
      const children = await Category.find({ 
        parentId: category._id, 
        isActive: true 
      }).sort({ name: 1 });
      
      result = {
        ...category.toObject(),
        children
      };
    }

    return sendSuccess(res, 'Category retrieved successfully', result);
  } catch (error) {
    console.error('Get category error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get parent categories only
// @route   POST /api/categories/parents
// @access  Public
router.post('/parents', async (req, res) => {
  try {
    const { isActive } = req.body;

    const filter = { parentId: null };
    // Only filter by isActive if explicitly provided
    if (typeof isActive === 'boolean') filter.isActive = isActive;

    const categories = await Category.find(filter)
    .sort({ name: 1 });

    return sendSuccess(res, 'Parent categories retrieved successfully', {
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Get parent categories error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get subcategories by parent
// @route   POST /api/categories/children
// @access  Public
router.post('/children', async (req, res) => {
  try {
    const { parentId, isActive } = req.body;

    if (!parentId) {
      return sendError(res, 400, 'Parent ID is required');
    }

    const filter = { parentId: parentId };
    // Only filter by isActive if explicitly provided
    if (typeof isActive === 'boolean') filter.isActive = isActive;

    const categories = await Category.find(filter)
    .sort({ name: 1 });

    return sendSuccess(res, 'Subcategories retrieved successfully', {
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Create new category (Admin only)
// @route   POST /api/categories/add
// @access  Private (Admin only)
router.post('/add', protect, adminOnly, uploadSingle, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters'),
  body('slug').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Slug must be between 2 and 100 characters'),
  body('parentId').optional().isMongoId().withMessage('Valid parent ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const {
      name,
      slug,
      parentId = null
    } = req.body;

    // Validate parent category if provided
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return sendError(res, 404, 'Parent category not found');
      }
      if (parentCategory.parentId) {
        return sendError(res, 400, 'Cannot create subcategory of a subcategory. Only 2 levels allowed.');
      }
    }

    // Check if category already exists in the same parent
    const existingCategory = await Category.findOne({
      name: name,
      parentId: parentId
    });

    if (existingCategory) {
      return sendError(res, 400, 'Category with this name already exists in the same level');
    }

    // Handle image upload
    let icon = '';
    if (req.file) {
      icon = getFileUrl(req, req.file.filename);
    }

    // Auto-generate unique code: CAT-<PARENT or ROOT>-<RAND6>
    const codePrefix = parentId ? 'SUB' : 'CAT';
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const generatedCode = `${codePrefix}-${randomSuffix}`;

    // Ensure code collision-free (extremely unlikely, but double-check once)
    const existingCode = await Category.findOne({ code: generatedCode });
    if (existingCode) {
      return sendError(res, 409, 'Collision on generated category code, please retry');
    }

    const categoryData = {
      code: generatedCode,
      name,
      slug,
      icon,
      parentId
    };

    const category = await Category.create(categoryData);

    return sendSuccess(res, 'Category created successfully', category);
  } catch (error) {
    console.error('Create category error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Update category (Admin only)
// @route   POST /api/categories/update
// @access  Private (Admin only)
router.post('/update', protect, adminOnly, uploadSingle, [
  body('categoryId').isMongoId().withMessage('Valid category ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { categoryId } = req.body;

    const category = await Category.findById(categoryId);

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    const fieldsToUpdate = {
      name: req.body.name,
      slug: req.body.slug,
      parentId: req.body.parentId,
      isActive: req.body.isActive
    };

    // Handle image upload
    if (req.file) {
      // Delete old image if it exists
      if (category.icon) {
        const oldFilename = category.icon.split('/').pop();
        deleteFile(oldFilename);
      }
      fieldsToUpdate.icon = getFileUrl(req, req.file.filename);
    }

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    return sendSuccess(res, 'Category updated successfully', updatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Delete category (Admin only)
// @route   POST /api/categories/delete
// @access  Private (Admin only)
router.post('/delete', protect, adminOnly, async (req, res) => {
  try {
    const { categoryId } = req.body;

    if (!categoryId) {
      return sendError(res, 400, 'Category ID is required');
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    // Check if category has products
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ category: categoryId });

    if (productCount > 0) {
      return sendError(res, 400, `Cannot delete category. It has ${productCount} products. Please move or delete products first.`);
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parentId: categoryId });

    if (subcategoryCount > 0) {
      return sendError(res, 400, `Cannot delete category. It has ${subcategoryCount} subcategories. Please delete subcategories first.`);
    }

    // Delete associated image file if it exists
    if (category.icon) {
      const filename = category.icon.split('/').pop();
      deleteFile(filename);
    }

    // Soft delete - set isActive to false
    category.isActive = false;
    await category.save();

    return sendSuccess(res, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Toggle category status (Admin only)
// @route   POST /api/categories/toggle-status
// @access  Private (Admin only)
router.post('/toggle-status', protect, adminOnly, [
  body('categoryId').isMongoId().withMessage('Valid category ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { categoryId } = req.body;

    const category = await Category.findById(categoryId);

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    category.isActive = !category.isActive;
    await category.save();

    return sendSuccess(res, 'Category status updated successfully', category);
  } catch (error) {
    console.error('Toggle category status error:', error);
    return sendServerError(res, 'Server error');
  }
});

// @desc    Get category statistics (Admin only)
// @route   POST /api/categories/stats
// @access  Private (Admin only)
router.post('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });
    
    const parentCategories = await Category.countDocuments({ parentId: null });
    const subcategories = await Category.countDocuments({ parentId: { $ne: null } });

    const categoriesWithProducts = await Category.countDocuments({ productCount: { $gt: 0 } });
    const categoriesWithoutProducts = await Category.countDocuments({ productCount: 0 });

    return sendSuccess(res, 'Category statistics retrieved successfully', {
      total: totalCategories,
      active: activeCategories,
      parentCategories,
      subcategories,
      withProducts: categoriesWithProducts,
      withoutProducts: categoriesWithoutProducts
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    return sendServerError(res, 'Server error');
  }
});

router.get('/export', protect, adminOnly, async (req, res) => {
  try {
    const ExcelJS = require('exceljs');

    // Fetch all categories with parent info
    const categories = await Category.find()
      .populate('parentId', 'name slug')
      .sort({ createdAt: -1 });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Categories');

    // Define columns (Code is optional - will be auto-generated)
    worksheet.columns = [
      { header: 'Category Name', key: 'name', width: 30 },
      { header: 'Slug', key: 'slug', width: 25 },
      { header: 'Parent Category', key: 'parent', width: 25 }
    ];

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add rows
    if (categories.length > 0) {
      categories.forEach(cat => {
        worksheet.addRow({
          name: cat.name,
          slug: cat.slug,
          parent: cat.parentId?.name || '—'
        });
      });
    } else {
      // Add sample data when no categories exist
      worksheet.addRow({
        name: 'Electronics',
        slug: 'electronics',
        parent: '—'
      });
      worksheet.addRow({
        name: 'Mobile Phones',
        slug: 'mobile-phones',
        parent: 'Electronics'
      });
      worksheet.addRow({
        name: 'Laptops',
        slug: 'laptops',
        parent: 'Electronics'
      });
      worksheet.addRow({
        name: 'Grocery',
        slug: 'grocery',
        parent: '—'
      });
      worksheet.addRow({
        name: 'Fruits',
        slug: 'fruits',
        parent: 'Grocery'
      });
    }

    // Set filename
    const filename = `categories_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export categories error:', error);
    return sendServerError(res, 'Failed to export categories');
  }
});

// @desc    Import categories from Excel
// @route   POST /api/categories/import
// @access  Admin

// Configure multer for Excel files
const uploadExcelCategories = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed!'), false);
    }
  }
}).single('file');

router.post('/import', protect, adminOnly, uploadExcelCategories, async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded');
    }
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1);
    
    const results = { success: 0, failed: 0, errors: [] };
    
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      try {
        const categoryName = row.getCell(1).value?.toString()?.trim();
        const slugFromSheet = row.getCell(2).value?.toString()?.trim();
        const parentName = row.getCell(3).value?.toString()?.trim();
        
        if (!categoryName) {
          results.errors.push({ row: rowNumber, message: 'Missing category name' });
          results.failed++;
          continue;
        }
        
        // Resolve parent first
        let parentId = null;
        if (parentName) {
          const parent = await Category.findOne({ name: new RegExp(`^${parentName}$`, 'i') });
          if (parent) {
            parentId = parent._id;
          }
        }

        const slug = slugFromSheet || categoryName.toLowerCase().replace(/\s+/g, '-');

        // Code will be auto-generated by the pre-save hook in the model, no need to pass it
        await Category.create({
          name: categoryName,
          slug,
          parentId,
          isActive: true
        });
        
        results.success++;
      } catch (error) {
        results.errors.push({ row: rowNumber, message: error.message });
        results.failed++;
      }
    }
    
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    
    // Determine success message based on results
    let message = 'Categories imported successfully';
    if (results.success === 0 && results.failed > 0) {
      message = 'No categories were imported. Some categories already exist or have invalid data.';
    } else if (results.success > 0 && results.failed > 0) {
      message = `Imported ${results.success} category/categories successfully. Some categories already exist or have invalid data.`;
    }
    
    return sendSuccess(res, message, {
      imported: results.success,
      failed: results.failed,
      errors: results.errors
    });
    
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Import categories error:', error);
    return sendServerError(res, 'Failed to import categories');
  }
});

module.exports = router;
