import mongoose from 'mongoose';
import { CONVERSATION_STATUS } from './AI.constants.js';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['system', 'user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tokens: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  citations: {
    type: [mongoose.Schema.Types.Mixed], // Array of Citation objects
    default: [],
  },
});

const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'New Conversation',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messages: [messageSchema],
    status: {
      type: String,
      enum: Object.values(CONVERSATION_STATUS),
      default: CONVERSATION_STATUS.ACTIVE,
    },
    summary: {
      type: String,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
conversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);

// AI Analytics Schema for tracking provider costs, latency, tokens
const aiAnalyticsLogSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    provider: { type: String, required: true },
    model: { type: String, required: true },
    promptTokens: { type: Number, required: true },
    completionTokens: { type: Number, required: true },
    totalTokens: { type: Number, required: true },
    costUsd: { type: Number, default: 0 },
    latencyMs: { type: Number, required: true },
    retrievalLatencyMs: { type: Number, default: 0 },
    isStreaming: { type: Boolean, default: false },
    wasRateLimited: { type: Boolean, default: false },
    hadHallucination: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AIAnalyticsLog = mongoose.model('AIAnalyticsLog', aiAnalyticsLogSchema);
