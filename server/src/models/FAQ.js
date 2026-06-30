import mongoose from 'mongoose';
import slugify from 'slugify';
import { APPROVAL_STATUS, VISIBILITY, DIFFICULTY } from '../constants/knowledge.constants.js';

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      trim: true,
      maxLength: 300,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        index: true,
      },
    ],
    keywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    relatedFaqs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FAQ',
      },
    ],
    difficultyLevel: {
      type: String,
      enum: Object.values(DIFFICULTY),
      default: DIFFICULTY.BEGINNER,
    },
    estimatedReadingTime: {
      type: Number, // In minutes
      default: 1,
    },
    popularityScore: {
      type: Number,
      default: 0,
      index: -1,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    unhelpfulCount: {
      type: Number,
      default: 0,
    },
    bookmarkCount: {
      type: Number,
      default: 0,
    },
    searchCount: {
      type: Number,
      default: 0,
    },
    aiConfidence: {
      type: Number, // 0 to 1 score if AI generated/evaluated
      default: 1,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(APPROVAL_STATUS),
      default: APPROVAL_STATUS.DRAFT,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    visibility: {
      type: String,
      enum: Object.values(VISIBILITY),
      default: VISIBILITY.PUBLIC,
      index: true,
    },
    sourceDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeDocument', // Link to the original document if extracted by AI
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: -1,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Text Index for Keyword and Semantic Hybrid Search
faqSchema.index({ question: 'text', answer: 'text', keywords: 'text' });

// Auto-generate slug
faqSchema.pre('save', function () {
  if (this.isModified('question')) {
    this.slug = slugify(this.question, { lower: true, strict: true }) + '-' + Date.now().toString().slice(-4);
  }
  });

// Soft delete filtering
faqSchema.pre(/^find/, function () {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
  });

const FAQ = mongoose.model('FAQ', faqSchema);
export default FAQ;
