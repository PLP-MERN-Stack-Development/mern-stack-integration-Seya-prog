// postController.js - Controller for post-related operations

const Post = require('../models/Post');
const Category = require('../models/Category');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Get all posts with pagination and filtering
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by published status
    if (req.query.published !== undefined) {
      query.isPublished = req.query.published === 'true';
    } else {
      // Default to only published posts for public access
      query.isPublished = true;
    }

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    // Execute query with pagination
    const posts = await Post.find(query)
      .populate('author', 'name email avatar')
      .populate('category', 'name slug color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post by ID or slug
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    let post;

    // Check if it's a MongoDB ObjectId or slug
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(req.params.id)
        .populate('author', 'name email avatar bio')
        .populate('category', 'name slug color')
        .populate('comments.user', 'name avatar');
    } else {
      post = await Post.findOne({ slug: req.params.id })
        .populate('author', 'name email avatar bio')
        .populate('category', 'name slug color')
        .populate('comments.user', 'name avatar');
    }

    if (!post) {
      return next(new ErrorResponse('Post not found', 404));
    }

    // Increment view count
    await post.incrementViewCount();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.author = req.user.id;

    // Handle featured image upload
    if (req.file) {
      req.body.featuredImage = req.file.filename;
    }

    const post = await Post.create(req.body);

    // Update category post count
    await Category.updatePostCount(post.category);

    // Populate before sending response
    await post.populate('author', 'name email avatar');
    await post.populate('category', 'name slug color');

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse('Post not found', 404));
    }

    // Make sure user is post owner or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this post', 403));
    }

    // Handle featured image upload
    if (req.file) {
      req.body.featuredImage = req.file.filename;
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('author', 'name email avatar')
      .populate('category', 'name slug color');

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse('Post not found', 404));
    }

    // Make sure user is post owner or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this post', 403));
    }

    const categoryId = post.category;

    await post.deleteOne();

    // Update category post count
    await Category.updatePostCount(categoryId);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Search posts
// @route   GET /api/posts/search
// @access  Public
exports.searchPosts = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return next(new ErrorResponse('Please provide a search query', 400));
    }

    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ],
      isPublished: true,
    })
      .populate('author', 'name email avatar')
      .populate('category', 'name slug color')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse('Post not found', 404));
    }

    await post.addComment(req.user.id, req.body.content);

    await post.populate('comments.user', 'name avatar');

    res.status(201).json({
      success: true,
      data: post.comments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's own posts
// @route   GET /api/posts/my/posts
// @access  Private
exports.getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .populate('category', 'name slug color')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};
