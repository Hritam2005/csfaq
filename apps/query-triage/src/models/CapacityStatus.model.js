import mongoose from 'mongoose';

const resolverCapacitySchema = new mongoose.Schema(
  {
    resolverId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    resolverName: {
      type: String,
      required: true,
    },
    activeCases: {
      type: Number,
      default: 0,
    },
    capacityPercent: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['available', 'busy', 'overloaded', 'offline'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

const capacitySnapshotSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    totalActiveCases: {
      type: Number,
      required: true,
    },
    totalResolvers: {
      type: Number,
      required: true,
    },
    averageCapacityPercent: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['normal', 'watch', 'warning', 'overload'],
      required: true,
    },
    breachedCases: {
      type: Number,
      default: 0,
    },
    details: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const ResolverCapacity = mongoose.model('ResolverCapacity', resolverCapacitySchema);
const CapacitySnapshot = mongoose.model('CapacitySnapshot', capacitySnapshotSchema);

export { ResolverCapacity, CapacitySnapshot };
