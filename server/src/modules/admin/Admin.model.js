import mongoose from 'mongoose';
import { AUDIT_ACTIONS, BACKUP_STATUS } from './Admin.constants.js';

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: Object.values(AUDIT_ACTIONS), required: true },
  resource: { type: String }, // e.g., 'SystemConfig', 'User:123'
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now, index: true }
});

const systemConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String },
  isSensitive: { type: Boolean, default: false }, // If true, mask in UI
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

const featureFlagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  isEnabled: { type: Boolean, default: false },
  rolloutPercentage: { type: Number, default: 100, min: 0, max: 100 },
  allowedRoles: [{ type: String }],
  description: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

const backupSchema = new mongoose.Schema({
  type: { type: String, enum: ['FULL', 'CONFIG', 'KNOWLEDGE'], required: true },
  status: { type: String, enum: Object.values(BACKUP_STATUS), default: BACKUP_STATUS.PENDING },
  filePath: { type: String },
  sizeBytes: { type: Number },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', systemConfigSchema);
export const FeatureFlag = mongoose.models.FeatureFlag || mongoose.model('FeatureFlag', featureFlagSchema);
export const Backup = mongoose.models.Backup || mongoose.model('Backup', backupSchema);
