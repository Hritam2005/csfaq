import mongoose from 'mongoose';
import slugify from 'slugify';
import { DOCUMENT_STATUS, APPROVAL_STATUS } from '../constants/knowledge.constants.js';

const knowledgeDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
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
    author: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    version: {
      type: Number,
      default: 1,
    },
    language: {
      type: String,
      default: 'en',
    },
    pages: {
      type: Number,
      default: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.UPLOADING,
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(APPROVAL_STATUS),
      default: APPROVAL_STATUS.DRAFT,
      index: true,
    },
    checksum: {
      type: String, // MD5 or SHA-256 hash to prevent duplicates
      unique: true,
      sparse: true,
    },
    storagePath: {
      type: String, // Path in S3 or local disk
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    metadata: {
      type: Map,
      of: String, // Flexible key-value pairs for document-specific data (e.g., sourceUrl, internalId)
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Text Index for Basic Keyword Search (Semantic Search handles the rest)
knowledgeDocumentSchema.index({ title: 'text', description: 'text' });

knowledgeDocumentSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString().slice(-4);
  }
  });

knowledgeDocumentSchema.pre(/^find/, function () {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
  });

const KnowledgeDocument = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
export default KnowledgeDocument;
