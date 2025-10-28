// categories.js - Routes for category operations

const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { validateCategory, validateMongoId } = require('../middleware/validation');

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategory);

// Protected routes (Admin only for creating, updating, deleting categories)
router.post('/', protect, authorize('admin'), validateCategory, createCategory);
router.put('/:id', protect, authorize('admin'), validateMongoId, validateCategory, updateCategory);
router.delete('/:id', protect, authorize('admin'), validateMongoId, deleteCategory);

module.exports = router;
