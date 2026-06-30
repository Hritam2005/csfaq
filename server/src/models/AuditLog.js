import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null, // Nullable for unauthenticated actions (like failed login from unknown IP)
    },
    action: {
      type: String,
      required: true,
      index: true,
      // e.g., 'auth.login', 'auth.failed_login', 'user.create', 'role.update'
    },
    resource: {
      type: String,
      // e.g., 'User', 'Role', 'Document'
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // flexible payload detailing the change (before/after state)
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning'],
      default: 'success',
    },
  },
  {
    timestamps: true,
  }
);

// We might have many logs, so an index on timestamps is useful for time-range queries
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
