import mongoose from 'mongoose';
import { ActorType } from './QueryCase.model.js';

const queryAuditEventSchema = new mongoose.Schema(
  {
    queryCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QueryCase',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    actorType: {
      type: String,
      enum: Object.values(ActorType),
      required: true,
    },
    actorId: {
      type: String,
      index: true,
    },
    fromStatus: {
      type: String,
    },
    toStatus: {
      type: String,
    },
    reasonCodes: [{
      type: String,
    }],
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying audit trail efficiently
queryAuditEventSchema.index({ queryCaseId: 1, createdAt: -1 });
queryAuditEventSchema.index({ actorId: 1, createdAt: -1 });
queryAuditEventSchema.index({ eventType: 1, createdAt: -1 });

const QueryAuditEvent = mongoose.model('QueryAuditEvent', queryAuditEventSchema);

export default QueryAuditEvent;
