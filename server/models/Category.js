// Category.js - Mongoose model for blog categories

const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot be more than 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot be more than 200 characters'],
    },
    color: {
      type: String,
      default: '#3B82F6', // Default blue color
    },
    postCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create slug from name before saving
CategorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

// Static method to update post count
CategorySchema.statics.updatePostCount = async function (categoryId) {
  const Post = mongoose.model('Post');
  const count = await Post.countDocuments({ category: categoryId });
  
  await this.findByIdAndUpdate(categoryId, { postCount: count });
};

module.exports = mongoose.model('Category', CategorySchema);
