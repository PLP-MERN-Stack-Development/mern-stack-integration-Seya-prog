// posts.js - Routes for post operations

const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  addComment,
  getMyPosts,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { validatePost, validateComment, validateMongoId, validatePagination } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Public routes - order matters! Specific routes before dynamic :id
router.get('/search', searchPosts);
router.get('/', validatePagination, getAllPosts);

// Protected routes - specific routes before :id
router.get('/my/posts', protect, getMyPosts);
router.post('/', protect, upload.single('featuredImage'), validatePost, createPost);

// Routes with :id parameter - these should come last
router.get('/:id', getPost);
router.put('/:id', protect, validateMongoId, upload.single('featuredImage'), validatePost, updatePost);
router.delete('/:id', protect, validateMongoId, deletePost);
router.post('/:id/comments', protect, validateMongoId, validateComment, addComment);

module.exports = router;
