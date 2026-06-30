import mongoose from 'mongoose';
import { SEARCH_INTENTS } from './Search.constants.js';

const searchLogSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    normalizedQuery: {
      type: String,
      trim: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    intent: {
      type: String,
      enum: Object.values(SEARCH_INTENTS),
      default: SEARCH_INTENTS.UNKNOWN,
    },
    filtersUsed: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    resultCount: {
      type: Number,
      default: 0,
    },
    zeroResults: {
      type: Boolean,
      default: false,
      index: true,
    },
    responseTimeMs: {
      type: Number,
      required: true,
    },
    cacheHit: {
      type: Boolean,
      default: false,
    },
    clickedResultId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    clickPosition: {
      type: Number,
      default: null,
    },
    sessionToken: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

// Indexes for analytics aggregations
searchLogSchema.index({ createdAt: -1 });
searchLogSchema.index({ query: 1, createdAt: -1 }); // Trending searches

export const SearchLog = mongoose.model('SearchLog', searchLogSchema);
