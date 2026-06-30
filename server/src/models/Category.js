import mongoose from 'mongoose';
import slugify from 'slugify';
import { VISIBILITY } from '../constants/knowledge.constants.js';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '#000000',
    },
    icon: {
      type: String,
      default: 'folder', // Default Lucide icon
    },
    visibility: {
      type: String,
      enum: Object.values(VISIBILITY),
      default: VISIBILITY.PUBLIC,
    },
    seoTitle: {
      type: String,
    },
    seoDescription: {
      type: String,
    },
    analytics: {
      views: { type: Number, default: 0 },
      documentCount: { type: Number, default: 0 },
      faqCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
categorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  });

const Category = mongoose.model('Category', categorySchema);
export default Category;
