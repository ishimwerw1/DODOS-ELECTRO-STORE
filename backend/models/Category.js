import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  icon: {
    type: String,
    default: 'FaMobileAlt',
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  description: {
    type: String,
    trim: true,
  },
  subcategories: {
    type: [String],
    default: [],
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  highlightedHome: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
